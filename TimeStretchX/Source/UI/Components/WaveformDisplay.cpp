/*
  ==============================================================================

    WaveformDisplay.cpp
    Audio waveform visualization implementation
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#include "WaveformDisplay.h"

WaveformDisplay::WaveformDisplay()
    : thumbnail(512, formatManager, thumbnailCache)
{
    formatManager.registerBasicFormats();
    startTimerHz(30);
}

WaveformDisplay::~WaveformDisplay()
{
    stopTimer();
}

//==============================================================================
void WaveformDisplay::setAudioBuffer(const juce::AudioBuffer<float>* buffer, double sampleRate)
{
    audioBuffer = buffer;
    audioSampleRate = sampleRate;
    
    if (buffer != nullptr && buffer->getNumSamples() > 0)
    {
        audioDuration = buffer->getNumSamples() / sampleRate;
        regenerateThumbnail();
    }
    else
    {
        audioDuration = 0.0;
        peakData.clear();
    }
    
    visibleStartTime = 0.0;
    visibleEndTime = audioDuration;
    
    repaint();
}

void WaveformDisplay::loadFromFile(const juce::File& file)
{
    juce::AudioFormatManager formatManager;
    formatManager.registerBasicFormats();
    
    if (auto reader = std::unique_ptr<juce::AudioFormatReader>(
            formatManager.createReaderFor(file)))
    {
        audioSampleRate = reader->sampleRate;
        audioDuration = reader->lengthInSamples / audioSampleRate;
        
        thumbnail.setSource(new juce::FileInputSource(file));
        
        visibleStartTime = 0.0;
        visibleEndTime = audioDuration;
        
        repaint();
    }
}

void WaveformDisplay::clear()
{
    audioBuffer = nullptr;
    audioDuration = 0.0;
    playheadPosition = 0.0;
    hasSelection = false;
    peakData.clear();
    thumbnail.clear();
    repaint();
}

//==============================================================================
void WaveformDisplay::setPlayheadPosition(double positionInSeconds)
{
    playheadPosition = juce::jlimit(0.0, audioDuration, positionInSeconds);
    repaint();
}

void WaveformDisplay::setSelection(double startSeconds, double endSeconds)
{
    hasSelection = true;
    selectionStart = juce::jmin(startSeconds, endSeconds);
    selectionEnd = juce::jmax(startSeconds, endSeconds);
    repaint();
}

void WaveformDisplay::clearSelection()
{
    hasSelection = false;
    repaint();
}

void WaveformDisplay::setZoomLevel(float zoom)
{
    zoomLevel = juce::jlimit(1.0f, 100.0f, zoom);
    
    // Update visible range
    double visibleDuration = audioDuration / zoomLevel;
    double centre = (visibleStartTime + visibleEndTime) * 0.5;
    
    visibleStartTime = juce::jmax(0.0, centre - visibleDuration * 0.5);
    visibleEndTime = juce::jmin(audioDuration, centre + visibleDuration * 0.5);
    
    repaint();
}

void WaveformDisplay::setScrollPosition(float pos)
{
    scrollPosition = juce::jlimit(0.0f, 1.0f, pos);
    
    double visibleDuration = visibleEndTime - visibleStartTime;
    double maxScroll = audioDuration - visibleDuration;
    
    visibleStartTime = maxScroll * scrollPosition;
    visibleEndTime = visibleStartTime + visibleDuration;
    
    repaint();
}

//==============================================================================
void WaveformDisplay::paint(juce::Graphics& g)
{
    auto bounds = getLocalBounds().toFloat();
    
    // Background
    g.setColour(NoDAWColours::surface);
    g.fillRoundedRectangle(bounds, 8.0f);
    
    // Draw grid lines
    g.setColour(NoDAWColours::border.withAlpha(0.3f));
    const int numGridLines = 8;
    for (int i = 1; i < numGridLines; ++i)
    {
        float x = bounds.getX() + (bounds.getWidth() / numGridLines) * i;
        g.drawVerticalLine(static_cast<int>(x), bounds.getY() + 20.0f, bounds.getBottom());
    }
    
    // Centre line
    g.setColour(NoDAWColours::border.withAlpha(0.5f));
    g.drawHorizontalLine(static_cast<int>(bounds.getCentreY()), 
                         bounds.getX(), bounds.getRight());
    
    // Time ruler area
    auto rulerBounds = bounds.removeFromTop(20.0f);
    drawTimeRuler(g, rulerBounds);
    
    // Waveform area
    auto waveformBounds = bounds.reduced(4.0f, 8.0f);
    
    if (audioDuration > 0.0)
    {
        // Selection (behind waveform)
        if (hasSelection)
            drawSelection(g, waveformBounds);
        
        // Waveform
        drawWaveform(g, waveformBounds);
        
        // Playhead
        drawPlayhead(g, waveformBounds);
    }
    else
    {
        // Empty state
        g.setColour(NoDAWColours::textTertiary);
        juce::Font interFont("Inter", 14.0f, juce::Font::plain);
        g.setFont(interFont);
        g.drawText("Load audio to begin", waveformBounds, juce::Justification::centred);
    }
}

void WaveformDisplay::resized()
{
    if (audioDuration > 0.0)
    {
        regenerateThumbnail();
    }
}

void WaveformDisplay::mouseDown(const juce::MouseEvent& event)
{
    if (audioDuration <= 0.0)
        return;
    
    auto bounds = getLocalBounds().toFloat().reduced(4.0f);
    bounds.removeFromTop(20.0f);
    
    isDragging = true;
    dragStartTime = pixelToTime(static_cast<float>(event.x), bounds.getWidth());
    
    // Click sets playhead
    setPlayheadPosition(dragStartTime);
    
    if (onPositionChanged)
        onPositionChanged(playheadPosition);
}

void WaveformDisplay::mouseDrag(const juce::MouseEvent& event)
{
    if (!isDragging || audioDuration <= 0.0)
        return;
    
    auto bounds = getLocalBounds().toFloat().reduced(4.0f);
    bounds.removeFromTop(20.0f);
    
    double currentTime = pixelToTime(static_cast<float>(event.x), bounds.getWidth());
    
    // Create selection
    setSelection(dragStartTime, currentTime);
    
    if (onSelectionChanged)
        onSelectionChanged(selectionStart, selectionEnd);
}

void WaveformDisplay::mouseUp(const juce::MouseEvent& event)
{
    isDragging = false;
    
    // If selection is too small, clear it
    if (hasSelection && std::abs(selectionEnd - selectionStart) < 0.01)
    {
        clearSelection();
    }
}

void WaveformDisplay::mouseWheelMove(const juce::MouseEvent& event, 
                                      const juce::MouseWheelDetails& wheel)
{
    if (event.mods.isCtrlDown() || event.mods.isCommandDown())
    {
        // Zoom
        float newZoom = zoomLevel * (1.0f + wheel.deltaY * 0.5f);
        setZoomLevel(newZoom);
    }
    else
    {
        // Scroll
        float newScroll = scrollPosition - wheel.deltaY * 0.1f;
        setScrollPosition(newScroll);
    }
}

//==============================================================================
void WaveformDisplay::timerCallback()
{
    // Animate playhead glow
    playheadGlow = 0.5f + 0.5f * std::sin(juce::Time::getMillisecondCounterHiRes() * 0.003f);
}

void WaveformDisplay::regenerateThumbnail()
{
    int width = getWidth();
    if (width <= 0 || audioBuffer == nullptr)
        return;
    
    peakDataWidth = width;
    peakData.resize(width * 2);  // Min and max for each pixel
    
    const int numSamples = audioBuffer->getNumSamples();
    const int numChannels = audioBuffer->getNumChannels();
    const double samplesPerPixel = numSamples / static_cast<double>(width);
    
    for (int x = 0; x < width; ++x)
    {
        int startSample = static_cast<int>(x * samplesPerPixel);
        int endSample = static_cast<int>((x + 1) * samplesPerPixel);
        endSample = juce::jmin(endSample, numSamples);
        
        float minVal = 0.0f;
        float maxVal = 0.0f;
        
        for (int ch = 0; ch < numChannels; ++ch)
        {
            const float* data = audioBuffer->getReadPointer(ch);
            
            for (int s = startSample; s < endSample; ++s)
            {
                minVal = juce::jmin(minVal, data[s]);
                maxVal = juce::jmax(maxVal, data[s]);
            }
        }
        
        peakData[x * 2] = minVal;
        peakData[x * 2 + 1] = maxVal;
    }
}

void WaveformDisplay::drawWaveform(juce::Graphics& g, juce::Rectangle<float> bounds)
{
    const float centreY = bounds.getCentreY();
    const float height = bounds.getHeight() * 0.45f;
    
    // Draw using peak data or thumbnail
    if (!peakData.empty())
    {
        juce::Path waveformPath;
        
        // Calculate visible sample range
        int startX = 0;
        int endX = peakDataWidth;
        
        // Top half (maxes)
        waveformPath.startNewSubPath(bounds.getX(), centreY);
        
        for (int x = startX; x < endX; ++x)
        {
            float maxVal = peakData[x * 2 + 1];
            float xPos = bounds.getX() + (x - startX) * (bounds.getWidth() / (endX - startX));
            waveformPath.lineTo(xPos, centreY - maxVal * height);
        }
        
        // Bottom half (mins) - reverse direction
        for (int x = endX - 1; x >= startX; --x)
        {
            float minVal = peakData[x * 2];
            float xPos = bounds.getX() + (x - startX) * (bounds.getWidth() / (endX - startX));
            waveformPath.lineTo(xPos, centreY - minVal * height);
        }
        
        waveformPath.closeSubPath();
        
        // Gradient fill
        juce::ColourGradient waveGradient(
            NoDAWColours::waveformPeak, bounds.getCentreX(), bounds.getY(),
            NoDAWColours::waveformBase, bounds.getCentreX(), bounds.getBottom(),
            false
        );
        
        g.setGradientFill(waveGradient);
        g.fillPath(waveformPath);
        
        // Outline
        g.setColour(NoDAWColours::waveformBase.withAlpha(0.5f));
        g.strokePath(waveformPath, juce::PathStrokeType(1.0f));
    }
    else if (thumbnail.getTotalLength() > 0.0)
    {
        // Use thumbnail for file-based audio
        g.setColour(NoDAWColours::waveformBase);
        thumbnail.drawChannels(g, bounds.toNearestInt(), 
                               visibleStartTime, visibleEndTime, 1.0f);
    }
}

void WaveformDisplay::drawPlayhead(juce::Graphics& g, juce::Rectangle<float> bounds)
{
    if (playheadPosition < visibleStartTime || playheadPosition > visibleEndTime)
        return;
    
    float x = timeToPixel(playheadPosition, bounds.getWidth()) + bounds.getX();
    
    // Glow
    juce::ColourGradient glowGradient(
        NoDAWColours::playhead.withAlpha(0.3f * playheadGlow),
        x, bounds.getCentreY(),
        NoDAWColours::playhead.withAlpha(0.0f),
        x + 20.0f, bounds.getCentreY(),
        true
    );
    g.setGradientFill(glowGradient);
    g.fillRect(juce::Rectangle<float>(x - 20.0f, bounds.getY(), 40.0f, bounds.getHeight()));
    
    // Line
    g.setColour(NoDAWColours::playhead);
    g.drawVerticalLine(static_cast<int>(x), bounds.getY(), bounds.getBottom());
    
    // Triangle top
    juce::Path triangle;
    triangle.addTriangle(x - 6.0f, bounds.getY(), x + 6.0f, bounds.getY(), x, bounds.getY() + 8.0f);
    g.fillPath(triangle);
}

void WaveformDisplay::drawSelection(juce::Graphics& g, juce::Rectangle<float> bounds)
{
    float startX = timeToPixel(selectionStart, bounds.getWidth()) + bounds.getX();
    float endX = timeToPixel(selectionEnd, bounds.getWidth()) + bounds.getX();
    
    // Selection highlight
    g.setColour(NoDAWColours::selection);
    g.fillRect(juce::Rectangle<float>(startX, bounds.getY(), endX - startX, bounds.getHeight()));
    
    // Selection edges
    g.setColour(NoDAWColours::accentPrimary.withAlpha(0.7f));
    g.drawVerticalLine(static_cast<int>(startX), bounds.getY(), bounds.getBottom());
    g.drawVerticalLine(static_cast<int>(endX), bounds.getY(), bounds.getBottom());
}

void WaveformDisplay::drawTimeRuler(juce::Graphics& g, juce::Rectangle<float> bounds)
{
    g.setColour(NoDAWColours::textTertiary);
    juce::Font monoFont("JetBrains Mono", 10.0f, juce::Font::plain);
    g.setFont(monoFont);
    
    double visibleDuration = visibleEndTime - visibleStartTime;
    
    // Calculate appropriate time interval
    double interval = 1.0;
    if (visibleDuration > 60.0) interval = 10.0;
    else if (visibleDuration > 30.0) interval = 5.0;
    else if (visibleDuration > 10.0) interval = 2.0;
    else if (visibleDuration < 2.0) interval = 0.5;
    
    double startTime = std::ceil(visibleStartTime / interval) * interval;
    
    for (double t = startTime; t <= visibleEndTime; t += interval)
    {
        float x = timeToPixel(t, bounds.getWidth()) + bounds.getX();
        
        // Format time
        int mins = static_cast<int>(t) / 60;
        int secs = static_cast<int>(t) % 60;
        juce::String timeStr = juce::String::formatted("%d:%02d", mins, secs);
        
        g.drawText(timeStr, static_cast<int>(x) - 20, static_cast<int>(bounds.getY()),
                   40, static_cast<int>(bounds.getHeight()), juce::Justification::centred);
        
        // Tick mark
        g.drawVerticalLine(static_cast<int>(x), bounds.getBottom() - 4.0f, bounds.getBottom());
    }
}

double WaveformDisplay::pixelToTime(float x, float width) const
{
    double proportion = x / width;
    return visibleStartTime + proportion * (visibleEndTime - visibleStartTime);
}

float WaveformDisplay::timeToPixel(double time, float width) const
{
    double proportion = (time - visibleStartTime) / (visibleEndTime - visibleStartTime);
    return static_cast<float>(proportion * width);
}
