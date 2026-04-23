/*
  ==============================================================================

    AnimatedIcon.cpp
    Hourglass-to-X morphing animated icon implementation
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#include "AnimatedIcon.h"

AnimatedIcon::AnimatedIcon()
{
    // Initialize particle pool
    sandParticles.reserve(MAX_PARTICLES);
    
    // Start animation timer at 60fps
    startTimerHz(60);
}

AnimatedIcon::~AnimatedIcon()
{
    stopTimer();
}

//==============================================================================
void AnimatedIcon::setState(State newState)
{
    if (newState == currentState)
        return;
    
    currentState = newState;
    
    switch (currentState)
    {
        case State::Hourglass:
            targetMorphProgress = 0.0f;
            break;
            
        case State::Morphing:
            // Will interpolate based on time
            break;
            
        case State::XShape:
            targetMorphProgress = 1.0f;
            break;
    }
}

void AnimatedIcon::setAnimationSpeed(float speed)
{
    animationSpeed = juce::jlimit(0.5f, 2.0f, speed);
}

void AnimatedIcon::setAudioLevel(float level)
{
    audioLevel = juce::jlimit(0.0f, 1.0f, level);
}

//==============================================================================
void AnimatedIcon::paint(juce::Graphics& g)
{
    iconBounds = getLocalBounds().toFloat().reduced(2.0f);
    const float size = juce::jmin(iconBounds.getWidth(), iconBounds.getHeight());
    
    // Background glow
    {
        juce::ColourGradient glow(
            NoDAWColours::hourglassGlow.withAlpha(0.3f + audioLevel * 0.2f),
            iconBounds.getCentreX(), iconBounds.getCentreY(),
            NoDAWColours::hourglassGlow.withAlpha(0.0f),
            iconBounds.getCentreX() + size * 0.7f, iconBounds.getCentreY(),
            true
        );
        g.setGradientFill(glow);
        g.fillEllipse(iconBounds.expanded(4.0f));
    }
    
    // Draw based on morph state
    if (morphProgress < 0.01f)
    {
        paintHourglass(g, 1.0f);
        paintSandParticles(g);
    }
    else if (morphProgress > 0.99f)
    {
        paintXShape(g, 1.0f);
        paintXFill(g);
    }
    else
    {
        // Morphing state - cross-fade and path blend
        paintHourglass(g, 1.0f - morphProgress);
        paintXShape(g, morphProgress);
        paintSandParticles(g);
    }
}

void AnimatedIcon::resized()
{
    iconBounds = getLocalBounds().toFloat().reduced(2.0f);
    const float size = juce::jmin(iconBounds.getWidth(), iconBounds.getHeight());
    
    // Rebuild paths
    hourglassPath = createHourglassPath(size);
    xPath = createXPath(size);
}

//==============================================================================
void AnimatedIcon::timerCallback()
{
    frameTime += 1.0f / 60.0f * animationSpeed;
    frameCount++;
    
    updateMorphProgress();
    updateParticles();
    
    // Auto cycle for demo (remove in production)
    if (frameCount % 240 == 0)  // Every 4 seconds
    {
        setState(currentState == State::Hourglass ? State::XShape : State::Hourglass);
    }
    
    repaint();
}

void AnimatedIcon::paintHourglass(juce::Graphics& g, float alpha)
{
    if (alpha < 0.01f)
        return;
    
    const float size = juce::jmin(iconBounds.getWidth(), iconBounds.getHeight());
    const auto centre = iconBounds.getCentre();
    
    // Create hourglass shape
    juce::Path hourglass = createHourglassPath(size);
    hourglass.applyTransform(juce::AffineTransform::translation(
        centre.x - size * 0.5f, centre.y - size * 0.5f
    ));
    
    // Draw frame
    g.setColour(NoDAWColours::hourglassFrame.withAlpha(alpha));
    g.strokePath(hourglass, juce::PathStrokeType(2.5f, juce::PathStrokeType::curved, 
                 juce::PathStrokeType::rounded));
    
    // Sand level indicator (top bulb draining)
    const float sandLevel = std::abs(std::sin(frameTime * 0.5f));
    
    // Top sand
    g.setColour(NoDAWColours::hourglassSand.withAlpha(alpha * 0.8f));
    juce::Path topSand;
    topSand.addRectangle(centre.x - size * 0.15f, 
                         centre.y - size * 0.35f,
                         size * 0.3f,
                         size * 0.2f * (1.0f - sandLevel));
    g.fillPath(topSand);
    
    // Bottom sand
    juce::Path bottomSand;
    bottomSand.addRectangle(centre.x - size * 0.15f,
                            centre.y + size * 0.35f - size * 0.2f * sandLevel,
                            size * 0.3f,
                            size * 0.2f * sandLevel);
    g.fillPath(bottomSand);
}

void AnimatedIcon::paintXShape(juce::Graphics& g, float alpha)
{
    if (alpha < 0.01f)
        return;
    
    const float size = juce::jmin(iconBounds.getWidth(), iconBounds.getHeight());
    const auto centre = iconBounds.getCentre();
    
    juce::Path x = createXPath(size);
    x.applyTransform(juce::AffineTransform::translation(
        centre.x - size * 0.5f, centre.y - size * 0.5f
    ));
    
    // Gradient fill for X
    juce::ColourGradient xGradient(
        NoDAWColours::accentPrimary.withAlpha(alpha),
        centre.x - size * 0.5f, centre.y - size * 0.5f,
        NoDAWColours::secondaryAccent.withAlpha(alpha),
        centre.x + size * 0.5f, centre.y + size * 0.5f,
        false
    );
    
    g.setGradientFill(xGradient);
    g.fillPath(x);
    
    // Outline
    g.setColour(NoDAWColours::textPrimary.withAlpha(alpha * 0.5f));
    g.strokePath(x, juce::PathStrokeType(1.5f));
}

void AnimatedIcon::paintSandParticles(juce::Graphics& g)
{
    for (const auto& p : sandParticles)
    {
        g.setColour(p.colour.withAlpha(p.life));
        g.fillEllipse(p.x - p.size * 0.5f, p.y - p.size * 0.5f, p.size, p.size);
    }
}

void AnimatedIcon::paintXFill(juce::Graphics& g)
{
    const float size = juce::jmin(iconBounds.getWidth(), iconBounds.getHeight());
    const auto centre = iconBounds.getCentre();
    
    // Animated fill effect inside X
    const float pulseSize = size * 0.3f * (0.8f + 0.2f * std::sin(frameTime * 3.0f));
    
    juce::ColourGradient fillGradient(
        NoDAWColours::hourglassSand.withAlpha(0.6f + audioLevel * 0.3f),
        centre.x, centre.y,
        NoDAWColours::hourglassSand.withAlpha(0.0f),
        centre.x + pulseSize, centre.y,
        true
    );
    
    g.setGradientFill(fillGradient);
    g.fillEllipse(centre.x - pulseSize, centre.y - pulseSize, pulseSize * 2.0f, pulseSize * 2.0f);
}

void AnimatedIcon::updateParticles()
{
    const auto centre = iconBounds.getCentre();
    
    // Only spawn particles in hourglass or morphing state
    if (morphProgress < 0.7f)
    {
        // Spawn new particles from center (neck of hourglass)
        if (sandParticles.size() < MAX_PARTICLES && (frameCount % 3 == 0))
        {
            Particle p;
            p.x = centre.x + (juce::Random::getSystemRandom().nextFloat() - 0.5f) * 6.0f;
            p.y = centre.y;
            p.vx = (juce::Random::getSystemRandom().nextFloat() - 0.5f) * 0.5f;
            p.vy = juce::Random::getSystemRandom().nextFloat() * 2.0f + 1.0f;
            p.size = juce::Random::getSystemRandom().nextFloat() * 2.0f + 1.5f;
            p.life = 1.0f;
            p.colour = NoDAWColours::hourglassSand;
            sandParticles.push_back(p);
        }
    }
    
    // Update existing particles
    for (auto it = sandParticles.begin(); it != sandParticles.end();)
    {
        it->x += it->vx;
        it->y += it->vy;
        it->vy += 0.15f;  // Gravity
        it->life -= 0.02f;
        
        // Remove dead particles
        if (it->life <= 0.0f || it->y > iconBounds.getBottom() + 10.0f)
        {
            it = sandParticles.erase(it);
        }
        else
        {
            ++it;
        }
    }
}

void AnimatedIcon::updateMorphProgress()
{
    // Smooth interpolation towards target
    const float morphSpeed = 0.03f * animationSpeed;
    
    if (std::abs(morphProgress - targetMorphProgress) > 0.001f)
    {
        morphProgress += (targetMorphProgress - morphProgress) * morphSpeed;
    }
    else
    {
        morphProgress = targetMorphProgress;
    }
    
    // Update X fill animation
    xFillLevel += 0.02f * xFillDirection;
    if (xFillLevel > 1.0f || xFillLevel < 0.0f)
    {
        xFillDirection *= -1.0f;
        xFillLevel = juce::jlimit(0.0f, 1.0f, xFillLevel);
    }
}

juce::Path AnimatedIcon::createHourglassPath(float size)
{
    juce::Path path;
    
    const float hw = size * 0.4f;   // Half width
    const float hh = size * 0.45f;  // Half height
    const float nw = size * 0.06f;  // Neck width
    
    // Top bulb (inverted trapezoid)
    path.startNewSubPath(size * 0.5f - hw, size * 0.1f);
    path.lineTo(size * 0.5f + hw, size * 0.1f);
    path.lineTo(size * 0.5f + nw, size * 0.5f);
    path.lineTo(size * 0.5f - nw, size * 0.5f);
    path.closeSubPath();
    
    // Bottom bulb (trapezoid)
    path.startNewSubPath(size * 0.5f - nw, size * 0.5f);
    path.lineTo(size * 0.5f + nw, size * 0.5f);
    path.lineTo(size * 0.5f + hw, size * 0.9f);
    path.lineTo(size * 0.5f - hw, size * 0.9f);
    path.closeSubPath();
    
    // Top cap
    path.addRoundedRectangle(size * 0.5f - hw - 4.0f, size * 0.05f, 
                              (hw + 4.0f) * 2.0f, 8.0f, 2.0f);
    
    // Bottom cap
    path.addRoundedRectangle(size * 0.5f - hw - 4.0f, size * 0.87f,
                              (hw + 4.0f) * 2.0f, 8.0f, 2.0f);
    
    return path;
}

juce::Path AnimatedIcon::createXPath(float size)
{
    juce::Path path;
    
    const float thickness = size * 0.22f;
    const float margin = size * 0.1f;
    
    // Create thick X shape
    // Diagonal 1 (top-left to bottom-right)
    path.startNewSubPath(margin, margin + thickness * 0.5f);
    path.lineTo(margin + thickness * 0.5f, margin);
    path.lineTo(size - margin, size - margin - thickness * 0.5f);
    path.lineTo(size - margin - thickness * 0.5f, size - margin);
    path.closeSubPath();
    
    // Diagonal 2 (top-right to bottom-left)
    path.startNewSubPath(size - margin, margin + thickness * 0.5f);
    path.lineTo(size - margin - thickness * 0.5f, margin);
    path.lineTo(margin, size - margin - thickness * 0.5f);
    path.lineTo(margin + thickness * 0.5f, size - margin);
    path.closeSubPath();
    
    return path;
}

juce::Path AnimatedIcon::interpolatePaths(const juce::Path& pathA, const juce::Path& pathB, float t)
{
    // Simple alpha-blend approach - for true morphing, would need point correspondence
    // This is a placeholder for more sophisticated path interpolation
    
    if (t < 0.5f)
        return pathA;
    else
        return pathB;
}
