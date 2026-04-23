/*
  ==============================================================================

    WaveformDisplay.h
    Audio waveform visualization with playhead and selection
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "../LookAndFeel/Colours.h"

class WaveformDisplay : public juce::Component,
                        private juce::Timer
{
public:
    WaveformDisplay();
    ~WaveformDisplay() override;
    
    //==========================================================================
    // Audio data
    void setAudioBuffer(const juce::AudioBuffer<float>* buffer, double sampleRate);
    void loadFromFile(const juce::File& file);
    void clear();
    
    //==========================================================================
    // Playback state
    void setPlayheadPosition(double positionInSeconds);
    void setSelection(double startSeconds, double endSeconds);
    void clearSelection();
    
    //==========================================================================
    // Zoom & scroll
    void setZoomLevel(float zoom);  // 1.0 = fit all, >1 = zoom in
    void setScrollPosition(float pos);  // 0-1
    
    //==========================================================================
    // Component
    void paint(juce::Graphics& g) override;
    void resized() override;
    void mouseDown(const juce::MouseEvent& event) override;
    void mouseDrag(const juce::MouseEvent& event) override;
    void mouseUp(const juce::MouseEvent& event) override;
    void mouseWheelMove(const juce::MouseEvent& event, const juce::MouseWheelDetails& wheel) override;
    
    //==========================================================================
    // Callbacks
    std::function<void(double)> onPositionChanged;
    std::function<void(double, double)> onSelectionChanged;
    
private:
    void timerCallback() override;
    void regenerateThumbnail();
    void drawWaveform(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawPlayhead(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawSelection(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawTimeRuler(juce::Graphics& g, juce::Rectangle<float> bounds);
    
    double pixelToTime(float x, float width) const;
    float timeToPixel(double time, float width) const;
    
    //==========================================================================
    // Audio data
    const juce::AudioBuffer<float>* audioBuffer = nullptr;
    double audioSampleRate = 44100.0;
    double audioDuration = 0.0;
    
    // Thumbnail for efficient drawing
    juce::AudioFormatManager formatManager;
    juce::AudioThumbnailCache thumbnailCache{ 1 };
    juce::AudioThumbnail thumbnail;
    
    // Playhead
    double playheadPosition = 0.0;
    
    // Selection
    bool hasSelection = false;
    double selectionStart = 0.0;
    double selectionEnd = 0.0;
    bool isDragging = false;
    double dragStartTime = 0.0;
    
    // View
    float zoomLevel = 1.0f;
    float scrollPosition = 0.0f;
    double visibleStartTime = 0.0;
    double visibleEndTime = 0.0;
    
    // Cached peaks for fast drawing
    std::vector<float> peakData;
    int peakDataWidth = 0;
    
    // Animation
    float playheadGlow = 0.0f;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(WaveformDisplay)
};
