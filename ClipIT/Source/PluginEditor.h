#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"

class ClipITAudioProcessorEditor : public juce::AudioProcessorEditor,
                                    private juce::Timer
{
public:
    explicit ClipITAudioProcessorEditor(ClipITAudioProcessor&);
    ~ClipITAudioProcessorEditor() override;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    void timerCallback() override;
    void paintTransferCurve(juce::Graphics&, juce::Rectangle<float> area);
    void paintMeters(juce::Graphics&, juce::Rectangle<float> area);
    void paintLevelBar(juce::Graphics&, float x, float y, float w, float h,
                       float level, bool isGR);
    void configureKnob(juce::Slider&, juce::Label&, const juce::String& name);
    void setupButton(juce::TextButton&);
    void updateButtonStates();

    // -------------------------------------------------------------------------
    // Colour palette — dark, red accent (danger/heat = clipping)
    // -------------------------------------------------------------------------
    struct Colours
    {
        const juce::Colour bg          { 0xFF0D0D12 };
        const juce::Colour surface     { 0xFF161620 };
        const juce::Colour surfaceHi   { 0xFF1E1E2C };
        const juce::Colour border      { 0xFF2D2D3D };
        const juce::Colour textPrimary { 0xFFEBEBFF };
        const juce::Colour textSecond  { 0x99EBEBFF };
        const juce::Colour textMuted   { 0x55EBEBFF };
        const juce::Colour accent      { 0xFFEF4444 }; // Red
        const juce::Colour accentAmber { 0xFFF59E0B }; // Amber (ceiling marker)
        const juce::Colour accentGreen { 0xFF10B981 }; // Green (input level dot)
        const juce::Colour meterGreen  { 0xFF22C55E };
        const juce::Colour meterYellow { 0xFFFACC15 };
        const juce::Colour meterRed    { 0xFFEF4444 };
    } colours;

    ClipITAudioProcessor& audioProcessor;

    // --- Knobs ---
    juce::Slider inputGainKnob;
    juce::Slider ceilingKnob;
    juce::Slider kneeKnob;
    juce::Slider outputGainKnob;

    juce::Label  inputGainLabel;
    juce::Label  ceilingLabel;
    juce::Label  kneeLabel;
    juce::Label  outputGainLabel;

    // --- Clip mode ---
    juce::TextButton softBtn   { "SOFT"   };
    juce::TextButton hardBtn   { "HARD"   };
    juce::TextButton hybridBtn { "HYBRID" };

    // --- Oversampling ---
    juce::TextButton os1xBtn   { "OFF" };
    juce::TextButton os2xBtn   { "2x"  };
    juce::TextButton os4xBtn   { "4x"  };
    juce::TextButton os8xBtn   { "8x"  };

    // --- Utility toggles ---
    juce::TextButton hardSafetyBtn { "HARD CLIP SAFETY" };
    juce::TextButton deltaSoloBtn  { "DELTA SOLO"       };

    // --- APVTS Attachments ---
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> inputGainAttach;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> ceilingAttach;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> kneeAttach;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> outputGainAttach;

    // --- Meter display state (smoothed on UI thread) ---
    float uiInL = 0.0f, uiInR = 0.0f;
    float uiOutL = 0.0f, uiOutR = 0.0f;
    float uiGR = 0.0f;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(ClipITAudioProcessorEditor)
};
