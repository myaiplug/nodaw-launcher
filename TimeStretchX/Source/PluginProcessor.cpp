/*
  ==============================================================================

    PluginProcessor.cpp
    Time Stretch X - Professional Time Stretching & Pitch Shifting Plugin
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#include "PluginProcessor.h"
#include "PluginEditor.h"
#include "State/ParameterLayout.h"

//==============================================================================
TimeStretchXProcessor::TimeStretchXProcessor()
    : AudioProcessor(BusesProperties()
                     .withInput("Input", juce::AudioChannelSet::stereo(), true)
                     .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
      apvts(*this, nullptr, "Parameters", ParameterLayout::createParameterLayout()),
    presetManager()
{
    // Register as parameter listener
    apvts.addParameterListener(ParameterLayout::TIME_STRETCH_ID, this);
    apvts.addParameterListener(ParameterLayout::PITCH_SHIFT_ID, this);
    apvts.addParameterListener(ParameterLayout::FORMANT_SHIFT_ID, this);
    apvts.addParameterListener(ParameterLayout::MIX_ID, this);
    apvts.addParameterListener(ParameterLayout::OUTPUT_GAIN_ID, this);
    apvts.addParameterListener(ParameterLayout::KEY_LOCK_ID, this);
    apvts.addParameterListener(ParameterLayout::LINKED_ID, this);
    apvts.addParameterListener(ParameterLayout::ALGORITHM_ID, this);
    apvts.addParameterListener(ParameterLayout::QUALITY_ID, this);
    
    // Initialize parameters from state
    updateParameters();

    // Build default native graph chain: TimeStretch -> Gain
    processingGraph.createNode(defaultTimeNodeId, NativeAudioGraph::NodeType::TimeStretch, "Time Stretch");
    processingGraph.createNode(defaultGainNodeId, NativeAudioGraph::NodeType::Gain, "Master Gain");
    processingGraph.connect(defaultTimeNodeId, defaultGainNodeId);
    processingGraph.rebuildChain();
}

TimeStretchXProcessor::~TimeStretchXProcessor()
{
    // Remove parameter listeners
    apvts.removeParameterListener(ParameterLayout::TIME_STRETCH_ID, this);
    apvts.removeParameterListener(ParameterLayout::PITCH_SHIFT_ID, this);
    apvts.removeParameterListener(ParameterLayout::FORMANT_SHIFT_ID, this);
    apvts.removeParameterListener(ParameterLayout::MIX_ID, this);
    apvts.removeParameterListener(ParameterLayout::OUTPUT_GAIN_ID, this);
    apvts.removeParameterListener(ParameterLayout::KEY_LOCK_ID, this);
    apvts.removeParameterListener(ParameterLayout::LINKED_ID, this);
    apvts.removeParameterListener(ParameterLayout::ALGORITHM_ID, this);
    apvts.removeParameterListener(ParameterLayout::QUALITY_ID, this);
}

//==============================================================================
const juce::String TimeStretchXProcessor::getName() const
{
    return JucePlugin_Name;
}

bool TimeStretchXProcessor::acceptsMidi() const
{
    return false;
}

bool TimeStretchXProcessor::producesMidi() const
{
    return false;
}

bool TimeStretchXProcessor::isMidiEffect() const
{
    return false;
}

double TimeStretchXProcessor::getTailLengthSeconds() const
{
    // Return the maximum latency of our algorithms
    return 0.2; // 200ms maximum tail
}

int TimeStretchXProcessor::getNumPrograms()
{
    return 1; // NB: some hosts don't cope very well if you tell them there are 0 programs
}

int TimeStretchXProcessor::getCurrentProgram()
{
    return 0;
}

void TimeStretchXProcessor::setCurrentProgram(int /*index*/)
{
}

const juce::String TimeStretchXProcessor::getProgramName(int /*index*/)
{
    return {};
}

void TimeStretchXProcessor::changeProgramName(int /*index*/, const juce::String& /*newName*/)
{
}

