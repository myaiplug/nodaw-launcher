/*
  ==============================================================================

    PluginEditor.h
    Time Stretch X - Main UI Editor
    
    Premium dual-knob interface with animated visualizations
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "State/ParameterLayout.h"
#include "UI/LookAndFeel/NoDAWLookAndFeel.h"
#include "UI/Components/DualKnob.h"
#include "UI/Components/WaveformDisplay.h"
#include "UI/Components/AnimatedIcon.h"
#include "UI/Components/AlgorithmSelector.h"
#include "UI/Components/PresetBrowser.h"

//==============================================================================
/**
    Main plugin editor with Awwwards-winning design
    
    Layout (700x500):
    +------------------------------------------+
    |  [Logo/Icon]    HEADER    [Preset Menu]  |
    +------------------------------------------+
    |                                          |
    |        [Waveform Display Area]           |
    |                                          |
    +------------------------------------------+
    |  +------------+     +------------+       |
    |  |   TIME     |     |   PITCH    |       |
    |  |  STRETCH   |     |   SHIFT    |       |
    |  +------------+     +------------+       |
    +------------------------------------------+
    |  [Algorithm]  [Quality]  [Mix] [Output]  |
    +------------------------------------------+
    |     [Load Audio]     [Play/Stop]         |  (Standalone only)
    +------------------------------------------+
*/

class TimeStretchXEditor : public juce::AudioProcessorEditor,
                           private juce::Timer
{
public:
    TimeStretchXEditor(TimeStretchXProcessor&);
    ~TimeStretchXEditor() override;

    //==============================================================================
    void paint(juce::Graphics&) override;
    void resized() override;

private:
    void timerCallback() override;
    void updateWaveform();
    void loadAudioFile();
    void togglePlayback();
    
    // Colours from design system
    struct Colours
    {
      const juce::Colour background      { 0xFF0A1117 };  // Deep slate
      const juce::Colour surface         { 0xFF13202A };  // Surface
      const juce::Colour surfaceHover    { 0xFF1B2E3B };  // Elevated
      const juce::Colour border          { 0xFF27414F };  // Border
        const juce::Colour textPrimary     { 0xFFFFFFFF };  // Pure White
        const juce::Colour textSecondary   { 0x99FFFFFF };  // 60% White
        const juce::Colour textTertiary    { 0x66FFFFFF };  // 40% White
      const juce::Colour accentPrimary   { 0xFF00C2FF };  // Electric cyan
      const juce::Colour accentSecondary { 0xFFFF8A00 };  // Copper
      const juce::Colour waveformWave    { 0xFF00C2FF };  // Cyan wave
      const juce::Colour waveformPlay    { 0xFFFF8A00 };  // Copper playhead
        const juce::Colour success         { 0xFF10B981 };  // Emerald 500
        const juce::Colour warning         { 0xFFF59E0B };  // Amber 500
        const juce::Colour error           { 0xFFEF4444 };  // Red 500
      const juce::Colour knobTrack       { 0xFF355161 };  // Steel track
      const juce::Colour knobValue       { 0xFF00C2FF };  // Cyan value
      const juce::Colour knobGlow        { 0x3300C2FF };  // Cyan glow
    } colours;
    
    // Reference to processor
    TimeStretchXProcessor& audioProcessor;
    
    // Custom look and feel
    NoDAWLookAndFeel noDAWLookAndFeel;
    
    // Main components
    std::unique_ptr<AnimatedIcon> logo;
    std::unique_ptr<WaveformDisplay> waveformDisplay;
    std::unique_ptr<DualKnob> timeStretchKnob;
    std::unique_ptr<DualKnob> pitchShiftKnob;
    std::unique_ptr<AlgorithmSelector> algorithmSelector;
    std::unique_ptr<PresetBrowser> presetBrowser;
    
    // Secondary controls
    juce::Slider mixSlider;
    juce::Slider outputSlider;
    juce::Slider qualitySlider;
    juce::ToggleButton keyLockButton;
    juce::ToggleButton linkButton;
    juce::ToggleButton independentSwitch;
    
    // Standalone-only controls
    juce::TextButton loadButton;
    juce::TextButton playButton;
    juce::Label positionLabel;
    bool isStandalone = false;
    
    // Labels
    juce::Label titleLabel;
    juce::Label versionLabel;
    juce::Label timeStretchLabel;
    juce::Label pitchShiftLabel;
    juce::Label mixLabel;
    juce::Label outputLabel;
    juce::Label qualityLabel;
    
    // Value displays
    juce::Label timeStretchValue;
    juce::Label pitchShiftValue;
    
    // Parameter attachments
    using SliderAttachment = juce::AudioProcessorValueTreeState::SliderAttachment;
    using ButtonAttachment = juce::AudioProcessorValueTreeState::ButtonAttachment;
    using ComboBoxAttachment = juce::AudioProcessorValueTreeState::ComboBoxAttachment;
    
    std::unique_ptr<SliderAttachment> timeStretchAttachment;
    std::unique_ptr<SliderAttachment> pitchShiftAttachment;
    std::unique_ptr<SliderAttachment> formantShiftAttachment;
    std::unique_ptr<SliderAttachment> mixAttachment;
    std::unique_ptr<SliderAttachment> outputAttachment;
    std::unique_ptr<SliderAttachment> qualityAttachment;
    std::unique_ptr<ButtonAttachment> keyLockAttachment;
    std::unique_ptr<ButtonAttachment> linkAttachment;
    std::unique_ptr<ComboBoxAttachment> algorithmAttachment;

    // Standalone waveform sync state
    bool waveformBoundToProcessorBuffer = false;
    bool isUpdatingLinkedControls = false;
    
    // Window dimensions
    static constexpr int WINDOW_WIDTH = 700;
    static constexpr int WINDOW_HEIGHT = 500;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(TimeStretchXEditor)
};
