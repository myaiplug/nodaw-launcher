#pragma once

#include <JuceHeader.h>
#include "State/ParameterLayout.h"
#include <array>

class RepairITAudioProcessor : public juce::AudioProcessor
{
public:
    RepairITAudioProcessor();
    ~RepairITAudioProcessor() override = default;

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

private:
    static constexpr int humHarmonics = 3;

    struct ChannelState
    {
        float prevSample = 0.0f;
        float noiseEnvelope = 0.0f;
        float denoiseGain = 1.0f;
    };

    void updateDeHumFilters(double sampleRate);
    void processChannel(float* channelData, int numSamples, int channelIndex,
                        float denoiseAmount, float declickAmount, float dehumAmount);

    std::vector<ChannelState> channelStates;
    std::vector<std::array<std::unique_ptr<juce::IIRFilter>, humHarmonics>> humNotchFilters;
    juce::AudioBuffer<float> dryBuffer;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(RepairITAudioProcessor)
};