//==============================================================================
void TimeStretchXProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    currentSampleRate = sampleRate;
    currentBlockSize = samplesPerBlock;
    
    // Prepare the stretch engine
    stretchEngine.prepare(sampleRate, samplesPerBlock, getTotalNumOutputChannels());
    
    // Update engine parameters
    stretchEngine.setTimeStretch(timeStretch.load());
    stretchEngine.setPitchShift(pitchShift.load());
    stretchEngine.setFormantShift(formantShift.load());
    stretchEngine.setAlgorithm(static_cast<int>(currentAlgorithm));
    stretchEngine.setQuality(static_cast<int>(*apvts.getRawParameterValue(ParameterLayout::QUALITY_ID)));
    stretchEngine.setKeyLock(keyLock.load());

    processingGraph.prepare(sampleRate, samplesPerBlock, getTotalNumOutputChannels());

    setLatencySamples(stretchEngine.getLatencySamples());
}

void TimeStretchXProcessor::releaseResources()
{
    stretchEngine.reset();
    processingGraph.reset();
}

bool TimeStretchXProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    // Support mono and stereo
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
        && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;

    // Input and output must match
    if (layouts.getMainOutputChannelSet() != layouts.getMainInputChannelSet())
        return false;

    return true;
}

void TimeStretchXProcessor::processBlock(juce::AudioBuffer<float>& buffer,
                                          juce::MidiBuffer& /*midiMessages*/)
{
    juce::ScopedNoDenormals noDenormals;
    
    const int totalNumInputChannels = getTotalNumInputChannels();
    const int totalNumOutputChannels = getTotalNumOutputChannels();

    // Clear any output channels that don't have inputs
    for (int i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear(i, 0, buffer.getNumSamples());

    // Check if we're in standalone mode with loaded audio
    if (wrapperType == wrapperType_Standalone && audioLoaded.load())
    {
        processStandalone(buffer);
    }
    else
    {
        processPlugin(buffer);
    }

    const int numSamples = buffer.getNumSamples();
    if (numSamples > 0)
    {
        const float inL = buffer.getRMSLevel(0, 0, numSamples);
        const float inR = buffer.getNumChannels() > 1
            ? buffer.getRMSLevel(1, 0, numSamples)
            : inL;

        constexpr float attack = 0.28f;
        constexpr float release = 0.08f;

        const float prevL = rmsLevelL.load(std::memory_order_relaxed);
        const float prevR = rmsLevelR.load(std::memory_order_relaxed);

        const float alphaL = (inL > prevL) ? attack : release;
        const float alphaR = (inR > prevR) ? attack : release;

        rmsLevelL.store(prevL + (inL - prevL) * alphaL, std::memory_order_relaxed);
        rmsLevelR.store(prevR + (inR - prevR) * alphaR, std::memory_order_relaxed);
    }
}

void TimeStretchXProcessor::processStandalone(juce::AudioBuffer<float>& buffer)
{
    if (!playing.load() || !audioLoaded.load())
    {
        buffer.clear();
        return;
    }
    
    const int numSamples = buffer.getNumSamples();
    const int numChannels = buffer.getNumChannels();
    int64_t pos = playPosition.load();
    
    // Read from processed audio buffer
    for (int ch = 0; ch < numChannels; ++ch)
    {
        const int sourceChannel = juce::jmin(ch, processedAudio.getNumChannels() - 1);
        float* dest = buffer.getWritePointer(ch);
        const float* src = processedAudio.getReadPointer(sourceChannel);
        
        for (int i = 0; i < numSamples; ++i)
        {
            const int64_t readPos = pos + i;
            if (readPos < processedAudio.getNumSamples())
            {
                dest[i] = src[readPos] * outputGain.load();
            }
            else
            {
                dest[i] = 0.0f;
            }
        }
    }
    
    // Update play position
    pos += numSamples;
    if (pos >= processedAudio.getNumSamples())
    {
        // Loop or stop
        pos = 0;
        // playing.store(false); // Uncomment to stop at end
    }
    playPosition.store(pos);
}

void TimeStretchXProcessor::processPlugin(juce::AudioBuffer<float>& buffer)
{
    juce::AudioBuffer<float> dryBuffer;
    dryBuffer.makeCopyOf(buffer, true);

    processingGraph.process(buffer);

    const float wet = juce::jlimit(0.0f, 1.0f, mix.load());
    const float dry = 1.0f - wet;

    if (wet < 0.9999f)
    {
        for (int channel = 0; channel < buffer.getNumChannels(); ++channel)
        {
            buffer.applyGain(channel, 0, buffer.getNumSamples(), wet);
            buffer.addFrom(channel, 0, dryBuffer, channel, 0, buffer.getNumSamples(), dry);
        }
    }

   #if JUCE_DEBUG
    const auto profiling = processingGraph.drainProfilingSamples();
    if (!profiling.empty())
    {
        const auto& latest = profiling.back();
        jassert(latest.durationMicros < 4000u || latest.blockSize > 1024u);
    }
   #endif
}

//==============================================================================
bool TimeStretchXProcessor::hasEditor() const
{
    return true;
}

juce::AudioProcessorEditor* TimeStretchXProcessor::createEditor()
{
    return new TimeStretchXEditor(*this);
}

//==============================================================================
void TimeStretchXProcessor::getStateInformation(juce::MemoryBlock& destData)
{
    auto state = apvts.copyState();
    std::unique_ptr<juce::XmlElement> xml(state.createXml());
    copyXmlToBinary(*xml, destData);
}

void TimeStretchXProcessor::setStateInformation(const void* data, int sizeInBytes)
{
    std::unique_ptr<juce::XmlElement> xmlState(getXmlFromBinary(data, sizeInBytes));

    if (xmlState.get() != nullptr)
    {
        if (xmlState->hasTagName(apvts.state.getType()))
        {
            apvts.replaceState(juce::ValueTree::fromXml(*xmlState));
            updateParameters();
        }
    }
}

void TimeStretchXProcessor::applyPresetState(const juce::ValueTree& state)
{
    if (!state.isValid())
        return;

    if (state.hasType(apvts.state.getType()))
    {
        apvts.replaceState(state.createCopy());
        updateParameters();
    }
}

//==============================================================================
void TimeStretchXProcessor::parameterChanged(const juce::String& parameterID, float newValue)
{
    if (parameterID == ParameterLayout::TIME_STRETCH_ID)
    {
        timeStretch.store(newValue);
        stretchEngine.setTimeStretch(newValue);
        processingGraph.setParam(defaultTimeNodeId, juce::Identifier("timeRatio"), newValue);
        
        // Handle linked mode
        if (linked.load() && !keyLock.load())
        {
            // When linked, pitch follows time naturally
            // (i.e., slowing down lowers pitch)
        }
    }
    else if (parameterID == ParameterLayout::PITCH_SHIFT_ID)
    {
        pitchShift.store(newValue);
        stretchEngine.setPitchShift(newValue);
        processingGraph.setParam(defaultTimeNodeId, juce::Identifier("pitchShift"), newValue);
    }
    else if (parameterID == ParameterLayout::FORMANT_SHIFT_ID)
    {
        formantShift.store(newValue);
        stretchEngine.setFormantShift(newValue);
        processingGraph.setParam(defaultTimeNodeId, juce::Identifier("formantShift"), newValue);
    }
    else if (parameterID == ParameterLayout::MIX_ID)
    {
        mix.store(newValue / 100.0f);
    }
    else if (parameterID == ParameterLayout::OUTPUT_GAIN_ID)
    {
        outputGain.store(juce::Decibels::decibelsToGain(newValue));
        processingGraph.setParam(defaultGainNodeId, juce::Identifier("gain"), outputGain.load());
    }
    else if (parameterID == ParameterLayout::KEY_LOCK_ID)
    {
        keyLock.store(newValue > 0.5f);
        stretchEngine.setKeyLock(newValue > 0.5f);
        processingGraph.setParam(defaultTimeNodeId, juce::Identifier("keyLock"), newValue > 0.5f ? 1.0f : 0.0f);
    }
    else if (parameterID == ParameterLayout::LINKED_ID)
    {
        linked.store(newValue > 0.5f);
    }
    else if (parameterID == ParameterLayout::ALGORITHM_ID)
    {
        const int algoIndex = static_cast<int>(newValue);
        if (algoIndex >= 0 && algoIndex < static_cast<int>(Algorithm::NumAlgorithms))
        {
            currentAlgorithm = static_cast<Algorithm>(algoIndex);
            stretchEngine.setAlgorithm(algoIndex);
            processingGraph.setParam(defaultTimeNodeId, juce::Identifier("algorithm"), algoIndex);
            setLatencySamples(stretchEngine.getLatencySamples());
        }
    }
    else if (parameterID == ParameterLayout::QUALITY_ID)
    {
        stretchEngine.setQuality(static_cast<int>(newValue));
        processingGraph.setParam(defaultTimeNodeId, juce::Identifier("quality"), static_cast<int>(newValue));
        setLatencySamples(stretchEngine.getLatencySamples());
    }
}

void TimeStretchXProcessor::updateParameters()
{
    timeStretch.store(*apvts.getRawParameterValue(ParameterLayout::TIME_STRETCH_ID));
    pitchShift.store(*apvts.getRawParameterValue(ParameterLayout::PITCH_SHIFT_ID));
    formantShift.store(*apvts.getRawParameterValue(ParameterLayout::FORMANT_SHIFT_ID));
    mix.store(*apvts.getRawParameterValue(ParameterLayout::MIX_ID) / 100.0f);
    outputGain.store(juce::Decibels::decibelsToGain(apvts.getRawParameterValue(ParameterLayout::OUTPUT_GAIN_ID)->load()));
    keyLock.store(*apvts.getRawParameterValue(ParameterLayout::KEY_LOCK_ID) > 0.5f);
    linked.store(*apvts.getRawParameterValue(ParameterLayout::LINKED_ID) > 0.5f);
    
    const int algoIndex = static_cast<int>(*apvts.getRawParameterValue(ParameterLayout::ALGORITHM_ID));
    if (algoIndex >= 0 && algoIndex < static_cast<int>(Algorithm::NumAlgorithms))
        currentAlgorithm = static_cast<Algorithm>(algoIndex);

    stretchEngine.setTimeStretch(timeStretch.load());
    stretchEngine.setPitchShift(pitchShift.load());
    stretchEngine.setFormantShift(formantShift.load());
    stretchEngine.setKeyLock(keyLock.load());
    stretchEngine.setAlgorithm(static_cast<int>(currentAlgorithm));
    stretchEngine.setQuality(static_cast<int>(*apvts.getRawParameterValue(ParameterLayout::QUALITY_ID)));

    processingGraph.setParam(defaultTimeNodeId, juce::Identifier("timeRatio"), timeStretch.load());
    processingGraph.setParam(defaultTimeNodeId, juce::Identifier("pitchShift"), pitchShift.load());
    processingGraph.setParam(defaultTimeNodeId, juce::Identifier("formantShift"), formantShift.load());
    processingGraph.setParam(defaultTimeNodeId, juce::Identifier("algorithm"), static_cast<int>(currentAlgorithm));
    processingGraph.setParam(defaultTimeNodeId, juce::Identifier("quality"), static_cast<int>(*apvts.getRawParameterValue(ParameterLayout::QUALITY_ID)));
    processingGraph.setParam(defaultTimeNodeId, juce::Identifier("keyLock"), keyLock.load() ? 1.0f : 0.0f);
    processingGraph.setParam(defaultGainNodeId, juce::Identifier("gain"), outputGain.load());
    processingGraph.rebuildChain();

    setLatencySamples(stretchEngine.getLatencySamples());
}

bool TimeStretchXProcessor::createGraphNode(const juce::String& id, NativeAudioGraph::NodeType type, const juce::String& name)
{
    return processingGraph.createNode(id, type, name);
}

bool TimeStretchXProcessor::removeGraphNode(const juce::String& id)
{
    if (id == defaultTimeNodeId || id == defaultGainNodeId)
        return false;

    return processingGraph.removeNode(id);
}

bool TimeStretchXProcessor::connectGraphNodes(const juce::String& from, const juce::String& to)
{
    return processingGraph.connect(from, to);
}

bool TimeStretchXProcessor::disconnectGraphNodes(const juce::String& from, const juce::String& to)
{
    return processingGraph.disconnect(from, to);
}

bool TimeStretchXProcessor::setGraphNodeParam(const juce::String& nodeId, const juce::Identifier& key, juce::var value)
{
    return processingGraph.setParam(nodeId, key, value);
}

bool TimeStretchXProcessor::rebuildGraphChain()
{
    return processingGraph.rebuildChain();
}

//==============================================================================
bool TimeStretchXProcessor::loadAudioFile(const juce::File& file)
{
    // Create format manager if needed
    juce::AudioFormatManager formatManager;
    formatManager.registerBasicFormats();
    
    // Create a reader for the file
    std::unique_ptr<juce::AudioFormatReader> reader(formatManager.createReaderFor(file));
    
    if (reader == nullptr)
        return false;
    
    // Read the audio data
    const int numSamples = static_cast<int>(reader->lengthInSamples);
    const int numChannels = static_cast<int>(reader->numChannels);
    
    loadedAudio.setSize(numChannels, numSamples);
    reader->read(&loadedAudio, 0, numSamples, 0, true, true);
    
    loadedFileName = file.getFileName();
    
    // Process the audio with current settings
    processing.store(true);
    processingProgress.store(0.0f);
    
    // For now, just copy to processed buffer
    // TODO: Apply time stretch processing
    processedAudio = loadedAudio;
    
    processing.store(false);
    processingProgress.store(1.0f);
    audioLoaded.store(true);
    
    return true;
}

double TimeStretchXProcessor::getLoadedAudioLength() const
{
    if (!audioLoaded.load())
        return 0.0;
    
    return static_cast<double>(processedAudio.getNumSamples()) / currentSampleRate;
}

void TimeStretchXProcessor::play()
{
    if (audioLoaded.load())
        playing.store(true);
}

void TimeStretchXProcessor::stop()
{
    playing.store(false);
}

void TimeStretchXProcessor::togglePlayback()
{
    if (playing.load())
        stop();
    else
        play();
}

void TimeStretchXProcessor::setPlayPosition(double positionInSeconds)
{
    const int64_t samplePos = static_cast<int64_t>(positionInSeconds * currentSampleRate);
    playPosition.store(juce::jmax(int64_t(0), samplePos));
}

double TimeStretchXProcessor::getPlayPosition() const
{
    return static_cast<double>(playPosition.load()) / currentSampleRate;
}

void TimeStretchXProcessor::setAlgorithm(Algorithm algo)
{
    if (auto* param = apvts.getParameter(ParameterLayout::ALGORITHM_ID))
    {
        param->setValueNotifyingHost(static_cast<float>(algo) / static_cast<float>(static_cast<int>(Algorithm::NumAlgorithms) - 1));
    }
}

juce::String TimeStretchXProcessor::getAlgorithmName(Algorithm algo)
{
    switch (algo)
    {
        case Algorithm::PhaseVocoder: return "Phase Vocoder";
        case Algorithm::Granular:     return "Granular";
        case Algorithm::WSOLA:        return "WSOLA";
        default:                      return "Unknown";
    }
}

juce::String TimeStretchXProcessor::getAlgorithmDescription(Algorithm algo)
{
    switch (algo)
    {
        case Algorithm::PhaseVocoder:
            return "Best for music, preserves transients and harmonics";
        case Algorithm::Granular:
            return "Creative textures, best for extreme stretching";
        case Algorithm::WSOLA:
            return "Fast processing, good for speech and voice";
        default:
            return "";
    }
}

//==============================================================================
// This creates new instances of the plugin
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new TimeStretchXProcessor();
}
