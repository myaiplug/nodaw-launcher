/*
  ==============================================================================

    NoDAWLookAndFeel.h
    Custom JUCE LookAndFeel for Time Stretch X
    
    Premium dark theme with indigo/violet accents
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "Colours.h"

class NoDAWLookAndFeel : public juce::LookAndFeel_V4
{
public:
    NoDAWLookAndFeel();
    ~NoDAWLookAndFeel() override;
    
    //==========================================================================
    // Slider (Knob) customization
    void drawRotarySlider(juce::Graphics& g,
                          int x, int y, int width, int height,
                          float sliderPosProportional,
                          float rotaryStartAngle,
                          float rotaryEndAngle,
                          juce::Slider& slider) override;
    
    void drawLinearSlider(juce::Graphics& g,
                          int x, int y, int width, int height,
                          float sliderPos, float minSliderPos, float maxSliderPos,
                          const juce::Slider::SliderStyle style,
                          juce::Slider& slider) override;
    
    //==========================================================================
    // Button customization
    void drawButtonBackground(juce::Graphics& g,
                              juce::Button& button,
                              const juce::Colour& backgroundColour,
                              bool shouldDrawButtonAsHighlighted,
                              bool shouldDrawButtonAsDown) override;
    
    void drawToggleButton(juce::Graphics& g,
                          juce::ToggleButton& button,
                          bool shouldDrawButtonAsHighlighted,
                          bool shouldDrawButtonAsDown) override;
    
    //==========================================================================
    // ComboBox customization
    void drawComboBox(juce::Graphics& g,
                      int width, int height,
                      bool isButtonDown,
                      int buttonX, int buttonY, int buttonW, int buttonH,
                      juce::ComboBox& box) override;
    
    void drawPopupMenuBackground(juce::Graphics& g, int width, int height) override;
    
    void drawPopupMenuItem(juce::Graphics& g,
                           const juce::Rectangle<int>& area,
                           bool isSeparator, bool isActive, bool isHighlighted,
                           bool isTicked, bool hasSubMenu,
                           const juce::String& text,
                           const juce::String& shortcutKeyText,
                           const juce::Drawable* icon,
                           const juce::Colour* textColour) override;
    
    //==========================================================================
    // Label customization
    void drawLabel(juce::Graphics& g, juce::Label& label) override;
    
    //==========================================================================
    // Fonts
    juce::Font getLabelFont(juce::Label& label) override;
    juce::Font getTextButtonFont(juce::TextButton& button, int buttonHeight) override;
    juce::Font getComboBoxFont(juce::ComboBox& comboBox) override;
    
    //==========================================================================
    // Helpers
    static juce::Path createRoundedRectPath(juce::Rectangle<float> bounds, float cornerSize);
    static void drawGlow(juce::Graphics& g, juce::Rectangle<float> bounds, 
                         juce::Colour colour, float radius);
    
private:
    // Prevent default font loading
    void initialise();
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(NoDAWLookAndFeel)
};
