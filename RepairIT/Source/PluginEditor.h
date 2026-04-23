#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"

class RepairITAudioProcessorEditor : public juce::AudioProcessorEditor
{
public:
    explicit RepairITAudioProcessorEditor(RepairITAudioProcessor&);
    ~RepairITAudioProcessorEditor() override;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    void configureSlider(juce::Slider& slider, juce::Label& label, const juce::String& labelText);
    void setParameterPercent(const juce::String& paramId, float valuePercent);
    float getParameterPercent(const juce::String& paramId) const;

    RepairITAudioProcessor& audioProcessor;

    juce::Slider denoiseSlider;
    juce::Slider declickSlider;
    juce::Slider dehumSlider;
    juce::Slider mixSlider;

    juce::Label denoiseLabel;
    juce::Label declickLabel;
    juce::Label dehumLabel;
    juce::Label mixLabel;

    juce::TextButton monitorDryButton { "A/B: Monitor Dry" };
    juce::TextButton monitorWetButton { "Return To Processed" };

    juce::TextButton podcastPresetButton { "Podcast" };
    juce::TextButton vinylPresetButton { "Vinyl Restore" };
    juce::TextButton fieldPresetButton { "Field Cleanup" };
    juce::TextButton vocalPresetButton { "Vocal Rescue" };

    float storedMixBeforeDryMonitor = 100.0f;

    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> denoiseAttachment;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> declickAttachment;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> dehumAttachment;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> mixAttachment;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(RepairITAudioProcessorEditor)
};
