/*
  ==============================================================================

    AnimatedIcon.h
    Hourglass-to-X morphing animated icon
    
    Animation sequence:
    1. Hourglass with flowing sand particles
    2. Morphs into bold "X" shape
    3. X fills with animated particles
    4. Loops or responds to audio input
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "../LookAndFeel/Colours.h"

class AnimatedIcon : public juce::Component,
                     private juce::Timer
{
public:
    AnimatedIcon();
    ~AnimatedIcon() override;
    
    //==========================================================================
    // State control
    enum class State
    {
        Hourglass,
        Morphing,
        XShape
    };
    
    void setState(State newState);
    State getState() const { return currentState; }
    
    void setAnimationSpeed(float speed);  // 0.5 - 2.0
    void setAudioLevel(float level);      // For responsive animation
    
    //==========================================================================
    // Component
    void paint(juce::Graphics& g) override;
    void resized() override;
    
private:
    void timerCallback() override;
    
    void paintHourglass(juce::Graphics& g, float alpha);
    void paintXShape(juce::Graphics& g, float alpha);
    void paintSandParticles(juce::Graphics& g);
    void paintXFill(juce::Graphics& g);
    
    void updateParticles();
    void updateMorphProgress();
    
    juce::Path createHourglassPath(float size);
    juce::Path createXPath(float size);
    juce::Path interpolatePaths(const juce::Path& pathA, const juce::Path& pathB, float t);
    
    //==========================================================================
    // State
    State currentState = State::Hourglass;
    float morphProgress = 0.0f;       // 0 = hourglass, 1 = X
    float targetMorphProgress = 0.0f;
    float animationSpeed = 1.0f;
    float audioLevel = 0.0f;
    
    // Sand particle system
    struct Particle
    {
        float x, y;
        float vx, vy;
        float size;
        float life;
        juce::Colour colour;
    };
    
    std::vector<Particle> sandParticles;
    static constexpr int MAX_PARTICLES = 30;
    
    // X fill animation
    float xFillLevel = 0.0f;
    float xFillDirection = 1.0f;
    
    // Frame timing
    float frameTime = 0.0f;
    int frameCount = 0;
    
    // Cached paths
    juce::Path hourglassPath;
    juce::Path xPath;
    juce::Rectangle<float> iconBounds;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(AnimatedIcon)
};
