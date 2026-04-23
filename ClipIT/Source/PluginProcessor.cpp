#include "PluginProcessor.h"
#include "PluginEditor.h"

ClipITAudioProcessor::ClipITAudioProcessor()
    : AudioProcessor(BusesProperties().withInput("Input",  juce::AudioChannelSet::stereo(), true)
                                      .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
      apvts(*this, nullptr, "PARAMETERS", ClipITParams::createLayout())
{
}

void ClipITAudioProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    currentSampleRate = sampleRate;
    const int numCh = getTotalNumInputChannels();

    // Initialize smoothing state from current parameter values.
    prevInputGainLin  = juce::Decibels::decibelsToGain(apvts.getRawParameterValue(ClipITParams::inputGain)->load());
    prevOutputGainLin = juce::Decibels::decibelsToGain(apvts.getRawParameterValue(ClipITParams::outputGain)->load());
    prevCeilingLin    = juce::Decibels::decibelsToGain(apvts.getRawParameterValue(ClipITParams::ceiling)->load());
    prevKneePercent   = apvts.getRawParameterValue(ClipITParams::knee)->load();
    prevModeVoice     = apvts.getRawParameterValue(ClipITParams::softVoice)->load();
    prevLoudnessMakeupLin = 1.0f;

    // Build all oversamplers up-front — no runtime allocation in processBlock
    for (int i = 0; i < 3; i++)
    {
        oversamplers[i] = std::make_unique<juce::dsp::Oversampling<float>>(
            numCh, i + 1,   // stages: 1=2x, 2=4x, 3=8x
            juce::dsp::Oversampling<float>::filterHalfBandPolyphaseIIR, true, false);
        oversamplers[i]->initProcessing(static_cast<size_t>(samplesPerBlock));
    }

    truePeakOversampler = std::make_unique<juce::dsp::Oversampling<float>>(
        numCh, 2, // 4x detector
        juce::dsp::Oversampling<float>::filterHalfBandPolyphaseIIR, true, false);
    truePeakOversampler->initProcessing(static_cast<size_t>(samplesPerBlock));

    dryBuffer.setSize(numCh, samplesPerBlock);
    truePeakProbeBuffer.setSize(numCh, samplesPerBlock);
}

void ClipITAudioProcessor::releaseResources()
{
    for (auto& os : oversamplers) os.reset();
    truePeakOversampler.reset();
}

bool ClipITAudioProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    return layouts.getMainInputChannelSet()  == juce::AudioChannelSet::stereo()
        && layouts.getMainOutputChannelSet() == juce::AudioChannelSet::stereo();
}

// ---------------------------------------------------------------------------
// Clipping algorithms
// ---------------------------------------------------------------------------
float ClipITAudioProcessor::applyClip(float x, float ceiling, float kneePercent, int mode, float modeVoice) noexcept
{
    if (ceiling < 1e-7f) return 0.0f;

    const float voice = juce::jlimit(0.0f, 1.0f, modeVoice / 100.0f);
    const float sign = (x >= 0.0f) ? 1.0f : -1.0f;
    const float absX = std::abs(x);

    switch (mode)
    {
        case 1: // Hard — simple clamp
        {
            if (voice <= 0.0001f)
                return juce::jlimit(-ceiling, ceiling, x);

            // Higher voice adds an edge-rounding zone near the threshold.
            const float kneeStart = ceiling * (1.0f - 0.35f * voice);
            if (absX <= kneeStart) return x;
            if (absX >= ceiling)   return sign * ceiling;
            const float t = (absX - kneeStart) / (ceiling - kneeStart + 1e-9f);
            const float s = t * t * (3.0f - 2.0f * t);
            return sign * (kneeStart + s * (ceiling - kneeStart));
        }

        case 0: // Soft — tanh waveshaper
        {
            // k controls softness: knee=0 -> k=1 (tightest), knee=100 -> k=5 (most gradual)
            const float k     = 1.0f + (kneePercent / 100.0f) * 4.0f;
            const float xn    = x / ceiling;

            const float tanhK = std::tanh(k + voice * 1.5f);
            const float yTanh = std::tanh(xn * (k + voice * 1.5f)) / (tanhK + 1e-9f);

            const float aK    = std::atan(k + voice * 2.0f);
            const float yAtan = std::atan(xn * (k + voice * 2.0f)) / (aK + 1e-9f);

            const float voiced = yTanh + (yAtan - yTanh) * voice;
            return voiced * ceiling;
        }

        case 2: // Hybrid — linear → smoothstep knee → hard ceiling
        {
            const float kneeStart = ceiling * (1.0f - (kneePercent / 100.0f) * (0.45f + 0.35f * voice));
            if (absX <= kneeStart) return x;
            if (absX >= ceiling)   return sign * ceiling;
            const float t = (absX - kneeStart) / (ceiling - kneeStart + 1e-9f);
            const float smooth = t * t * (3.0f - 2.0f * t);
            const float sigmoid = 1.0f / (1.0f + std::exp(-10.0f * (t - 0.5f)));
            const float s = smooth + (sigmoid - smooth) * voice;
            return sign * (kneeStart + s * (ceiling - kneeStart));
        }

        default: return x;
    }
}

