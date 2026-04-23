/*
  ==============================================================================

    PluginProcessor.h
    Time Stretch X - Professional Time Stretching & Pitch Shifting Plugin
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "DSP/TimeStretchEngine.h"
#include "DSP/NativeAudioGraph.h"
#include "State/ParameterLayout.h"
#include "State/PresetManager.h"

//==============================================================================
/**
 * Main audio processor for Time Stretch X
 * Handles all DSP processing and parameter management
 */
class TimeStretchXProcessor : public juce::AudioProcessor,
                              public juce::AudioProcessorValueTreeState::Listener
{
public:
    //==============================================================================
    TimeStretchXProcessor();
    ~TimeStretchXProcessor() override;

    //==============================================================================
    // AudioProcessor interface
    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

    bool isBusesLayoutSupported(const BusesLayout& layouts) const override;

    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;
    using AudioProcessor::processBlock;

    //==============================================================================
    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    //==============================================================================
    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    //==============================================================================
    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram(int index) override;
    const juce::String getProgramName(int index) override;
    void changeProgramName(int index, const juce::String& newName) override;

    //==============================================================================
    void getStateInformation(juce::MemoryBlock& destData) override;
    void setStateInformation(const void* data, int sizeInBytes) override;

    //==============================================================================
    // Parameter listener
    void parameterChanged(const juce::String& parameterID, float newValue) override;

    //==============================================================================
    // Accessors
    juce::AudioProcessorValueTreeState& getAPVTS() { return apvts; }
    const juce::AudioProcessorValueTreeState& getAPVTS() const { return apvts; }
    
    TimeStretchEngine& getEngine() { return stretchEngine; }
    const TimeStretchEngine& getEngine() const { return stretchEngine; }
    
    PresetManager& getPresetManager() { return presetManager; }
    juce::ValueTree copyPresetState() { return apvts.copyState(); }
    void applyPresetState(const juce::ValueTree& state);

    //==============================================================================
    // Standalone audio file operations
    bool loadAudioFile(const juce::File& file);
    bool hasLoadedAudio() const { return audioLoaded.load(); }
    const juce::AudioBuffer<float>& getLoadedAudio() const { return loadedAudio; }
    double getLoadedAudioLength() const;
    juce::String getLoadedFileName() const { return loadedFileName; }
    
    // Playback control (standalone mode)
    void play();
    void stop();
    void togglePlayback();
    void setPlayPosition(double positionInSeconds);
    double getPlayPosition() const;
    bool isPlaying() const { return playing.load(); }

    // Output metering (linear 0..1)
    float getRmsLevel(int channel) const
    {
      return channel == 0 ? rmsLevelL.load() : rmsLevelR.load();
    }
    
    // Processing progress
    float getProcessingProgress() const { return processingProgress.load(); }
    bool isProcessing() const { return processing.load(); }

    //==============================================================================
    // Algorithm types
    enum class Algorithm
    {
        PhaseVocoder = 0,
        Granular,
        WSOLA,
        NumAlgorithms
    };
    
    Algorithm getCurrentAlgorithm() const { return currentAlgorithm; }
    void setAlgorithm(Algorithm algo);
    
    static juce::String getAlgorithmName(Algorithm algo);
    static juce::String getAlgorithmDescription(Algorithm algo);

    //==============================================================================
    // Native graph API (JUCE VST3 runtime)
    bool createGraphNode(const juce::String& id, NativeAudioGraph::NodeType type, const juce::String& name = {});
    bool removeGraphNode(const juce::String& id);
    bool connectGraphNodes(const juce::String& from, const juce::String& to);
    bool disconnectGraphNodes(const juce::String& from, const juce::String& to);
    bool setGraphNodeParam(const juce::String& nodeId, const juce::Identifier& key, juce::var value);
    bool rebuildGraphChain();
    bool graphHasCycle() const { return processingGraph.hasCycle(); }
    const juce::StringArray& getGraphExecutionOrder() const { return processingGraph.getExecutionOrder(); }

private:
    //==============================================================================
    // Parameter state
    juce::AudioProcessorValueTreeState apvts;
    
    // DSP engine
    TimeStretchEngine stretchEngine;
    NativeAudioGraph processingGraph;
    
    // Preset management
    PresetManager presetManager;
    
    // Current algorithm
    Algorithm currentAlgorithm = Algorithm::PhaseVocoder;
    
    // Standalone mode audio storage
    juce::AudioBuffer<float> loadedAudio;
    juce::AudioBuffer<float> processedAudio;
    juce::String loadedFileName;
    std::atomic<bool> audioLoaded { false };
    std::atomic<bool> playing { false };
    std::atomic<bool> processing { false };
    std::atomic<float> processingProgress { 0.0f };
    std::atomic<int64_t> playPosition { 0 };
    std::atomic<float> rmsLevelL { 0.0f };
    std::atomic<float> rmsLevelR { 0.0f };
    
    // Cached parameters
    std::atomic<float> timeStretch { 1.0f };
    std::atomic<float> pitchShift { 0.0f };
    std::atomic<float> formantShift { 0.0f };
    std::atomic<float> mix { 1.0f };
    std::atomic<float> outputGain { 1.0f };
    std::atomic<bool> keyLock { false };
    std::atomic<bool> linked { false };
    
    // Sample rate
    double currentSampleRate = 44100.0;
    int currentBlockSize = 512;
    
    //==============================================================================
    const juce::String defaultTimeNodeId { "time-stretch-main" };
    const juce::String defaultGainNodeId { "master-gain" };

    //==============================================================================
    void updateParameters();
    void processStandalone(juce::AudioBuffer<float>& buffer);
    void processPlugin(juce::AudioBuffer<float>& buffer);
    
    //==============================================================================
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(TimeStretchXProcessor)
};
