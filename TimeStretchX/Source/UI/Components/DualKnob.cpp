/*
  ==============================================================================

    DualKnob.cpp
    Premium dual-function rotary knob implementation
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#include "DualKnob.h"

DualKnob::DualKnob()
{
    // Configure internal slider
    slider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    slider.setTextBoxStyle(juce::Slider::NoTextBox, false, 0, 0);
    slider.addListener(this);
    slider.setAlpha(0.0f);  // Hidden but functional
    addAndMakeVisible(slider);
}

DualKnob::~DualKnob()
{
    slider.removeListener(this);
}

//==============================================================================
void DualKnob::setRange(double min, double max, double interval)
{
    slider.setRange(min, max, interval);
}

void DualKnob::setValue(double newValue, juce::NotificationType notification)
{
    slider.setValue(newValue, notification);
}

double DualKnob::getValue() const
{
    return slider.getValue();
}

void DualKnob::setLabel(const juce::String& label)
{
    labelText = label;
    repaint();
}

void DualKnob::setUnit(const juce::String& unit)
{
    unitText = unit;
    repaint();
}

void DualKnob::setAccentColour(juce::Colour colour)
{
    accentColour = colour;
    glowColour = colour.withAlpha(0.2f);
    repaint();
}

//==============================================================================
void DualKnob::paint(juce::Graphics& g)
{
    const auto bounds = getLocalBounds().toFloat().reduced(8.0f);
    radius = juce::jmin(bounds.getWidth(), bounds.getHeight()) / 2.0f;
    centre = bounds.getCentre();
    
    const float trackWidth = 4.0f;
    const float valueWidth = 5.0f;
    const float trackRadius = radius - 8.0f;
    
    //==========================================================================
    // Outer glow (animated)
    if (currentHoverAlpha > 0.01f)
    {
        juce::ColourGradient glowGradient(
            glowColour.withAlpha(currentHoverAlpha * 0.4f),
            centre.x, centre.y,
            glowColour.withAlpha(0.0f),
            centre.x + radius + 15.0f, centre.y,
            true
        );
        g.setGradientFill(glowGradient);
        g.fillEllipse(bounds.expanded(10.0f));
    }
    
    //==========================================================================
    // Background circle
    g.setColour(NoDAWColours::knobBackground);
    g.fillEllipse(centre.x - radius, centre.y - radius, radius * 2.0f, radius * 2.0f);
    
    // Border
    g.setColour(NoDAWColours::border);
    g.drawEllipse(centre.x - radius, centre.y - radius, radius * 2.0f, radius * 2.0f, 1.0f);
    
    //==========================================================================
    // Background track arc
    juce::Path trackArc;
    trackArc.addCentredArc(centre.x, centre.y, trackRadius, trackRadius, 
                           0.0f, arcStartAngle, arcEndAngle, true);
    
    g.setColour(NoDAWColours::knobTrack);
    g.strokePath(trackArc, juce::PathStrokeType(trackWidth, 
                 juce::PathStrokeType::curved, juce::PathStrokeType::rounded));
    
    //==========================================================================
    // Value arc
    const double normalised = slider.valueToProportionOfLength(slider.getValue());
    const float angle = arcStartAngle + static_cast<float>(normalised) * (arcEndAngle - arcStartAngle);
    
    if (normalised > 0.001)
    {
        juce::Path valueArc;
        valueArc.addCentredArc(centre.x, centre.y, trackRadius, trackRadius,
                               0.0f, arcStartAngle, angle, true);
        
        // Gradient for value arc
        juce::ColourGradient arcGradient(
            accentColour, centre.x - trackRadius, centre.y,
            NoDAWColours::secondaryAccent, centre.x + trackRadius, centre.y,
            false
        );
        g.setGradientFill(arcGradient);
        g.strokePath(valueArc, juce::PathStrokeType(valueWidth, 
                     juce::PathStrokeType::curved, juce::PathStrokeType::rounded));
    }
    
    //==========================================================================
    // Pointer line
    juce::Path pointer;
    const float pointerLength = radius * 0.4f;
    const float pointerWidth = 3.0f;
    
    pointer.addRoundedRectangle(-pointerWidth * 0.5f, -trackRadius + 12.0f, 
                                 pointerWidth, pointerLength, pointerWidth * 0.5f);
    pointer.applyTransform(juce::AffineTransform::rotation(angle).translated(centre.x, centre.y));
    
    g.setColour(NoDAWColours::textPrimary);
    g.fillPath(pointer);
    
    //==========================================================================
    // Centre dot
    const float dotSize = 8.0f;
    g.setColour(accentColour);
    g.fillEllipse(centre.x - dotSize * 0.5f, centre.y - dotSize * 0.5f, dotSize, dotSize);
    
    //==========================================================================
    // Value display in centre
    const juce::String valueStr = formatValue(slider.getValue());
    
    g.setColour(NoDAWColours::textPrimary);
    juce::Font monoFont(juce::FontOptions("IBM Plex Mono", 16.0f, juce::Font::bold));
    g.setFont(monoFont);
    g.drawText(valueStr, bounds.withSizeKeepingCentre(radius * 1.5f, 20.0f).translated(0.0f, radius * 0.15f),
               juce::Justification::centred, false);
    
    //==========================================================================
    // Label at bottom
    g.setColour(NoDAWColours::textTertiary);
    juce::Font labelFont(juce::FontOptions("Sora", 10.0f, juce::Font::bold));
    g.setFont(labelFont);
    auto labelBounds = juce::Rectangle<float>(bounds.getX(), bounds.getBottom() - 16.0f, bounds.getWidth(), 16.0f).translated(0.0f, 4.0f);
    g.drawText(labelText, labelBounds, juce::Justification::centred, false);
}

void DualKnob::resized()
{
    // Invisible slider covers entire component for interaction
    slider.setBounds(getLocalBounds());
}

void DualKnob::mouseEnter(const juce::MouseEvent& event)
{
    startHoverAnimation(true);
}

void DualKnob::mouseExit(const juce::MouseEvent& event)
{
    startHoverAnimation(false);
}

//==============================================================================
void DualKnob::sliderValueChanged(juce::Slider* s)
{
    if (s == &slider)
    {
        repaint();
    }
}

juce::String DualKnob::formatValue(double value) const
{
    juce::String formatted;
    
    // Format based on range
    if (slider.getMaximum() - slider.getMinimum() > 10.0)
    {
        formatted = juce::String(value, 1);
    }
    else
    {
        formatted = juce::String(value, 2);
    }
    
    if (unitText.isNotEmpty())
    {
        formatted += unitText;
    }
    
    return formatted;
}

void DualKnob::startHoverAnimation(bool hovering)
{
    targetHoverAlpha = hovering ? 1.0f : 0.0f;
    
    // Simple animation using timer (could use animator for smoother results)
    auto animate = [this]()
    {
        const float step = 0.15f;
        if (std::abs(currentHoverAlpha - targetHoverAlpha) > 0.01f)
        {
            currentHoverAlpha += (targetHoverAlpha - currentHoverAlpha) * step;
            repaint();
        }
    };
    
    // For now, just set directly (proper animation would use AsyncUpdater or Timer)
    currentHoverAlpha = targetHoverAlpha;
    repaint();
}
