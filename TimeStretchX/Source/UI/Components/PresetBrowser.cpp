/*
  ==============================================================================

    PresetBrowser.cpp
    Preset browser implementation
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#include "PresetBrowser.h"

PresetBrowser::PresetBrowser()
{
    // Preset name button
    presetButton.setButtonText(currentPresetName);
    presetButton.onClick = [this] { showPresetMenu(); };
    addAndMakeVisible(presetButton);
    
    // Navigation buttons
    prevButton.setButtonText("<");
    prevButton.onClick = [this] 
    {
        if (currentPresetIndex > 0)
        {
            currentPresetIndex--;
            loadPreset(factoryPresets[currentPresetIndex].name);
        }
    };
    addAndMakeVisible(prevButton);
    
    nextButton.setButtonText(">");
    nextButton.onClick = [this]
    {
        if (currentPresetIndex < static_cast<int>(factoryPresets.size()) - 1)
        {
            currentPresetIndex++;
            loadPreset(factoryPresets[currentPresetIndex].name);
        }
    };
    addAndMakeVisible(nextButton);
    
    // Save button
    saveButton.setButtonText("SAVE");
    saveButton.onClick = [this] { showSaveDialog(); };
    addAndMakeVisible(saveButton);
    
    // Set default preset directory
    presetDirectory = juce::File::getSpecialLocation(juce::File::userDocumentsDirectory)
                          .getChildFile("NoDAW").getChildFile("TimeStretchX").getChildFile("Presets");
    
    if (!presetDirectory.exists())
        presetDirectory.createDirectory();
    
    refreshPresetList();
}

PresetBrowser::~PresetBrowser()
{
}

//==============================================================================
void PresetBrowser::loadPreset(const juce::String& presetName)
{
    currentPresetName = presetName;
    presetButton.setButtonText(presetName);

    bool loadedFactoryPreset = false;
    for (const auto& preset : factoryPresets)
    {
        if (preset.name == presetName)
        {
            if (onFactoryPresetLoad)
                onFactoryPresetLoad(preset.state.createCopy());

            loadedFactoryPreset = true;
            break;
        }
    }

    // Fall back to user preset file
    juce::File presetFile = presetDirectory.getChildFile(presetName + ".xml");

    if (!loadedFactoryPreset && presetFile.existsAsFile() && onPresetLoad)
    {
        onPresetLoad(presetFile);
    }
    
    // Update index if it's a factory preset
    for (int i = 0; i < static_cast<int>(factoryPresets.size()); ++i)
    {
        if (factoryPresets[i].name == presetName)
        {
            currentPresetIndex = i;
            break;
        }
    }
    
    repaint();
}

void PresetBrowser::savePreset(const juce::String& presetName)
{
    if (presetName.isEmpty())
        return;
    
    juce::File presetFile = presetDirectory.getChildFile(presetName + ".xml");
    
    if (onPresetSave)
    {
        auto state = onPresetSave();
        
        // Save to file
        std::unique_ptr<juce::XmlElement> xml(state.createXml());
        if (xml)
        {
            xml->writeTo(presetFile);
            currentPresetName = presetName;
            presetButton.setButtonText(presetName);
            refreshPresetList();
        }
    }
}

void PresetBrowser::deletePreset(const juce::String& presetName)
{
    juce::File presetFile = presetDirectory.getChildFile(presetName + ".xml");
    
    if (presetFile.existsAsFile())
    {
        presetFile.deleteFile();
        refreshPresetList();
        
        if (currentPresetName == presetName)
        {
            loadPreset("Default");
        }
    }
}

void PresetBrowser::setPresetDirectory(const juce::File& directory)
{
    presetDirectory = directory;
    refreshPresetList();
}

void PresetBrowser::refreshPresetList()
{
    presetNames.clear();
    
    if (presetDirectory.exists())
    {
        for (const auto& file : presetDirectory.findChildFiles(
                 juce::File::findFiles, false, "*.xml"))
        {
            presetNames.add(file.getFileNameWithoutExtension());
        }
    }
}

//==============================================================================
void PresetBrowser::paint(juce::Graphics& g)
{
    auto bounds = getLocalBounds().toFloat();
    
    // Background
    g.setColour(NoDAWColours::surface);
    g.fillRoundedRectangle(bounds, 6.0f);
    
    // Border
    g.setColour(NoDAWColours::border);
    g.drawRoundedRectangle(bounds.reduced(0.5f), 6.0f, 1.0f);
}

void PresetBrowser::resized()
{
    auto bounds = getLocalBounds().reduced(4);
    
    // Layout: [<] [Preset Name...] [>] [SAVE]
    prevButton.setBounds(bounds.removeFromLeft(24));
    bounds.removeFromLeft(4);
    
    saveButton.setBounds(bounds.removeFromRight(50));
    bounds.removeFromRight(4);
    
    nextButton.setBounds(bounds.removeFromRight(24));
    bounds.removeFromRight(4);
    
    presetButton.setBounds(bounds);
}

void PresetBrowser::showPresetMenu()
{
    juce::PopupMenu menu;
    populateMenu(menu);
    
    menu.showMenuAsync(juce::PopupMenu::Options()
        .withTargetComponent(&presetButton)
        .withMinimumWidth(200),
        [this](int result)
        {
            if (result > 0 && result <= static_cast<int>(factoryPresets.size()))
            {
                loadPreset(factoryPresets[result - 1].name);
            }
            else if (result > 100)
            {
                int userPresetIndex = result - 101;
                if (userPresetIndex < presetNames.size())
                {
                    loadPreset(presetNames[userPresetIndex]);
                }
            }
        });
}

void PresetBrowser::showSaveDialog()
{
    auto* dialog = new juce::AlertWindow("Save Preset", 
                                          "Enter a name for the preset:",
                                          juce::MessageBoxIconType::NoIcon);
    
    dialog->addTextEditor("name", currentPresetName, "Preset Name:");
    dialog->addButton("Save", 1);
    dialog->addButton("Cancel", 0);
    
    dialog->enterModalState(true, juce::ModalCallbackFunction::create(
        [this, dialog](int result)
        {
            if (result == 1)
            {
                juce::String name = dialog->getTextEditorContents("name");
                savePreset(name);
            }
            delete dialog;
        }), true);
}

void PresetBrowser::populateMenu(juce::PopupMenu& menu)
{
    // Factory presets by category
    juce::StringArray categories;
    for (const auto& preset : factoryPresets)
    {
        if (!categories.contains(preset.category))
            categories.add(preset.category);
    }
    
    for (const auto& category : categories)
    {
        juce::PopupMenu submenu;
        int id = 1;
        
        for (const auto& preset : factoryPresets)
        {
            if (preset.category == category)
            {
                submenu.addItem(id, preset.name, true, preset.name == currentPresetName);
            }
            id++;
        }
        
        menu.addSubMenu(category, submenu);
    }
    
    // User presets
    if (presetNames.size() > 0)
    {
        menu.addSeparator();
        
        juce::PopupMenu userMenu;
        for (int i = 0; i < presetNames.size(); ++i)
        {
            userMenu.addItem(101 + i, presetNames[i], true, 
                             presetNames[i] == currentPresetName);
        }
        
        menu.addSubMenu("User Presets", userMenu);
    }
}
