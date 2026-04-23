#include "PluginProcessor.h"
#include "PluginEditor.h"

RepairITAudioProcessor::RepairITAudioProcessor()
    : AudioProcessor(BusesProperties().withInput("Input", juce::AudioChannelSet::stereo(), true)
                                      .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
      apvts(*this, nullptr, "PARAMETERS", RepairITParams::createLayout())
{
}

void RepairITAudioProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    const auto numChannels = getTotalNumOutputChannels();
    channelStates.assign(static_cast<size_t>(numChannels), ChannelState{});

    humNotchFilters.clear();
    humNotchFilters.reserve(static_cast<size_t>(numChannels));
    for (int channel = 0; channel < numChannels; ++channel)
    {
        std::array<std::unique_ptr<juce::IIRFilter>, humHarmonics> filters;
        for (auto& filter : filters)
            filter = std::make_unique<juce::IIRFilter>();

        humNotchFilters.emplace_back(std::move(filters));
    }

    dryBuffer.setSize(numChannels, samplesPerBlock, false, true, true);
    updateDeHumFilters(sampleRate);
}

void RepairITAudioProcessor::releaseResources()
{
    dryBuffer.setSize(0, 0);
}

bool RepairITAudioProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    return layouts.getMainInputChannelSet() == juce::AudioChannelSet::stereo()
        && layouts.getMainOutputChannelSet() == juce::AudioChannelSet::stereo();
}

void RepairITAudioProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals noDenormals;

    const auto totalNumInputChannels = getTotalNumInputChannels();
    const auto totalNumOutputChannels = getTotalNumOutputChannels();

    for (int i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear(i, 0, buffer.getNumSamples());

    const auto denoiseAmount = apvts.getRawParameterValue(RepairITParams::denoise)->load() * 0.01f;
    const auto declickAmount = apvts.getRawParameterValue(RepairITParams::declick)->load() * 0.01f;
    const auto dehumAmount = apvts.getRawParameterValue(RepairITParams::dehum)->load() * 0.01f;
    const auto mixAmount = juce::jlimit(0.0f, 1.0f, apvts.getRawParameterValue(RepairITParams::mix)->load() * 0.01f);

    if (mixAmount <= 0.0001f || totalNumInputChannels <= 0)
        return;

    if (dryBuffer.getNumChannels() < totalNumOutputChannels || dryBuffer.getNumSamples() < buffer.getNumSamples())
        dryBuffer.setSize(totalNumOutputChannels, buffer.getNumSamples(), false, true, true);

    dryBuffer.makeCopyOf(buffer, true);

    for (int channel = 0; channel < totalNumInputChannels; ++channel)
    {
        auto* channelData = buffer.getWritePointer(channel);
        processChannel(channelData, buffer.getNumSamples(), channel, denoiseAmount, declickAmount, dehumAmount);
    }

    for (int channel = 0; channel < totalNumInputChannels; ++channel)
    {
        auto* wet = buffer.getWritePointer(channel);
        const auto* dry = dryBuffer.getReadPointer(channel);

        for (int i = 0; i < buffer.getNumSamples(); ++i)
            wet[i] = dry[i] + (wet[i] - dry[i]) * mixAmount;
    }
}

void RepairITAudioProcessor::updateDeHumFilters(double sampleRate)
{
    const float baseFrequencyHz = 60.0f;
    constexpr float q = 16.0f;

    for (auto& channelFilters : humNotchFilters)
    {
        for (int harmonic = 0; harmonic < humHarmonics; ++harmonic)
        {
            const auto freq = baseFrequencyHz * static_cast<float>(harmonic + 1);
            auto* filter = channelFilters[static_cast<size_t>(harmonic)].get();
            if (filter == nullptr)
                continue;

            filter->setCoefficients(
                juce::IIRCoefficients::makeNotchFilter(sampleRate, freq, q));
            filter->reset();
        }
    }
}

void RepairITAudioProcessor::processChannel(float* channelData, int numSamples, int channelIndex,
                                            float denoiseAmount, float declickAmount, float dehumAmount)
{
    if (channelData == nullptr || channelIndex < 0 || channelIndex >= static_cast<int>(channelStates.size()))
        return;

    auto& state = channelStates[static_cast<size_t>(channelIndex)];
    auto& filters = humNotchFilters[static_cast<size_t>(channelIndex)];

    const float denoiseThreshold = juce::jmap(denoiseAmount, 0.0f, 1.0f, 0.0005f, 0.03f);
    const float maxReductionDb = juce::jmap(denoiseAmount, 0.0f, 1.0f, 0.0f, 24.0f);
    const float denoiseSmoothing = juce::jmap(denoiseAmount, 0.0f, 1.0f, 0.02f, 0.20f);

    const float clickThreshold = juce::jmap(declickAmount, 0.0f, 1.0f, 0.8f, 0.08f);
    const float clickBlend = juce::jmap(declickAmount, 0.0f, 1.0f, 0.1f, 0.85f);

    for (int i = 0; i < numSamples; ++i)
    {
        float sample = channelData[i];

        const auto absSample = std::abs(sample);
        const auto envAttack = absSample > state.noiseEnvelope ? 0.12f : 0.002f;
        state.noiseEnvelope += (absSample - state.noiseEnvelope) * envAttack;

        float targetGain = 1.0f;
        if (state.noiseEnvelope < denoiseThreshold)
        {
            const auto ratio = juce::jlimit(0.0f, 1.0f, state.noiseEnvelope / denoiseThreshold);
            const auto reductionDb = -maxReductionDb * (1.0f - ratio);
            targetGain = juce::Decibels::decibelsToGain(reductionDb);
        }

        state.denoiseGain += (targetGain - state.denoiseGain) * denoiseSmoothing;
        sample *= state.denoiseGain;

        const auto delta = sample - state.prevSample;
        if (std::abs(delta) > clickThreshold)
        {
            const auto limited = state.prevSample + juce::jlimit(-clickThreshold, clickThreshold, delta);
            sample = juce::jmap(clickBlend, sample, limited);
        }

        state.prevSample = sample;

        float dehumWet = sample;
        for (auto& notch : filters)
            if (notch != nullptr)
                dehumWet = notch->processSingleSampleRaw(dehumWet);

        channelData[i] = sample + (dehumWet - sample) * dehumAmount;
    }
}

juce::AudioProcessorEditor* RepairITAudioProcessor::createEditor()
{
    return new RepairITAudioProcessorEditor(*this);
}

void RepairITAudioProcessor::getStateInformation(juce::MemoryBlock& destData)
{
    if (auto xml = apvts.copyState().createXml())
        copyXmlToBinary(*xml, destData);
}

void RepairITAudioProcessor::setStateInformation(const void* data, int sizeInBytes)
{
    if (auto xml = getXmlFromBinary(data, sizeInBytes))
        apvts.replaceState(juce::ValueTree::fromXml(*xml));
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new RepairITAudioProcessor();
}
