/*
  ==============================================================================

    AlgorithmSelector.cpp
    Algorithm selection component implementation
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#include "AlgorithmSelector.h"

AlgorithmSelector::AlgorithmSelector()
{
    // Setup label
    label.setText("ALGORITHM", juce::dontSendNotification);
    juce::Font labelFont(juce::FontOptions("Sora", 10.0f, juce::Font::bold));
    label.setFont(labelFont);
    label.setColour(juce::Label::textColourId, NoDAWColours::textTertiary);
    addAndMakeVisible(label);
    
    // Setup combo box
    for (int i = 0; i < static_cast<int>(algorithms.size()); ++i)
    {
        comboBox.addItem(algorithms[i].name, i + 1);
    }
    comboBox.setSelectedId(1);
    comboBox.onChange = [this] { comboBoxChanged(); };
    addAndMakeVisible(comboBox);
}

AlgorithmSelector::~AlgorithmSelector()
{
}

//==============================================================================
void AlgorithmSelector::setSelectedAlgorithm(int index)
{
    selectedIndex = juce::jlimit(0, static_cast<int>(algorithms.size()) - 1, index);
    comboBox.setSelectedId(selectedIndex + 1, juce::dontSendNotification);
    repaint();
}

void AlgorithmSelector::paint(juce::Graphics& g)
{
    auto bounds = getLocalBounds().toFloat();
    
    // Info tooltip area when hovered
    if (isMouseOver())
    {
        auto infoBounds = bounds.removeFromBottom(16.0f);
        g.setColour(NoDAWColours::textTertiary);
        juce::Font infoFont(juce::FontOptions("Sora", 9.0f, juce::Font::plain));
        g.setFont(infoFont);
        g.drawText(algorithms[selectedIndex].shortDesc, infoBounds, 
                   juce::Justification::centredLeft);
    }
}

void AlgorithmSelector::resized()
{
    auto bounds = getLocalBounds();
    
    label.setBounds(bounds.removeFromTop(14));
    bounds.removeFromTop(2);
    
    comboBox.setBounds(bounds.removeFromTop(30));
}

void AlgorithmSelector::comboBoxChanged()
{
    selectedIndex = comboBox.getSelectedId() - 1;
    
    if (onAlgorithmChanged)
        onAlgorithmChanged(selectedIndex);
    
    repaint();
}
