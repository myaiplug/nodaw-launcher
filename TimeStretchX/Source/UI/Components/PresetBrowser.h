/*
  ==============================================================================

    PresetBrowser.h
    Preset management and browser component
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "../LookAndFeel/Colours.h"
#include "../../State/PresetManager.h"

class PresetBrowser : public juce::Component
{
public:
    PresetBrowser();
    ~PresetBrowser() override;
    
    //==========================================================================
    // Preset management
    void loadPreset(const juce::String& presetName);
    void savePreset(const juce::String& presetName);
    void deletePreset(const juce::String& presetName);
    
    void setPresetDirectory(const juce::File& directory);
    void refreshPresetList();
    
    juce::String getCurrentPresetName() const { return currentPresetName; }
    
    //==========================================================================
    // Callbacks
    std::function<void(const juce::File&)> onPresetLoad;
    std::function<void(const juce::ValueTree&)> onFactoryPresetLoad;
    std::function<juce::ValueTree()> onPresetSave;  // Return state to save
    
    //==========================================================================
    // Component
    void paint(juce::Graphics& g) override;
    void resized() override;
    
private:
    void showPresetMenu();
    void showSaveDialog();
    void populateMenu(juce::PopupMenu& menu);
    
    // Current state
    juce::String currentPresetName = "Default";
    juce::File presetDirectory;
    juce::StringArray presetNames;
    
    // UI Components
    juce::TextButton presetButton;
    juce::TextButton prevButton;
    juce::TextButton nextButton;
    juce::TextButton saveButton;
    
    std::vector<PresetManager::Preset> factoryPresets = PresetManager::getFactoryPresets();
    
    int currentPresetIndex = 0;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(PresetBrowser)
};
