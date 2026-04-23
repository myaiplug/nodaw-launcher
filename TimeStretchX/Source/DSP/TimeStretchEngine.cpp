/*
  ==============================================================================

    TimeStretchEngine.cpp
    Core DSP engine implementation
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#include "TimeStretchEngine.h"

//==============================================================================
TimeStretchEngine::TimeStretchEngine()
{
}

TimeStretchEngine::~TimeStretchEngine()
{
}

//==============================================================================
void TimeStretchEngine::prepare(double sampleRate, int samplesPerBlock, int numChannels)
{
    currentSampleRate = sampleRate;
    currentBlockSize = samplesPerBlock;
    currentNumChannels = numChannels;
    isPrepared = true;

    // Apply quality settings before allocation so FFT/buffers are sized correctly.
    phaseVocoder.setQuality(qualityLevel);
    
    // Prepare all processors
    phaseVocoder.prepare(sampleRate, samplesPerBlock, numChannels);
    granular.prepare(sampleRate, samplesPerBlock, numChannels);
    wsola.prepare(sampleRate, samplesPerBlock, numChannels);

    granular.setGrainSize(grainSizeMs);
    granular.setGrainDensity(grainDensity);
}

void TimeStretchEngine::reset()
{
    phaseVocoder.reset();
    granular.reset();
    wsola.reset();
}

void TimeStretchEngine::process(juce::AudioBuffer<float>& buffer)
{
    // Calculate effective pitch shift
    float effectivePitchShift = pitchShiftSemitones;
    
    // If key lock is disabled, pitch follows time stretch naturally
    if (!keyLockEnabled && std::abs(timeStretchRatio - 1.0f) > 0.001f)
    {
        // Natural pitch shift from time stretching
        float naturalPitchShift = -12.0f * std::log2(timeStretchRatio);
        effectivePitchShift += naturalPitchShift;
    }
    
    // Process with selected algorithm
    switch (currentAlgorithm)
    {
        case PhaseVocoder:
            phaseVocoder.process(buffer, timeStretchRatio, effectivePitchShift);
            break;
            
        case Granular:
            granular.process(buffer, timeStretchRatio, effectivePitchShift);
            break;
            
        case WSOLA:
            wsola.process(buffer, timeStretchRatio);
            // WSOLA doesn't do pitch shift, would need resampling
            break;
            
        default:
            break;
    }

    // Apply a transparent soft limiter stage to tame occasional overs from
    // resynthesis without introducing hard digital clipping.
    constexpr float threshold = 0.96f;
    constexpr float knee = 4.0f;
    for (int ch = 0; ch < buffer.getNumChannels(); ++ch)
    {
        float* data = buffer.getWritePointer(ch);
        for (int i = 0; i < buffer.getNumSamples(); ++i)
        {
            float x = data[i];
            const float a = std::abs(x);
            if (a > threshold)
            {
                const float over = a - threshold;
                const float shaped = threshold + std::tanh(over * knee) / knee;
                x = std::copysign(shaped, x);
            }
            data[i] = juce::jlimit(-1.0f, 1.0f, x);
        }
    }
}

juce::AudioBuffer<float> TimeStretchEngine::processOffline(
    const juce::AudioBuffer<float>& input,
    std::function<void(float)> progressCallback)
{
    const int inputSamples = input.getNumSamples();
    const int outputSamples = static_cast<int>(inputSamples * timeStretchRatio);
    const int numChannels = input.getNumChannels();
    
    juce::AudioBuffer<float> output(numChannels, outputSamples);
    output.clear();
    
    // Process in blocks
    const int blockSize = 1024;
    juce::AudioBuffer<float> tempBuffer(numChannels, blockSize);
    
    reset();
    
    int inputPos = 0;
    int outputPos = 0;
    
    while (inputPos < inputSamples && outputPos < outputSamples)
    {
        // Copy input block
        const int samplesToProcess = juce::jmin(blockSize, inputSamples - inputPos);
        
        for (int ch = 0; ch < numChannels; ++ch)
        {
            tempBuffer.copyFrom(ch, 0, input, ch, inputPos, samplesToProcess);
            
            // Zero-pad if needed
            if (samplesToProcess < blockSize)
                tempBuffer.clear(ch, samplesToProcess, blockSize - samplesToProcess);
        }
        
        // Process
        process(tempBuffer);
        
        // Copy to output
        const int samplesToWrite = juce::jmin(
            static_cast<int>(samplesToProcess * timeStretchRatio),
            outputSamples - outputPos
        );
        
        for (int ch = 0; ch < numChannels; ++ch)
        {
            output.copyFrom(ch, outputPos, tempBuffer, ch, 0, samplesToWrite);
        }
        
        inputPos += samplesToProcess;
        outputPos += samplesToWrite;
        
        // Report progress
        if (progressCallback)
        {
            progressCallback(static_cast<float>(inputPos) / static_cast<float>(inputSamples));
        }
    }
    
    return output;
}

//==============================================================================
void TimeStretchEngine::setTimeStretch(float ratio)
{
    timeStretchRatio = juce::jlimit(0.25f, 4.0f, ratio);
}

void TimeStretchEngine::setPitchShift(float semitones)
{
    pitchShiftSemitones = juce::jlimit(-24.0f, 24.0f, semitones);
}

void TimeStretchEngine::setFormantShift(float semitones)
{
    formantShiftSemitones = juce::jlimit(-12.0f, 12.0f, semitones);
}

void TimeStretchEngine::setAlgorithm(int algorithmIndex)
{
    currentAlgorithm = juce::jlimit(0, 2, algorithmIndex);
}

void TimeStretchEngine::setQuality(int quality)
{
    qualityLevel = juce::jlimit(1, 5, quality);
    phaseVocoder.setQuality(qualityLevel);

    // Rebuild the phase-vocoder internals when quality changes live.
    if (isPrepared)
    {
        phaseVocoder.prepare(currentSampleRate, currentBlockSize, currentNumChannels);
        phaseVocoder.reset();
    }
}

void TimeStretchEngine::setKeyLock(bool enabled)
{
    keyLockEnabled = enabled;
}

void TimeStretchEngine::setGrainSize(float ms)
{
    grainSizeMs = juce::jlimit(10.0f, 500.0f, ms);
    granular.setGrainSize(grainSizeMs);
}

void TimeStretchEngine::setGrainDensity(float grainsPerSec)
{
    grainDensity = juce::jlimit(1.0f, 100.0f, grainsPerSec);
    granular.setGrainDensity(grainDensity);
}

int TimeStretchEngine::getLatencySamples() const
{
    switch (currentAlgorithm)
    {
        case PhaseVocoder: return phaseVocoder.getLatency();
        case Granular:     return granular.getLatency();
        case WSOLA:        return wsola.getLatency();
        default:           return 0;
    }
}

//==============================================================================
// Phase Vocoder Implementation
//==============================================================================

void TimeStretchEngine::PhaseVocoderProcessor::prepare(double sr, int maxBlockSize, int numCh)
{
    juce::ignoreUnused(maxBlockSize);

    sampleRate = sr;
    numChannels = numCh;
    
    // Re-create FFT for current fftSize
    fft = std::make_unique<juce::dsp::FFT>(static_cast<int>(std::log2(fftSize)));
    
    // Hann window
    window = std::make_unique<juce::dsp::WindowingFunction<float>>(
        fftSize,
        juce::dsp::WindowingFunction<float>::hann,
        false
    );
    
    channelStates.resize(numChannels);
    
    for (auto& state : channelStates)
    {
        // inputBuffer: circular ring of fftSize*2 samples
        state.inputBuffer.assign(fftSize * 2, 0.0f);
        // outputBuffer: OLA accumulator, sized for max timeStretch=4 headroom
        state.outputBuffer.assign(fftSize * 16, 0.0f);
        state.fftBuffer.assign(fftSize, {});
        state.magnitudes.assign(fftSize / 2 + 1, 0.0f);
        state.phases.assign(fftSize / 2 + 1, 0.0f);
        state.lastPhases.assign(fftSize / 2 + 1, 0.0f);
        state.phaseDiff.assign(fftSize / 2 + 1, 0.0f);
        state.synthesisPhases.assign(fftSize / 2 + 1, 0.0f);
        state.inputWritePos  = 0;
        state.outputReadPos  = 0;
        // Pre-fill outputWritePos with fftSize latency offset so readers start in valid region
        state.outputWritePos = fftSize;
        state.hopCounter     = 0;
    }
}

void TimeStretchEngine::PhaseVocoderProcessor::reset()
{
    for (auto& state : channelStates)
    {
        std::fill(state.inputBuffer.begin(), state.inputBuffer.end(), 0.0f);
        std::fill(state.outputBuffer.begin(), state.outputBuffer.end(), 0.0f);
        std::fill(state.lastPhases.begin(), state.lastPhases.end(), 0.0f);
        std::fill(state.synthesisPhases.begin(), state.synthesisPhases.end(), 0.0f);
        state.inputWritePos  = 0;
        state.outputReadPos  = 0;
        state.outputWritePos = fftSize;
        state.hopCounter     = 0;
    }
}

void TimeStretchEngine::PhaseVocoderProcessor::process(
    juce::AudioBuffer<float>& buffer,
    float timeStretch,
    float pitchShift)
{
    // ── Unity fast-path: no processing needed ───────────────────────────────
    if (std::abs(timeStretch - 1.0f) < 0.001f && std::abs(pitchShift) < 0.01f)
        return;

    if (fft == nullptr || channelStates.empty())
        return;

    const int numSamples   = buffer.getNumSamples();
    const int numCh        = juce::jmin(buffer.getNumChannels(), (int)channelStates.size());

    for (int ch = 0; ch < numCh; ++ch)
    {
        auto&   st         = channelStates[ch];
        float*  data       = buffer.getWritePointer(ch);
        const int inSize   = (int)st.inputBuffer.size();
        const int outSize  = (int)st.outputBuffer.size();

        for (int i = 0; i < numSamples; ++i)
        {
            // ── 1. Feed input into circular ring buffer ──────────────────────
            st.inputBuffer[st.inputWritePos % inSize] = data[i];
            ++st.inputWritePos;
            ++st.hopCounter;

            // ── 2. Pull one output sample from accumulator ───────────────────
            const int rIdx = st.outputReadPos % outSize;
            data[i]              = st.outputBuffer[rIdx];
            st.outputBuffer[rIdx] = 0.0f;
            ++st.outputReadPos;

            // ── 3. When a full analysis hop has accumulated, run the PV ──────
            if (st.hopCounter >= hopSize)
            {
                st.hopCounter = 0;
                analyzeFrame(ch);
                synthesizeFrame(ch, timeStretch, pitchShift);
            }
        }
    }
}

void TimeStretchEngine::PhaseVocoderProcessor::analyzeFrame(int ch)
{
    auto& st            = channelStates[ch];
    const int halfSize  = fftSize / 2 + 1;
    const int inSize    = (int)st.inputBuffer.size();
    const float twoPi   = juce::MathConstants<float>::twoPi;

    // Extract the most-recent fftSize samples from the circular input buffer
    std::vector<float> frame(fftSize * 2, 0.0f);
    for (int k = 0; k < fftSize; ++k)
    {
        const int pos = ((st.inputWritePos - fftSize + k) % inSize + inSize) % inSize;
        frame[k] = st.inputBuffer[pos];
    }

    // Apply Hann window in-place
    window->multiplyWithWindowingTable(frame.data(), fftSize);

    // Forward FFT (real-only, returns interleaved complex [re0,im0,re1,im1,...])
    fft->performRealOnlyForwardTransform(frame.data(), true);

    // Convert to polar, compute instantaneous frequencies
    const float phaseExpected = twoPi * static_cast<float>(hopSize) / static_cast<float>(fftSize);

    for (int k = 0; k < halfSize; ++k)
    {
        const float re  = frame[k * 2];
        const float im  = frame[k * 2 + 1];

        st.magnitudes[k] = std::sqrt(re * re + im * im);
        const float phi  = std::atan2(im, re);

        // Phase deviation from the expected advance
        float delta = phi - st.lastPhases[k] - static_cast<float>(k) * phaseExpected;
        // Wrap to (−π, π]
        delta -= twoPi * std::round(delta / twoPi);

        // Instantaneous frequency (rad/sample)
        st.phaseDiff[k]  = static_cast<float>(k) * twoPi / static_cast<float>(fftSize)
                         + delta / static_cast<float>(hopSize);
        st.lastPhases[k] = phi;
    }
}

void TimeStretchEngine::PhaseVocoderProcessor::synthesizeFrame(int ch, float timeStretch, float pitchShift)
{
    auto& st             = channelStates[ch];
    const int halfSize   = fftSize / 2 + 1;
    const int synthHop   = juce::jmax(1, juce::roundToInt(static_cast<float>(hopSize) * timeStretch));
    const float pitchRatio = std::pow(2.0f, pitchShift / 12.0f);
    const int outSize    = (int)st.outputBuffer.size();

    // ── Build synthesis spectrum with optional pitch shift ───────────────────
    std::vector<float> synthFrame(fftSize * 2, 0.0f);

    for (int k = 0; k < halfSize; ++k)
    {
        // Source bin (fractional) after pitch mapping
        const float srcF   = static_cast<float>(k) / pitchRatio;
        const int   srcK   = static_cast<int>(srcF);
        const float frac   = srcF - static_cast<float>(srcK);

        float mag      = 0.0f;
        float instFreq = 0.0f;

        if (srcK >= 0 && srcK < halfSize)
        {
            if (srcK + 1 < halfSize)
            {
                mag      = st.magnitudes[srcK] * (1.0f - frac) + st.magnitudes[srcK + 1] * frac;
                instFreq = (st.phaseDiff[srcK] * (1.0f - frac) + st.phaseDiff[srcK + 1] * frac)
                         * pitchRatio;
            }
            else
            {
                mag      = st.magnitudes[srcK];
                instFreq = st.phaseDiff[srcK] * pitchRatio;
            }
        }

        // Accumulate synthesis phase
        st.synthesisPhases[k] += instFreq * static_cast<float>(synthHop);

        synthFrame[k * 2]     = mag * std::cos(st.synthesisPhases[k]);
        synthFrame[k * 2 + 1] = mag * std::sin(st.synthesisPhases[k]);
    }

    // ── Inverse FFT → real time-domain frame ────────────────────────────────
    fft->performRealOnlyInverseTransform(synthFrame.data());

    // Apply synthesis Hann window for smooth OLA
    window->multiplyWithWindowingTable(synthFrame.data(), fftSize);

    // Normalisation: compensate for JUCE's un-scaled FFT (÷N) and OLA gain
    const float scale = 1.0f / (static_cast<float>(fftSize) * static_cast<float>(overlapFactor) * 0.5f);

    // ── Overlap-add into accumulator ─────────────────────────────────────────
    for (int k = 0; k < fftSize; ++k)
    {
        const int pos = (st.outputWritePos + k) % outSize;
        st.outputBuffer[pos] += synthFrame[k] * scale;
    }

    st.outputWritePos = (st.outputWritePos + synthHop) % outSize;
}

void TimeStretchEngine::PhaseVocoderProcessor::setQuality(int quality)
{
    // Adjust FFT size based on quality.
    overlapFactor = 4;

    switch (quality)
    {
        case 1: fftSize = 1024; break;
        case 2: fftSize = 2048; break;
        case 3: fftSize = 4096; break;
        case 4: fftSize = 8192; break;
        case 5: fftSize = 8192; overlapFactor = 8; break;
        default: fftSize = 4096; break;
    }

    fftSize = juce::jlimit(MIN_FFT_SIZE, MAX_FFT_SIZE, fftSize);
    overlapFactor = juce::jmax(1, overlapFactor);
    hopSize = fftSize / overlapFactor;
}

int TimeStretchEngine::PhaseVocoderProcessor::getLatency() const
{
    return fftSize;
}

float TimeStretchEngine::PhaseVocoderProcessor::unwrapPhase(float phase)
{
    return phase - juce::MathConstants<float>::twoPi * 
           std::round(phase / juce::MathConstants<float>::twoPi);
}

//==============================================================================
// Granular Implementation
//==============================================================================

void TimeStretchEngine::GranularProcessor::prepare(double sr, int maxBlockSize, int numCh)
{
    juce::ignoreUnused(maxBlockSize);

    sampleRate = sr;
    numChannels = numCh;
    
    // Initialize grain pool
    grains.resize(MAX_GRAINS);
    for (auto& grain : grains)
    {
        grain.active = false;
    }
    
    // Input buffer (4 seconds)
    inputBuffer.resize(static_cast<int>(sampleRate * 4.0), 0.0f);
    inputWritePos = 0;
    grainSpawnCounter = 0.0f;
}

void TimeStretchEngine::GranularProcessor::reset()
{
    for (auto& grain : grains)
    {
        grain.active = false;
    }
    
    std::fill(inputBuffer.begin(), inputBuffer.end(), 0.0f);
    inputWritePos = 0;
    grainSpawnCounter = 0.0f;
}

void TimeStretchEngine::GranularProcessor::process(
    juce::AudioBuffer<float>& buffer,
    float timeStretch,
    float pitchShift)
{
    const int numSamples = buffer.getNumSamples();
    const int channelCount = buffer.getNumChannels();
    const float pitchRatio = std::pow(2.0f, pitchShift / 12.0f);

    // Mix all input channels to ch0 before processing (mono grain engine).
    if (channelCount > 1)
    {
        const float inv = 1.0f / static_cast<float>(channelCount);
        buffer.applyGain(0, 0, numSamples, inv);
        for (int ch = 1; ch < channelCount; ++ch)
            buffer.addFrom(0, 0, buffer, ch, 0, numSamples, inv);
    }

    float* data = buffer.getWritePointer(0);
    
    for (int i = 0; i < numSamples; ++i)
    {
        // Write input to circular buffer
        inputBuffer[inputWritePos] = data[i];
        
        // Spawn new grains at regular intervals
        grainSpawnCounter += grainsPerSecond / static_cast<float>(sampleRate);
        if (grainSpawnCounter >= 1.0f)
        {
            grainSpawnCounter -= 1.0f;
            
            // Calculate source position based on time stretch
            int sourcePos = static_cast<int>(inputWritePos / timeStretch) % inputBuffer.size();
            spawnGrain(sourcePos, pitchRatio);
        }
        
        // Mix all active grains
        float output = 0.0f;
        int activeCount = 0;
        
        for (auto& grain : grains)
        {
            if (grain.active)
            {
                // Calculate read position in source
                int readPos = grain.sourcePos + static_cast<int>(grain.grainPos * grain.pitchRatio);
                readPos = readPos % inputBuffer.size();
                
                // Get windowed sample
                float windowVal = getWindowValue(grain.grainPos, grain.length);
                output += inputBuffer[readPos] * windowVal * grain.amplitude;
                
                // Advance grain position
                grain.grainPos++;
                if (grain.grainPos >= grain.length)
                {
                    grain.active = false;
                }
                else
                {
                    activeCount++;
                }
            }
        }
        
        // Normalize by active grain count
        if (activeCount > 0)
        {
            output /= std::sqrt(static_cast<float>(activeCount));
        }
        
        data[i] = output;
        inputWritePos = (inputWritePos + 1) % inputBuffer.size();
    }

    // Copy mono result to all other channels
    for (int ch = 1; ch < channelCount; ++ch)
        buffer.copyFrom(ch, 0, buffer, 0, 0, numSamples);
}

void TimeStretchEngine::GranularProcessor::spawnGrain(int sourcePosition, float pitchRatio)
{
    // Find inactive grain
    for (auto& grain : grains)
    {
        if (!grain.active)
        {
            grain.active = true;
            grain.sourcePos = sourcePosition;
            grain.grainPos = 0;
            grain.length = static_cast<int>(grainSizeMs * sampleRate / 1000.0);
            grain.amplitude = 1.0f;
            grain.pitchRatio = pitchRatio;
            break;
        }
    }
}

void TimeStretchEngine::GranularProcessor::setGrainSize(float ms)
{
    grainSizeMs = ms;
}

void TimeStretchEngine::GranularProcessor::setGrainDensity(float grainsPerSec)
{
    grainsPerSecond = grainsPerSec;
}

float TimeStretchEngine::GranularProcessor::getWindowValue(int position, int length)
{
    // Hann window
    if (length <= 0) return 0.0f;
    float normalized = static_cast<float>(position) / static_cast<float>(length);
    return 0.5f * (1.0f - std::cos(juce::MathConstants<float>::twoPi * normalized));
}

int TimeStretchEngine::GranularProcessor::getLatency() const
{
    return static_cast<int>(grainSizeMs * sampleRate / 1000.0);
}

//==============================================================================
// WSOLA Implementation
//==============================================================================

void TimeStretchEngine::WSOLAProcessor::prepare(double sr, int maxBlockSize, int numCh)
{
    juce::ignoreUnused(maxBlockSize);

    sampleRate = sr;
    numChannels = numCh;
    
    // Initialize buffers
    inputBuffer.resize(SEGMENT_SIZE * 8, 0.0f);
    outputBuffer.resize(SEGMENT_SIZE * 8, 0.0f);
    inputReadPos = 0;
    outputWritePos = 0;
}

void TimeStretchEngine::WSOLAProcessor::reset()
{
    std::fill(inputBuffer.begin(), inputBuffer.end(), 0.0f);
    std::fill(outputBuffer.begin(), outputBuffer.end(), 0.0f);
    inputReadPos = 0;
    outputWritePos = 0;
}

void TimeStretchEngine::WSOLAProcessor::process(juce::AudioBuffer<float>& buffer, float timeStretch)
{
    const int numSamples  = buffer.getNumSamples();
    const int channelCount = buffer.getNumChannels();
    const int inBufSize   = (int)inputBuffer.size();

    // Unity fast-path: pass through unchanged
    if (std::abs(timeStretch - 1.0f) < 0.001f)
        return;

    // Mix all input channels down to ch0 for mono processing
    if (channelCount > 1)
    {
        const float inv = 1.0f / static_cast<float>(channelCount);
        buffer.applyGain(0, 0, numSamples, inv);
        for (int ch = 1; ch < channelCount; ++ch)
            buffer.addFrom(0, 0, buffer, ch, 0, numSamples, inv);
    }

    float* data = buffer.getWritePointer(0);

    for (int i = 0; i < numSamples; ++i)
    {
        // Store input in ring
        inputBuffer[inputReadPos % inBufSize] = data[i];

        // Read from input at a rate scaled by 1/timeStretch
        const float readPosF  = static_cast<float>(outputWritePos) / timeStretch;
        const int   readPosI  = static_cast<int>(readPosF)  % inBufSize;
        const float frac      = readPosF - std::floor(readPosF);
        const int   readPosI2 = (readPosI + 1) % inBufSize;

        // Linear interpolation for smoother output
        data[i] = inputBuffer[readPosI] * (1.0f - frac) + inputBuffer[readPosI2] * frac;

        inputReadPos++;
        outputWritePos++;
    }

    // Copy mono result to all other channels
    for (int ch = 1; ch < channelCount; ++ch)
        buffer.copyFrom(ch, 0, buffer, 0, 0, numSamples);
}

int TimeStretchEngine::WSOLAProcessor::findBestOverlap(const float* current, const float* target, int length)
{
    float bestCorr = -1.0f;
    int bestOffset = 0;
    
    for (int offset = -SEARCH_RANGE; offset <= SEARCH_RANGE; ++offset)
    {
        float corr = crossCorrelate(current + offset, target, length - std::abs(offset));
        if (corr > bestCorr)
        {
            bestCorr = corr;
            bestOffset = offset;
        }
    }
    
    return bestOffset;
}

float TimeStretchEngine::WSOLAProcessor::crossCorrelate(const float* a, const float* b, int length)
{
    float sum = 0.0f;
    float normA = 0.0f;
    float normB = 0.0f;
    
    for (int i = 0; i < length; ++i)
    {
        sum += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    
    float norm = std::sqrt(normA * normB);
    return norm > 0.0f ? sum / norm : 0.0f;
}

int TimeStretchEngine::WSOLAProcessor::getLatency() const
{
    return SEGMENT_SIZE * 2;
}