// ---------------------------------------------------------------------------
// Main process block
// ---------------------------------------------------------------------------
void ClipITAudioProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals noDenormals;

    const int numSamples  = buffer.getNumSamples();
    const int numChannels = buffer.getNumChannels();
    if (numChannels == 0 || numSamples == 0) return;

    // Read parameters (atomic loads, safe on audio thread)
    const float inputGainDb  = apvts.getRawParameterValue(ClipITParams::inputGain)->load();
    const float outputGainDb = apvts.getRawParameterValue(ClipITParams::outputGain)->load();
    const float ceilingDb    = apvts.getRawParameterValue(ClipITParams::ceiling)->load();
    const float kneePercent  = apvts.getRawParameterValue(ClipITParams::knee)->load();
    const int   clipModeIdx  = static_cast<int>(apvts.getRawParameterValue(ClipITParams::clipMode)->load());
    const int   osChoice     = static_cast<int>(apvts.getRawParameterValue(ClipITParams::oversampling)->load());
    const bool  hardSafety   = apvts.getRawParameterValue(ClipITParams::hardClip)->load()  > 0.5f;
    const bool  delta        = apvts.getRawParameterValue(ClipITParams::deltaSolo)->load() > 0.5f;
    const float loudnessComp = apvts.getRawParameterValue(ClipITParams::loudnessComp)->load();
    const bool  tpSafetyOn   = apvts.getRawParameterValue(ClipITParams::truePeakSafety)->load() > 0.5f;
    const float tpCeilingDb  = apvts.getRawParameterValue(ClipITParams::truePeakCeiling)->load();

    const float softVoice    = apvts.getRawParameterValue(ClipITParams::softVoice)->load();
    const float hardVoice    = apvts.getRawParameterValue(ClipITParams::hardVoice)->load();
    const float hybridVoice  = apvts.getRawParameterValue(ClipITParams::hybridVoice)->load();
    const float modeVoice    = clipModeIdx == 0 ? softVoice : (clipModeIdx == 1 ? hardVoice : hybridVoice);

    const float inputGainLin  = juce::Decibels::decibelsToGain(inputGainDb);
    const float outputGainLin = juce::Decibels::decibelsToGain(outputGainDb);
    const float ceiling       = juce::Decibels::decibelsToGain(ceilingDb);
    const float tpCeilingLin  = juce::Decibels::decibelsToGain(tpCeilingDb);

    // --- Input gain (ramped for click-free automation) ---
    for (int ch = 0; ch < numChannels; ch++)
        buffer.applyGainRamp(ch, 0, numSamples, prevInputGainLin, inputGainLin);

    // --- Measure pre-clip input peak ---
    auto measurePeak = [](const float* data, int n) noexcept -> float {
        float pk = 0.0f;
        for (int i = 0; i < n; i++) pk = std::max(pk, std::abs(data[i]));
        return pk;
    };
    const float inL = measurePeak(buffer.getReadPointer(0), numSamples);
    const float inR = numChannels > 1 ? measurePeak(buffer.getReadPointer(1), numSamples) : inL;

    // --- Save dry signal for delta solo ---
    if (delta && dryBuffer.getNumSamples() >= numSamples)
        for (int ch = 0; ch < numChannels; ch++)
            dryBuffer.copyFrom(ch, 0, buffer, ch, 0, numSamples);

    // --- Clipping (with or without oversampling) ---
    float maxGR = 0.0f;
    double sumAbsIn = 0.0;
    double sumAbsOut = 0.0;

    auto processClipping = [&](float* data, int n,
                               float startCeiling, float endCeiling,
                               float startKnee, float endKnee,
                               float startVoice, float endVoice) noexcept {
        const float denom = static_cast<float>(juce::jmax(1, n - 1));
        for (int i = 0; i < n; i++)
        {
            const float t    = static_cast<float>(i) / denom;
            const float cNow = startCeiling + (endCeiling - startCeiling) * t;
            const float kNow = startKnee    + (endKnee    - startKnee)    * t;
            const float vNow = startVoice   + (endVoice   - startVoice)   * t;
            const float x    = data[i];
            const float y    = applyClip(x, cNow, kNow, clipModeIdx, vNow);
            const float absX = std::abs(x);
            if (absX > 1e-7f)
                maxGR = std::max(maxGR, 1.0f - std::abs(y) / absX);
            sumAbsIn  += absX;
            sumAbsOut += std::abs(y);
            data[i] = y;
        }
    };

    if (osChoice > 0 && osChoice <= 3 && oversamplers[osChoice - 1] != nullptr)
    {
        juce::dsp::AudioBlock<float> inputBlock(buffer);
        auto oversampledBlock = oversamplers[osChoice - 1]->processSamplesUp(inputBlock);
        for (int ch = 0; ch < static_cast<int>(oversampledBlock.getNumChannels()); ch++)
            processClipping(oversampledBlock.getChannelPointer(ch),
                            static_cast<int>(oversampledBlock.getNumSamples()),
                            prevCeilingLin, ceiling,
                            prevKneePercent, kneePercent,
                            prevModeVoice, modeVoice);
        oversamplers[osChoice - 1]->processSamplesDown(inputBlock);
    }
    else
    {
        for (int ch = 0; ch < numChannels; ch++)
            processClipping(buffer.getWritePointer(ch), numSamples,
                            prevCeilingLin, ceiling,
                            prevKneePercent, kneePercent,
                            prevModeVoice, modeVoice);
    }

    // --- Hard clip safety ceiling at 0 dBFS ---
    if (hardSafety)
        for (int ch = 0; ch < numChannels; ch++)
        {
            float* d = buffer.getWritePointer(ch);
            for (int i = 0; i < numSamples; i++)
                d[i] = juce::jlimit(-1.0f, 1.0f, d[i]);
        }

    // --- Delta solo: output = dry - wet (hear what was removed) ---
    if (delta && dryBuffer.getNumSamples() >= numSamples)
        for (int ch = 0; ch < numChannels; ch++)
        {
            const float* dry = dryBuffer.getReadPointer(ch);
            float*       wet = buffer.getWritePointer(ch);
            for (int i = 0; i < numSamples; i++)
                wet[i] = dry[i] - wet[i];
        }

    // --- Loudness compensation tied to measured clipping reduction ---
    if (!delta && loudnessComp > 0.001f)
    {
        const double ratio = sumAbsIn > 1e-9 ? (sumAbsOut / sumAbsIn) : 1.0;
        const float grRatio = juce::jlimit(1.0e-4f, 1.0f, static_cast<float>(ratio));
        const float reductionDb = -juce::Decibels::gainToDecibels(grRatio);
        const float targetMakeupDb = juce::jlimit(0.0f, 18.0f, reductionDb * (loudnessComp / 100.0f));
        const float targetMakeupLin = juce::Decibels::decibelsToGain(targetMakeupDb);

        for (int ch = 0; ch < numChannels; ch++)
            buffer.applyGainRamp(ch, 0, numSamples, prevLoudnessMakeupLin, targetMakeupLin);

        prevLoudnessMakeupLin = targetMakeupLin;
    }
    else
    {
        prevLoudnessMakeupLin = 1.0f;
    }

    // --- True-peak safety after downsampling and processing ---
    if (tpSafetyOn && truePeakOversampler != nullptr && truePeakProbeBuffer.getNumSamples() >= numSamples)
    {
        for (int ch = 0; ch < numChannels; ch++)
            truePeakProbeBuffer.copyFrom(ch, 0, buffer, ch, 0, numSamples);

        juce::dsp::AudioBlock<float> probeBlock(truePeakProbeBuffer);
        auto up = truePeakOversampler->processSamplesUp(probeBlock);

        float tpPeak = 0.0f;
        for (int ch = 0; ch < static_cast<int>(up.getNumChannels()); ch++)
        {
            const float* d = up.getChannelPointer(ch);
            const int n = static_cast<int>(up.getNumSamples());
            for (int i = 0; i < n; i++)
                tpPeak = std::max(tpPeak, std::abs(d[i]));
        }

        if (tpPeak > tpCeilingLin)
        {
            const float scale = juce::jmax(0.0f, tpCeilingLin / (tpPeak + 1e-9f));
            buffer.applyGain(scale);
        }

        // Final sample-peak guard at TP ceiling.
        for (int ch = 0; ch < numChannels; ch++)
        {
            float* d = buffer.getWritePointer(ch);
            for (int i = 0; i < numSamples; i++)
                d[i] = juce::jlimit(-tpCeilingLin, tpCeilingLin, d[i]);
        }
    }

    // --- Output gain (ramped for click-free automation) ---
    for (int ch = 0; ch < numChannels; ch++)
        buffer.applyGainRamp(ch, 0, numSamples, prevOutputGainLin, outputGainLin);

    // --- Measure post-clip output peak ---
    const float outL = measurePeak(buffer.getReadPointer(0), numSamples);
    const float outR = numChannels > 1 ? measurePeak(buffer.getReadPointer(1), numSamples) : outL;

    // --- Meter ballistics (audio thread, no atomics in the hot path) ---
    auto smooth = [](float& stored, float val) noexcept {
        stored = (val > stored) ? (0.6f * stored + 0.4f * val) : (0.97f * stored);
    };
    smooth(inPeakL,  inL);   smooth(inPeakR,  inR);
    smooth(outPeakL, outL);  smooth(outPeakR, outR);
    smooth(grPeak,   maxGR);

    inputLevelL.store(inPeakL);
    inputLevelR.store(inPeakR);
    outputLevelL.store(outPeakL);
    outputLevelR.store(outPeakR);
    gainReduction.store(grPeak);

    // Carry target values forward for next block's ramps.
    prevInputGainLin  = inputGainLin;
    prevOutputGainLin = outputGainLin;
    prevCeilingLin    = ceiling;
    prevKneePercent   = kneePercent;
    prevModeVoice     = modeVoice;
}

juce::AudioProcessorEditor* ClipITAudioProcessor::createEditor()
{
    return new ClipITAudioProcessorEditor(*this);
}

void ClipITAudioProcessor::getStateInformation(juce::MemoryBlock& destData)
{
    if (auto xml = apvts.copyState().createXml())
        copyXmlToBinary(*xml, destData);
}

void ClipITAudioProcessor::setStateInformation(const void* data, int sizeInBytes)
{
    if (auto xml = getXmlFromBinary(data, sizeInBytes))
        apvts.replaceState(juce::ValueTree::fromXml(*xml));
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new ClipITAudioProcessor();
}
