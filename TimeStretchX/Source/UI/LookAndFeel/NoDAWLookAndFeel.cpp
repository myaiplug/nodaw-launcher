/*
  ==============================================================================

    NoDAWLookAndFeel.cpp
    Custom JUCE LookAndFeel Implementation
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#include "NoDAWLookAndFeel.h"

NoDAWLookAndFeel::NoDAWLookAndFeel()
{
    initialise();
}

NoDAWLookAndFeel::~NoDAWLookAndFeel()
{
}

void NoDAWLookAndFeel::initialise()
{
    // Set global colours
    setColour(juce::Slider::backgroundColourId, NoDAWColours::knobBackground);
    setColour(juce::Slider::trackColourId, NoDAWColours::knobTrack);
    setColour(juce::Slider::thumbColourId, NoDAWColours::accentPrimary);
    setColour(juce::Slider::rotarySliderFillColourId, NoDAWColours::knobValue);
    setColour(juce::Slider::rotarySliderOutlineColourId, NoDAWColours::knobTrack);
    
    setColour(juce::TextButton::buttonColourId, NoDAWColours::surface);
    setColour(juce::TextButton::buttonOnColourId, NoDAWColours::accentPrimary);
    setColour(juce::TextButton::textColourOffId, NoDAWColours::textPrimary);
    setColour(juce::TextButton::textColourOnId, NoDAWColours::textPrimary);
    
    setColour(juce::ToggleButton::textColourId, NoDAWColours::textPrimary);
    setColour(juce::ToggleButton::tickColourId, NoDAWColours::accentPrimary);
    setColour(juce::ToggleButton::tickDisabledColourId, NoDAWColours::textDisabled);
    
    setColour(juce::ComboBox::backgroundColourId, NoDAWColours::surface);
    setColour(juce::ComboBox::textColourId, NoDAWColours::textPrimary);
    setColour(juce::ComboBox::arrowColourId, NoDAWColours::textSecondary);
    setColour(juce::ComboBox::outlineColourId, NoDAWColours::border);
    setColour(juce::ComboBox::focusedOutlineColourId, NoDAWColours::borderFocus);
    
    setColour(juce::PopupMenu::backgroundColourId, NoDAWColours::surface);
    setColour(juce::PopupMenu::textColourId, NoDAWColours::textPrimary);
    setColour(juce::PopupMenu::highlightedBackgroundColourId, NoDAWColours::accentMuted);
    setColour(juce::PopupMenu::highlightedTextColourId, NoDAWColours::textPrimary);
    
    setColour(juce::Label::textColourId, NoDAWColours::textPrimary);
}

//==============================================================================
void NoDAWLookAndFeel::drawRotarySlider(juce::Graphics& g,
                                         int x, int y, int width, int height,
                                         float sliderPos,
                                         float rotaryStartAngle,
                                         float rotaryEndAngle,
                                         juce::Slider& slider)
{
    const auto bounds = juce::Rectangle<int>(x, y, width, height).toFloat().reduced(4.0f);
    const auto radius = juce::jmin(bounds.getWidth(), bounds.getHeight()) / 2.0f;
    const auto centreX = bounds.getCentreX();
    const auto centreY = bounds.getCentreY();
    const auto rx = centreX - radius;
    const auto ry = centreY - radius;
    const auto rw = radius * 2.0f;
    const auto angle = rotaryStartAngle + sliderPos * (rotaryEndAngle - rotaryStartAngle);
    
    // Track thickness
    const float trackWidth = 4.0f;
    const float valueWidth = 5.0f;
    
    //==========================================================================
    // Outer glow (when active)
    if (slider.isMouseOverOrDragging())
    {
        drawGlow(g, bounds.expanded(8.0f), NoDAWColours::knobGlow, 12.0f);
    }
    
    //==========================================================================
    // Background circle
    g.setColour(NoDAWColours::knobBackground);
    g.fillEllipse(rx, ry, rw, rw);
    
    // Border
    g.setColour(NoDAWColours::border);
    g.drawEllipse(rx, ry, rw, rw, 1.0f);
    
    //==========================================================================
    // Track arc (background)
    juce::Path trackArc;
    trackArc.addCentredArc(centreX, centreY, 
                           radius - trackWidth - 6.0f, 
                           radius - trackWidth - 6.0f,
                           0.0f, rotaryStartAngle, rotaryEndAngle, true);
    
    g.setColour(NoDAWColours::knobTrack);
    g.strokePath(trackArc, juce::PathStrokeType(trackWidth, juce::PathStrokeType::curved, juce::PathStrokeType::rounded));
    
    //==========================================================================
    // Value arc
    if (sliderPos > 0.0f)
    {
        juce::Path valueArc;
        valueArc.addCentredArc(centreX, centreY,
                               radius - trackWidth - 6.0f,
                               radius - trackWidth - 6.0f,
                               0.0f, rotaryStartAngle, angle, true);
        
        // Gradient fill
        auto gradientColour = NoDAWColours::accentGradient(rx, ry, rx + rw, ry + rw);
        g.setGradientFill(gradientColour);
        g.strokePath(valueArc, juce::PathStrokeType(valueWidth, juce::PathStrokeType::curved, juce::PathStrokeType::rounded));
    }
    
    //==========================================================================
    // Centre dot/pointer
    juce::Path pointer;
    const float pointerLength = radius * 0.5f;
    const float pointerThickness = 3.0f;
    
    pointer.addRectangle(-pointerThickness * 0.5f, -pointerLength, pointerThickness, pointerLength * 0.6f);
    pointer.applyTransform(juce::AffineTransform::rotation(angle).translated(centreX, centreY));
    
    g.setColour(NoDAWColours::knobPointer);
    g.fillPath(pointer);
    
    // Centre circle
    const float centreSize = 8.0f;
    g.setColour(NoDAWColours::accentPrimary);
    g.fillEllipse(centreX - centreSize * 0.5f, centreY - centreSize * 0.5f, centreSize, centreSize);
}

void NoDAWLookAndFeel::drawLinearSlider(juce::Graphics& g,
                                         int x, int y, int width, int height,
                                         float sliderPos, float minSliderPos, float maxSliderPos,
                                         const juce::Slider::SliderStyle style,
                                         juce::Slider& slider)
{
    const bool isHorizontal = style == juce::Slider::LinearHorizontal ||
                              style == juce::Slider::LinearBar;
    
    auto trackBounds = juce::Rectangle<float>(
        static_cast<float>(x), static_cast<float>(y),
        static_cast<float>(width), static_cast<float>(height)
    );
    
    const float trackHeight = 4.0f;
    const float cornerRadius = trackHeight * 0.5f;
    
    if (isHorizontal)
    {
        trackBounds = trackBounds.withSizeKeepingCentre(trackBounds.getWidth(), trackHeight);
    }
    else
    {
        trackBounds = trackBounds.withSizeKeepingCentre(trackHeight, trackBounds.getHeight());
    }
    
    // Background track
    g.setColour(NoDAWColours::knobTrack);
    g.fillRoundedRectangle(trackBounds, cornerRadius);
    
    // Value track
    auto valueBounds = trackBounds;
    if (isHorizontal)
    {
        valueBounds.setWidth(sliderPos - static_cast<float>(x));
    }
    else
    {
        const float valueHeight = static_cast<float>(y + height) - sliderPos;
        valueBounds.setY(sliderPos);
        valueBounds.setHeight(valueHeight);
    }
    
    if (valueBounds.getWidth() > 0 && valueBounds.getHeight() > 0)
    {
        g.setColour(NoDAWColours::accentPrimary);
        g.fillRoundedRectangle(valueBounds, cornerRadius);
    }
    
    // Thumb
    const float thumbSize = 14.0f;
    juce::Rectangle<float> thumbBounds;
    
    if (isHorizontal)
    {
        thumbBounds = juce::Rectangle<float>(thumbSize, thumbSize)
                          .withCentre(juce::Point<float>(sliderPos, trackBounds.getCentreY()));
    }
    else
    {
        thumbBounds = juce::Rectangle<float>(thumbSize, thumbSize)
                          .withCentre(juce::Point<float>(trackBounds.getCentreX(), sliderPos));
    }
    
    // Thumb shadow
    g.setColour(juce::Colours::black.withAlpha(0.3f));
    g.fillEllipse(thumbBounds.translated(0.0f, 1.0f));
    
    // Thumb
    g.setColour(NoDAWColours::textPrimary);
    g.fillEllipse(thumbBounds);
    
    // Thumb border
    g.setColour(NoDAWColours::border);
    g.drawEllipse(thumbBounds, 1.0f);
}

//==============================================================================
void NoDAWLookAndFeel::drawButtonBackground(juce::Graphics& g,
                                             juce::Button& button,
                                             const juce::Colour& backgroundColour,
                                             bool shouldDrawButtonAsHighlighted,
                                             bool shouldDrawButtonAsDown)
{
    auto bounds = button.getLocalBounds().toFloat().reduced(1.0f);
    const float cornerRadius = 8.0f;
    
    juce::Colour bgColour = backgroundColour;
    
    if (shouldDrawButtonAsDown)
        bgColour = NoDAWColours::accentPressed;
    else if (shouldDrawButtonAsHighlighted)
        bgColour = NoDAWColours::elevated;
    
    if (button.getToggleState())
        bgColour = NoDAWColours::accentPrimary;
    
    // Shadow
    g.setColour(juce::Colours::black.withAlpha(0.2f));
    g.fillRoundedRectangle(bounds.translated(0.0f, 2.0f), cornerRadius);
    
    // Background
    g.setColour(bgColour);
    g.fillRoundedRectangle(bounds, cornerRadius);
    
    // Border
    g.setColour(NoDAWColours::border);
    g.drawRoundedRectangle(bounds, cornerRadius, 1.0f);
    
    // Highlight
    if (shouldDrawButtonAsHighlighted && !shouldDrawButtonAsDown)
    {
        g.setColour(NoDAWColours::glass10);
        g.fillRoundedRectangle(bounds.removeFromTop(bounds.getHeight() * 0.5f), cornerRadius);
    }
}

void NoDAWLookAndFeel::drawToggleButton(juce::Graphics& g,
                                         juce::ToggleButton& button,
                                         bool shouldDrawButtonAsHighlighted,
                                         bool shouldDrawButtonAsDown)
{
    auto bounds = button.getLocalBounds().toFloat();
    
    const float toggleHeight = 22.0f;
    const float toggleWidth = 42.0f;
    const float thumbSize = 18.0f;
    const float cornerRadius = toggleHeight * 0.5f;
    
    auto toggleBounds = bounds.withSizeKeepingCentre(toggleWidth, toggleHeight);
    
    // Background
    const bool isOn = button.getToggleState();
    g.setColour(isOn ? NoDAWColours::accentPrimary : NoDAWColours::knobTrack);
    g.fillRoundedRectangle(toggleBounds, cornerRadius);
    
    // Border
    g.setColour(NoDAWColours::border);
    g.drawRoundedRectangle(toggleBounds, cornerRadius, 1.0f);
    
    // Thumb
    const float thumbX = isOn ? 
        toggleBounds.getRight() - thumbSize - 2.0f : 
        toggleBounds.getX() + 2.0f;
    
    auto thumbBounds = juce::Rectangle<float>(thumbX, toggleBounds.getCentreY() - thumbSize * 0.5f, thumbSize, thumbSize);
    
    g.setColour(NoDAWColours::textPrimary);
    g.fillEllipse(thumbBounds);
}

//==============================================================================
void NoDAWLookAndFeel::drawComboBox(juce::Graphics& g,
                                     int width, int height,
                                     bool isButtonDown,
                                     int buttonX, int buttonY, int buttonW, int buttonH,
                                     juce::ComboBox& box)
{
    auto bounds = juce::Rectangle<float>(0, 0, static_cast<float>(width), static_cast<float>(height));
    const float cornerRadius = 8.0f;
    
    // Background
    g.setColour(NoDAWColours::surface);
    g.fillRoundedRectangle(bounds, cornerRadius);
    
    // Border
    g.setColour(box.hasKeyboardFocus(true) ? NoDAWColours::borderFocus : NoDAWColours::border);
    g.drawRoundedRectangle(bounds.reduced(0.5f), cornerRadius, 1.0f);
    
    // Arrow
    auto arrowBounds = juce::Rectangle<float>(
        static_cast<float>(buttonX), static_cast<float>(buttonY),
        static_cast<float>(buttonW), static_cast<float>(buttonH)
    );
    
    juce::Path arrow;
    arrow.addTriangle(
        arrowBounds.getCentreX() - 5.0f, arrowBounds.getCentreY() - 2.0f,
        arrowBounds.getCentreX() + 5.0f, arrowBounds.getCentreY() - 2.0f,
        arrowBounds.getCentreX(), arrowBounds.getCentreY() + 4.0f
    );
    
    g.setColour(NoDAWColours::textSecondary);
    g.fillPath(arrow);
}

void NoDAWLookAndFeel::drawPopupMenuBackground(juce::Graphics& g, int width, int height)
{
    auto bounds = juce::Rectangle<float>(0, 0, static_cast<float>(width), static_cast<float>(height));
    
    // Shadow
    g.setColour(juce::Colours::black.withAlpha(0.3f));
    g.fillRoundedRectangle(bounds.translated(2.0f, 2.0f), 8.0f);
    
    // Background
    g.setColour(NoDAWColours::surface);
    g.fillRoundedRectangle(bounds, 8.0f);
    
    // Border
    g.setColour(NoDAWColours::border);
    g.drawRoundedRectangle(bounds.reduced(0.5f), 8.0f, 1.0f);
}

void NoDAWLookAndFeel::drawPopupMenuItem(juce::Graphics& g,
                                          const juce::Rectangle<int>& area,
                                          bool isSeparator, bool isActive, bool isHighlighted,
                                          bool isTicked, bool hasSubMenu,
                                          const juce::String& text,
                                          const juce::String& shortcutKeyText,
                                          const juce::Drawable* icon,
                                          const juce::Colour* textColour)
{
    if (isSeparator)
    {
        auto sepBounds = area.toFloat().reduced(8.0f, 0.0f);
        g.setColour(NoDAWColours::border);
        g.fillRect(sepBounds.withHeight(1.0f).withY(sepBounds.getCentreY()));
        return;
    }
    
    auto bounds = area.toFloat().reduced(4.0f, 2.0f);
    
    if (isHighlighted)
    {
        g.setColour(NoDAWColours::accentMuted);
        g.fillRoundedRectangle(bounds, 4.0f);
    }
    
    g.setColour(isActive ? NoDAWColours::textPrimary : NoDAWColours::textDisabled);
    g.setFont(14.0f);
    g.drawText(text, bounds.reduced(8.0f, 0.0f), juce::Justification::centredLeft, true);
    
    if (isTicked)
    {
        auto tickBounds = bounds.removeFromRight(24.0f).reduced(4.0f);
        g.setColour(NoDAWColours::accentPrimary);
        g.fillEllipse(tickBounds.withSizeKeepingCentre(8.0f, 8.0f));
    }
}

//==============================================================================
void NoDAWLookAndFeel::drawLabel(juce::Graphics& g, juce::Label& label)
{
    g.fillAll(label.findColour(juce::Label::backgroundColourId));
    
    if (!label.isBeingEdited())
    {
        const juce::Font font(getLabelFont(label));
        g.setColour(label.findColour(juce::Label::textColourId));
        g.setFont(font);
        
        auto textArea = label.getBorderSize().subtractedFrom(label.getLocalBounds());
        
        g.drawFittedText(label.getText(), textArea, label.getJustificationType(),
                         juce::jmax(1, static_cast<int>(textArea.getHeight() / font.getHeight())),
                         label.getMinimumHorizontalScale());
    }
}

//==============================================================================
juce::Font NoDAWLookAndFeel::getLabelFont(juce::Label& label)
{
    return label.getFont();
}

juce::Font NoDAWLookAndFeel::getTextButtonFont(juce::TextButton& button, int buttonHeight)
{
    juce::Font font(juce::FontOptions("Sora", juce::jmin(15.0f, static_cast<float>(buttonHeight) * 0.6f), juce::Font::bold));
    return font;
}

juce::Font NoDAWLookAndFeel::getComboBoxFont(juce::ComboBox& comboBox)
{
    juce::Font font(juce::FontOptions("Sora", 14.0f, juce::Font::plain));
    return font;
}

//==============================================================================
juce::Path NoDAWLookAndFeel::createRoundedRectPath(juce::Rectangle<float> bounds, float cornerSize)
{
    juce::Path path;
    path.addRoundedRectangle(bounds, cornerSize);
    return path;
}

void NoDAWLookAndFeel::drawGlow(juce::Graphics& g, juce::Rectangle<float> bounds, 
                                 juce::Colour colour, float radius)
{
    juce::ColourGradient gradient(
        colour, bounds.getCentreX(), bounds.getCentreY(),
        colour.withAlpha(0.0f), bounds.getX(), bounds.getY(),
        true
    );
    
    g.setGradientFill(gradient);
    g.fillEllipse(bounds);
}
