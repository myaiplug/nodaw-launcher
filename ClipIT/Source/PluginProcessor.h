#pragma once

#include <JuceHeader.h>
#include "State/ParameterLayout.h"

class ClipITAudioProcessor : public juce::AudioProcessor
{
public:
    ClipITAudioProcessor();
    ~ClipITAudioProcessor() override = default;

    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;
    bool isBusesLayoutSupported(const BusesLayout& layouts) const override;

    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;
    using AudioProcessor::processBlock;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return JucePlugin_Name; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }

    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const juce::String getProgramName(int) override { return {}; }
    void changeProgramName(int, const juce::String&) override {}

    void getStateInformation(juce::MemoryBlock& destData) override;
    void setStateInformation(const void* data, int sizeInBytes) override;

    juce::AudioProcessorValueTreeState apvts;

    // Thread-safe meter values — audio thread writes, UI thread reads
    std::atomic<float> inputLevelL  { 0.0f };
    std::atomic<float> inputLevelR  { 0.0f };
    std::atomic<float> outputLevelL { 0.0f };
    std::atomic<float> outputLevelR { 0.0f };
    std::atomic<float> gainReduction { 0.0f }; // 0 = no GR, 1 = full

private:
    float applyClip (float x, float ceiling, float kneePercent, int mode, float modeVoice) noexcept;

    double currentSampleRate = 44100.0;

    // Smoothed/ramped DSP state to avoid zipper noise on automation.
    float prevInputGainLin  = 1.0f;
    float prevOutputGainLin = 1.0f;
    float prevCeilingLin    = 1.0f;
    float prevKneePercent   = 30.0f;
    float prevModeVoice     = 0.0f;
    float prevLoudnessMakeupLin = 1.0f;

    // Pre-built oversamplers: [0]=2x  [1]=4x  [2]=8x
    std::unique_ptr<juce::dsp::Oversampling<float>> oversamplers[3];

    // Dedicated true-peak detector oversampler (4x)
    std::unique_ptr<juce::dsp::Oversampling<float>> truePeakOversampler;
    juce::AudioBuffer<float> truePeakProbeBuffer;

    // Pre-allocated dry buffer for delta solo (no audio-thread allocs)
    juce::AudioBuffer<float> dryBuffer;

    // Meter ballistics (audio thread only)
    float inPeakL  = 0.0f, inPeakR  = 0.0f;
    float outPeakL = 0.0f, outPeakR = 0.0f;
    float grPeak   = 0.0f;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(ClipITAudioProcessor)
};
