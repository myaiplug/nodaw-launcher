/*
  ==============================================================================

    DualKnob.h
    Premium dual-function rotary knob with animated feedback
    
    Features:
    - Smooth arc animation
    - Value tooltip on hover
    - Glow effects
    - Customizable accent colors
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "../LookAndFeel/Colours.h"

class DualKnob : public juce::Component,
                 private juce::Slider::Listener
{
public:
    DualKnob();
    ~DualKnob() override;
    
    //==========================================================================
    // Configuration
    void setRange(double min, double max, double interval = 0.0);
    void setValue(double newValue, juce::NotificationType notification = juce::sendNotification);
    double getValue() const;
    
    void setLabel(const juce::String& label);
    void setUnit(const juce::String& unit);
    void setAccentColour(juce::Colour colour);
    
    //==========================================================================
    // Access internal slider for attachments
    juce::Slider& getSlider() { return slider; }
    
    //==========================================================================
    // Component overrides
    void paint(juce::Graphics& g) override;
    void resized() override;
    
    void mouseEnter(const juce::MouseEvent& event) override;
    void mouseExit(const juce::MouseEvent& event) override;
    
private:
    void sliderValueChanged(juce::Slider* s) override;
    
    juce::String formatValue(double value) const;
    void startHoverAnimation(bool hovering);
    
    // Internal slider (hidden, used for value/attachment)
    juce::Slider slider;
    
    // Display state
    juce::String labelText = "VALUE";
    juce::String unitText = "";
    juce::Colour accentColour = NoDAWColours::accentPrimary;
    juce::Colour glowColour = NoDAWColours::knobGlow;
    
    // Animation
    float currentHoverAlpha = 0.0f;
    float targetHoverAlpha = 0.0f;
    float animatedValue = 0.0f;
    
    // Cached drawing
    juce::Point<float> centre;
    float radius = 0.0f;
    float arcStartAngle = juce::MathConstants<float>::pi * 1.25f;
    float arcEndAngle = juce::MathConstants<float>::pi * 2.75f;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(DualKnob)
};
