/*
  ==============================================================================

    AlgorithmSelector.h
    Time-stretch algorithm selection component
    
    Algorithms:
    - Phase Vocoder: Best for musical content, preserves tonality
    - Granular: Creative effects, good for experimental sounds
    - WSOLA: Time-domain, best for speech, lowest latency
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "../LookAndFeel/Colours.h"

class AlgorithmSelector : public juce::Component
{
public:
    AlgorithmSelector();
    ~AlgorithmSelector() override;
    
    //==========================================================================
    // Selection
    void setSelectedAlgorithm(int index);
    int getSelectedAlgorithm() const { return selectedIndex; }
    
    //==========================================================================
    // Callbacks
    std::function<void(int)> onAlgorithmChanged;
    
    //==========================================================================
    // Access internal combo for attachments
    juce::ComboBox& getComboBox() { return comboBox; }
    
    //==========================================================================
    // Component
    void paint(juce::Graphics& g) override;
    void resized() override;
    
private:
    void comboBoxChanged();
    
    juce::ComboBox comboBox;
    juce::Label label;
    
    // Algorithm info
    struct AlgorithmInfo
    {
        juce::String name;
        juce::String shortDesc;
        juce::String icon;  // Unicode/emoji icon
    };
    
    std::vector<AlgorithmInfo> algorithms = {
        { "Phase Vocoder", "Best for music", "\xF0\x9F\x8E\xB5" },  // 🎵
        { "Granular", "Creative/experimental", "\xE2\x9C\xA8" },     // ✨
        { "WSOLA", "Low latency/speech", "\xF0\x9F\x8E\xA4" }        // 🎤
    };
    
    int selectedIndex = 0;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(AlgorithmSelector)
};
