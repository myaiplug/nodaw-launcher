/*
  ==============================================================================

    Colours.h
    Color palette definitions for Time Stretch X
    
    Design System Colors from Awwwards-winning specification
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>

namespace NoDAWColours
{
    //==========================================================================
    // Background System
    //==========================================================================
    
    // Primary backgrounds
    const juce::Colour voidBlack     { 0xFF0A1117 };  // Main background
    const juce::Colour surface       { 0xFF13202A };  // Card/panel surfaces
    const juce::Colour elevated      { 0xFF1B2E3B };  // Elevated elements
    
    // Glassmorphic overlays
    const juce::Colour glass10       { 0x1AFFFFFF };  // 10% white
    const juce::Colour glass20       { 0x33FFFFFF };  // 20% white
    const juce::Colour glass05       { 0x0DFFFFFF };  // 5% white
    
    // Borders
    const juce::Colour border        { 0xFF27414F };  // Default border
    const juce::Colour borderSubtle  { 0x1AFFFFFF };  // Subtle dividers
    const juce::Colour borderFocus   { 0xFF00C2FF };  // Focus ring (electric cyan)
    
    //==========================================================================
    // Text System
    //==========================================================================
    
    const juce::Colour textPrimary   { 0xFFFFFFFF };  // 100% white
    const juce::Colour textSecondary { 0x99FFFFFF };  // 60% white
    const juce::Colour textTertiary  { 0x66FFFFFF };  // 40% white
    const juce::Colour textDisabled  { 0x33FFFFFF };  // 20% white
    
    //==========================================================================
    // Accent Colors (Electric Cyan)
    //==========================================================================
    
    const juce::Colour accentPrimary    { 0xFF00C2FF };  // Electric cyan
    const juce::Colour accentHover      { 0xFF52D9FF };  // Hover cyan
    const juce::Colour accentPressed    { 0xFF0098CC };  // Pressed cyan
    const juce::Colour accentMuted      { 0x3300C2FF };  // 20% cyan
    
    //==========================================================================
    // Secondary Accent (Copper)
    //==========================================================================
    
    const juce::Colour secondaryAccent  { 0xFFFF8A00 };  // Copper/amber
    const juce::Colour secondaryHover   { 0xFFFFAA4D };  // Hover copper
    const juce::Colour secondaryPressed { 0xFFE06A00 };  // Pressed copper
    const juce::Colour secondaryMuted   { 0x33FF8A00 };  // 20% copper
    
    //==========================================================================
    // Waveform Colors
    //==========================================================================
    
    const juce::Colour waveformBase  { 0xFF00C2FF };  // Electric cyan
    const juce::Colour waveformPeak  { 0xFFFF8A00 };  // Copper
    const juce::Colour waveformRMS   { 0x6600C2FF };  // 40% cyan
    const juce::Colour playhead      { 0xFFFFFFFF };  // White
    const juce::Colour selection     { 0x3300C2FF };  // Selection highlight
    
    //==========================================================================
    // Status & Feedback
    //==========================================================================
    
    const juce::Colour success       { 0xFF10B981 };  // Emerald 500
    const juce::Colour successMuted  { 0x3310B981 };
    const juce::Colour warning       { 0xFFF59E0B };  // Amber 500
    const juce::Colour warningMuted  { 0x33F59E0B };
    const juce::Colour error         { 0xFFEF4444 };  // Red 500
    const juce::Colour errorMuted    { 0x33EF4444 };
    const juce::Colour info          { 0xFF3B82F6 };  // Blue 500
    const juce::Colour infoMuted     { 0x333B82F6 };
    
    //==========================================================================
    // Knob & Control Colors
    //==========================================================================
    
    const juce::Colour knobBackground   { 0xFF1A1A24 };
    const juce::Colour knobTrack        { 0xFF355161 };  // Cool steel
    const juce::Colour knobValue        { 0xFF00C2FF };  // Electric cyan
    const juce::Colour knobValueAlt     { 0xFFFF8A00 };  // Copper
    const juce::Colour knobPointer      { 0xFFFFFFFF };
    const juce::Colour knobGlow         { 0x3300C2FF };  // Cyan glow
    const juce::Colour knobGlowAlt      { 0x33FF8A00 };  // Copper glow
    
    //==========================================================================
    // Gradient helpers
    //==========================================================================
    
    inline juce::ColourGradient accentGradient(float x1, float y1, float x2, float y2)
    {
        return juce::ColourGradient(
            accentPrimary, x1, y1,
            secondaryAccent, x2, y2,
            false
        );
    }
    
    inline juce::ColourGradient surfaceGradient(float x1, float y1, float x2, float y2)
    {
        return juce::ColourGradient(
            voidBlack, x1, y1,
            surface.darker(0.3f), x2, y2,
            false
        );
    }
    
    //==========================================================================
    // Icon Animation Colors (Hourglass)
    //==========================================================================
    
    const juce::Colour hourglassFrame  { 0xFF00C2FF };  // Electric cyan
    const juce::Colour hourglassSand   { 0xFFFF8A00 };  // Copper
    const juce::Colour hourglassGlow   { 0x6600C2FF };  // Glow effect
    const juce::Colour xFill           { 0xFF00C2FF };  // X morph fill
}
