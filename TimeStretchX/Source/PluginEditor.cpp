/*
  ==============================================================================

    PluginEditor.cpp
    Time Stretch X - Main UI Editor Implementation
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#include "PluginProcessor.h"
#include "PluginEditor.h"
#include "State/ParameterLayout.h"
#include <cmath>

//==============================================================================
TimeStretchXEditor::TimeStretchXEditor(TimeStretchXProcessor& p)
    : AudioProcessorEditor(&p), audioProcessor(p)
{
    // Apply custom look and feel
    setLookAndFeel(&noDAWLookAndFeel);
    
    // Check if standalone
    isStandalone = audioProcessor.wrapperType == juce::AudioProcessor::wrapperType_Standalone;
    
    //==========================================================================
    // Create animated logo/icon
    logo = std::make_unique<AnimatedIcon>();
    addAndMakeVisible(logo.get());

    presetBrowser = std::make_unique<PresetBrowser>();
    presetBrowser->onFactoryPresetLoad = [this](const juce::ValueTree& state)
    {
        audioProcessor.applyPresetState(state);
    };
    presetBrowser->onPresetLoad = [this](const juce::File& presetFile)
    {
        juce::ValueTree presetState;
        if (audioProcessor.getPresetManager().loadPreset(presetFile, presetState))
        {
            audioProcessor.applyPresetState(presetState);
            return;
        }

        std::unique_ptr<juce::XmlElement> xml(juce::XmlDocument::parse(presetFile));
        if (xml != nullptr)
            audioProcessor.applyPresetState(juce::ValueTree::fromXml(*xml));
    };
    presetBrowser->onPresetSave = [this]
    {
        return audioProcessor.copyPresetState();
    };
    addAndMakeVisible(presetBrowser.get());
    
    //==========================================================================
    // Title label
    titleLabel.setText("TIME STRETCH X", juce::dontSendNotification);
    titleLabel.setFont(juce::Font(juce::FontOptions("Sora", 24.0f, juce::Font::bold)));
    titleLabel.setColour(juce::Label::textColourId, colours.textPrimary);
    titleLabel.setJustificationType(juce::Justification::centredLeft);
    addAndMakeVisible(titleLabel);
    
    // Version label
    versionLabel.setText("v1.0.0", juce::dontSendNotification);
    versionLabel.setFont(juce::Font(juce::FontOptions("Sora", 11.0f, juce::Font::plain)));
    versionLabel.setColour(juce::Label::textColourId, colours.textTertiary);
    addAndMakeVisible(versionLabel);
    
    //==========================================================================
    // Waveform display
    waveformDisplay = std::make_unique<WaveformDisplay>();
    addAndMakeVisible(waveformDisplay.get());
    
    //==========================================================================
    // Main dual knobs
    
    // Time Stretch knob
    timeStretchKnob = std::make_unique<DualKnob>();
    timeStretchKnob->setRange(0.25, 4.0, 0.01);
    timeStretchKnob->setValue(1.0);
    timeStretchKnob->setLabel("TIME");
    timeStretchKnob->setUnit("x");
    addAndMakeVisible(timeStretchKnob.get());
    
    timeStretchLabel.setText("TIME STRETCH", juce::dontSendNotification);
    timeStretchLabel.setFont(juce::Font(juce::FontOptions("Sora", 11.0f, juce::Font::bold)));
    timeStretchLabel.setColour(juce::Label::textColourId, colours.textSecondary);
    timeStretchLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(timeStretchLabel);
    
    // Pitch Shift knob
    pitchShiftKnob = std::make_unique<DualKnob>();
    pitchShiftKnob->setRange(-24.0, 24.0, 0.1);
    pitchShiftKnob->setValue(0.0);
    pitchShiftKnob->setLabel("PITCH");
    pitchShiftKnob->setUnit("st");
    pitchShiftKnob->setAccentColour(colours.accentSecondary);
    addAndMakeVisible(pitchShiftKnob.get());
    
    pitchShiftLabel.setText("PITCH SHIFT", juce::dontSendNotification);
    pitchShiftLabel.setFont(juce::Font(juce::FontOptions("Sora", 11.0f, juce::Font::bold)));
    pitchShiftLabel.setColour(juce::Label::textColourId, colours.textSecondary);
    pitchShiftLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(pitchShiftLabel);
    
    //==========================================================================
    // Algorithm selector
    algorithmSelector = std::make_unique<AlgorithmSelector>();
    addAndMakeVisible(algorithmSelector.get());
    
    //==========================================================================
    // Quality slider
    qualitySlider.setSliderStyle(juce::Slider::LinearHorizontal);
    qualitySlider.setTextBoxStyle(juce::Slider::NoTextBox, false, 0, 0);
    qualitySlider.setRange(1.0, 5.0, 1.0);
    addAndMakeVisible(qualitySlider);
    
    qualityLabel.setText("QUALITY", juce::dontSendNotification);
    qualityLabel.setFont(juce::Font(juce::FontOptions("Sora", 10.0f, juce::Font::bold)));
    qualityLabel.setColour(juce::Label::textColourId, colours.textTertiary);
    addAndMakeVisible(qualityLabel);
    
    //==========================================================================
    // Mix slider
    mixSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    mixSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 16);
    mixSlider.setRange(0.0, 100.0, 1.0);
    addAndMakeVisible(mixSlider);
    
    mixLabel.setText("MIX", juce::dontSendNotification);
    mixLabel.setFont(juce::Font(juce::FontOptions("Sora", 10.0f, juce::Font::bold)));
    mixLabel.setColour(juce::Label::textColourId, colours.textTertiary);
    mixLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(mixLabel);
    
    //==========================================================================
    // Output slider
    outputSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    outputSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 16);
    outputSlider.setRange(-24.0, 12.0, 0.1);
    addAndMakeVisible(outputSlider);
    
    outputLabel.setText("OUTPUT", juce::dontSendNotification);
    outputLabel.setFont(juce::Font(juce::FontOptions("Sora", 10.0f, juce::Font::bold)));
    outputLabel.setColour(juce::Label::textColourId, colours.textTertiary);
    outputLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(outputLabel);
    
    //==========================================================================
    // Key lock toggle
    keyLockButton.setButtonText("KEY LOCK");
    keyLockButton.setToggleState(true, juce::dontSendNotification);
    addAndMakeVisible(keyLockButton);
    
    // Link toggle (hidden backing control for APVTS attachment)
    linkButton.setButtonText("LINK");
    linkButton.setToggleState(false, juce::dontSendNotification);
    linkButton.setVisible(false);
    addAndMakeVisible(linkButton);

    // Independent LED switch (inverse of LINK parameter)
    independentSwitch.setButtonText("INDEPENDENT");
    independentSwitch.setClickingTogglesState(true);
    independentSwitch.setToggleState(true, juce::dontSendNotification);
    independentSwitch.onClick = [this]
    {
        // LINK=true means coupled, so INDEPENDENT is inverse.
        const bool independent = independentSwitch.getToggleState();
        linkButton.setToggleState(!independent, juce::sendNotificationSync);
    };
    addAndMakeVisible(independentSwitch);
    
    //==========================================================================
    // Standalone controls
    if (isStandalone)
    {
        loadButton.setButtonText("LOAD AUDIO");
        loadButton.onClick = [this] { loadAudioFile(); };
        addAndMakeVisible(loadButton);
        
        playButton.setButtonText("PLAY");
        playButton.onClick = [this] { togglePlayback(); };
        addAndMakeVisible(playButton);
        
        positionLabel.setText("0:00 / 0:00", juce::dontSendNotification);
        positionLabel.setFont(juce::Font(juce::FontOptions("IBM Plex Mono", 12.0f, juce::Font::plain)));
        positionLabel.setColour(juce::Label::textColourId, colours.textSecondary);
        positionLabel.setJustificationType(juce::Justification::centred);
        addAndMakeVisible(positionLabel);
    }
    
    //==========================================================================
    // Parameter attachments
    auto& apvts = audioProcessor.getAPVTS();
    
    timeStretchAttachment = std::make_unique<SliderAttachment>(
        apvts, ParameterLayout::TIME_STRETCH_ID, timeStretchKnob->getSlider());
    
    pitchShiftAttachment = std::make_unique<SliderAttachment>(
        apvts, ParameterLayout::PITCH_SHIFT_ID, pitchShiftKnob->getSlider());
    
    mixAttachment = std::make_unique<SliderAttachment>(
        apvts, ParameterLayout::MIX_ID, mixSlider);
    
    outputAttachment = std::make_unique<SliderAttachment>(
        apvts, ParameterLayout::OUTPUT_GAIN_ID, outputSlider);
    
    qualityAttachment = std::make_unique<SliderAttachment>(
        apvts, ParameterLayout::QUALITY_ID, qualitySlider);
    
    keyLockAttachment = std::make_unique<ButtonAttachment>(
        apvts, ParameterLayout::KEY_LOCK_ID, keyLockButton);
    
    linkAttachment = std::make_unique<ButtonAttachment>(
        apvts, ParameterLayout::LINKED_ID, linkButton);

    // Keep independent switch in sync after APVTS attachment initializes link state.
    independentSwitch.setToggleState(!linkButton.getToggleState(), juce::dontSendNotification);

    // Real-time coupling behavior when LINK is enabled.
    timeStretchKnob->getSlider().onValueChange = [this]
    {
        if (isUpdatingLinkedControls || !linkButton.getToggleState())
            return;

        const auto t = static_cast<float>(timeStretchKnob->getSlider().getValue());
        const auto linkedPitch = static_cast<double>(juce::jlimit(-24.0f, 24.0f, -12.0f * std::log2(juce::jmax(0.001f, t))));

        isUpdatingLinkedControls = true;
        pitchShiftKnob->getSlider().setValue(linkedPitch, juce::sendNotificationSync);
        isUpdatingLinkedControls = false;
    };

    pitchShiftKnob->getSlider().onValueChange = [this]
    {
        if (isUpdatingLinkedControls || !linkButton.getToggleState())
            return;

        const auto p = static_cast<float>(pitchShiftKnob->getSlider().getValue());
        const auto linkedTime = static_cast<double>(juce::jlimit(0.25f, 4.0f, std::pow(2.0f, -p / 12.0f)));

        isUpdatingLinkedControls = true;
        timeStretchKnob->getSlider().setValue(linkedTime, juce::sendNotificationSync);
        isUpdatingLinkedControls = false;
    };

    algorithmAttachment = std::make_unique<ComboBoxAttachment>(
        apvts, ParameterLayout::ALGORITHM_ID, algorithmSelector->getComboBox());
    
    //==========================================================================
    // Set size
    const int height = isStandalone ? WINDOW_HEIGHT + 60 : WINDOW_HEIGHT;
    setSize(WINDOW_WIDTH, height);
    
    // Start timer for animations
    startTimerHz(60);
}

TimeStretchXEditor::~TimeStretchXEditor()
{
    setLookAndFeel(nullptr);
}

//==============================================================================
void TimeStretchXEditor::paint(juce::Graphics& g)
{
    // Background gradient
    juce::ColourGradient gradient(
        colours.background,
        0.0f, 0.0f,
        colours.surface.darker(0.3f),
        0.0f, static_cast<float>(getHeight()),
        false
    );
    g.setGradientFill(gradient);
    g.fillAll();
    
    // Subtle grid pattern
    g.setColour(colours.border.withAlpha(0.1f));
    const int gridSize = 20;
    for (int x = 0; x < getWidth(); x += gridSize)
        g.drawVerticalLine(x, 0.0f, static_cast<float>(getHeight()));
    for (int y = 0; y < getHeight(); y += gridSize)
        g.drawHorizontalLine(y, 0.0f, static_cast<float>(getWidth()));
    
    // Header divider
    g.setColour(colours.border);
    g.drawHorizontalLine(60, 20.0f, getWidth() - 20.0f);

    // Stereo output meter panel
    const auto meterPanel = juce::Rectangle<float>(getWidth() - 126.0f, 16.0f, 92.0f, 38.0f);
    g.setColour(colours.surface.withAlpha(0.9f));
    g.fillRoundedRectangle(meterPanel, 8.0f);
    g.setColour(colours.border.withAlpha(0.8f));
    g.drawRoundedRectangle(meterPanel, 8.0f, 1.0f);

    const auto toDb = [](float linear) -> float
    {
        return juce::Decibels::gainToDecibels(juce::jmax(0.00001f, linear));
    };
    const auto toNorm = [](float dB) -> float
    {
        return juce::jlimit(0.0f, 1.0f, (dB + 60.0f) / 60.0f);
    };

    const float meterW = 30.0f;
    const float meterH = 24.0f;
    const float meterY = meterPanel.getY() + 10.0f;

    const float lNorm = toNorm(toDb(audioProcessor.getRmsLevel(0)));
    const float rNorm = toNorm(toDb(audioProcessor.getRmsLevel(1)));

    auto drawMeter = [&](float x, float norm, const juce::String& label)
    {
        const auto meterBounds = juce::Rectangle<float>(x, meterY, meterW, meterH);
        g.setColour(colours.knobTrack.withAlpha(0.7f));
        g.fillRoundedRectangle(meterBounds, 3.0f);

        if (norm > 0.0f)
        {
            auto fill = meterBounds;
            fill.setY(fill.getBottom() - fill.getHeight() * norm);
            fill.setHeight(meterBounds.getHeight() * norm);

            juce::ColourGradient grad(
                juce::Colour(0xFF10B981), fill.getCentreX(), fill.getBottom(),
                juce::Colour(0xFFEF4444), fill.getCentreX(), fill.getY(), false);
            g.setGradientFill(grad);
            g.fillRoundedRectangle(fill, 3.0f);
        }

        g.setColour(colours.textTertiary);
        juce::Font meterFont(juce::FontOptions("Sora", 9.0f, juce::Font::bold));
        g.setFont(meterFont);
        g.drawText(label, meterBounds.withY(meterBounds.getBottom() + 1.0f).toNearestInt(), juce::Justification::centred);
    };

    drawMeter(meterPanel.getX() + 12.0f, lNorm, "L");
    drawMeter(meterPanel.getX() + 50.0f, rNorm, "R");
    
    // Waveform section border
    auto waveformBounds = waveformDisplay->getBounds().toFloat().expanded(1.0f);
    g.setColour(colours.border);
    g.drawRoundedRectangle(waveformBounds, 8.0f, 1.0f);
    
    // Knob section background
    auto knobArea = juce::Rectangle<float>(
        20.0f, 260.0f, 
        getWidth() - 40.0f, 140.0f
    );
    g.setColour(colours.surface.withAlpha(0.5f));
    g.fillRoundedRectangle(knobArea, 12.0f);
    g.setColour(colours.border);
    g.drawRoundedRectangle(knobArea, 12.0f, 1.0f);
    
    // Link indicator line between knobs
    if (linkButton.getToggleState())
    {
        auto knob1Center = timeStretchKnob->getBounds().getCentre().toFloat();
        auto knob2Center = pitchShiftKnob->getBounds().getCentre().toFloat();
        
        g.setColour(colours.accentPrimary.withAlpha(0.4f));
        g.drawLine(knob1Center.x, knob1Center.y, knob2Center.x, knob2Center.y, 2.0f);
    }

    // Independent LED status (green = independent, amber = linked)
    const auto ledBounds = independentSwitch.getBounds().toFloat().withTrimmedLeft(6.0f).withWidth(10.0f).withHeight(10.0f).withY(independentSwitch.getY() + 10.0f);
    const bool independentOn = independentSwitch.getToggleState();
    const auto ledColour = independentOn ? colours.success : colours.warning;
    g.setColour(ledColour.withAlpha(0.20f));
    g.fillEllipse(ledBounds.expanded(4.0f));
    g.setColour(ledColour);
    g.fillEllipse(ledBounds);
}

void TimeStretchXEditor::resized()
{
    auto bounds = getLocalBounds().reduced(20);
    
    //==========================================================================
    // Header area
    auto header = bounds.removeFromTop(50);
    
    // Logo on left
    logo->setBounds(header.removeFromLeft(40).withSizeKeepingCentre(40, 40));
    header.removeFromLeft(10);
    
    // Title
    titleLabel.setBounds(header.removeFromLeft(180).withTrimmedTop(5));
    versionLabel.setBounds(titleLabel.getBounds().translated(0, 25).withHeight(15));

    header.removeFromLeft(12);
    if (presetBrowser)
        presetBrowser->setBounds(header.removeFromRight(240).withTrimmedTop(4).withTrimmedBottom(4));
    
    bounds.removeFromTop(20);
    
    //==========================================================================
    // Waveform area
    auto waveformArea = bounds.removeFromTop(120);
    waveformDisplay->setBounds(waveformArea);
    
    bounds.removeFromTop(20);
    
    //==========================================================================
    // Main knobs area
    auto knobArea = bounds.removeFromTop(130);
    
    const int knobSize = 110;
    const int spacing = 60;
    const int totalKnobWidth = knobSize * 2 + spacing;
    const int startX = (knobArea.getWidth() - totalKnobWidth) / 2;
    
    // Time stretch knob
    timeStretchKnob->setBounds(
        knobArea.getX() + startX,
        knobArea.getY() + 5,
        knobSize, knobSize
    );
    timeStretchLabel.setBounds(
        timeStretchKnob->getX() - 10,
        timeStretchKnob->getBottom() + 2,
        knobSize + 20, 16
    );
    
    // Pitch shift knob
    pitchShiftKnob->setBounds(
        knobArea.getX() + startX + knobSize + spacing,
        knobArea.getY() + 5,
        knobSize, knobSize
    );
    pitchShiftLabel.setBounds(
        pitchShiftKnob->getX() - 10,
        pitchShiftKnob->getBottom() + 2,
        knobSize + 20, 16
    );
    
    // Independent LED switch between knobs
    independentSwitch.setBounds(
        timeStretchKnob->getRight() + 8,
        timeStretchKnob->getY() + 35,
        50, 40
    );
    
    bounds.removeFromTop(20);
    
    //==========================================================================
    // Controls row
    auto controlsArea = bounds.removeFromTop(80);
    const int controlWidth = 70;
    const int controlHeight = 70;
    const int controlSpacing = 20;
    
    // Spread controls across width
    int controlsStartX = 20;
    
    // Algorithm selector
    algorithmSelector->setBounds(controlsStartX, controlsArea.getY(), 120, 50);
    controlsStartX += 140;
    
    // Quality
    qualityLabel.setBounds(controlsStartX, controlsArea.getY(), 80, 14);
    qualitySlider.setBounds(controlsStartX, controlsArea.getY() + 16, 100, 30);
    controlsStartX += 120;
    
    // Key lock
    keyLockButton.setBounds(controlsStartX, controlsArea.getY() + 10, 80, 30);
    controlsStartX += 100;
    
    // Mix knob
    mixLabel.setBounds(controlsStartX, controlsArea.getY(), controlWidth, 14);
    mixSlider.setBounds(controlsStartX, controlsArea.getY() + 14, controlWidth, controlHeight - 14);
    controlsStartX += controlWidth + controlSpacing;
    
    // Output knob
    outputLabel.setBounds(controlsStartX, controlsArea.getY(), controlWidth, 14);
    outputSlider.setBounds(controlsStartX, controlsArea.getY() + 14, controlWidth, controlHeight - 14);
    
    //==========================================================================
    // Standalone controls (transport bar)
    if (isStandalone)
    {
        bounds.removeFromTop(10);
        auto transportArea = bounds.removeFromTop(50);
        
        loadButton.setBounds(transportArea.removeFromLeft(120).withTrimmedTop(10).withTrimmedBottom(10));
        transportArea.removeFromLeft(20);
        
        playButton.setBounds(transportArea.removeFromLeft(80).withTrimmedTop(10).withTrimmedBottom(10));
        transportArea.removeFromLeft(20);
        
        positionLabel.setBounds(transportArea.removeFromLeft(150).withTrimmedTop(15).withTrimmedBottom(5));
    }
}

//==============================================================================
void TimeStretchXEditor::timerCallback()
{
    // Update logo animation
    if (logo)
        logo->repaint();

    repaint(juce::Rectangle<int>(getWidth() - 130, 12, 100, 44));
    
    // Update waveform
    updateWaveform();

    // Keep independent switch synced to parameter automation/state recall.
    const bool independentFromParam = !linkButton.getToggleState();
    if (independentSwitch.getToggleState() != independentFromParam)
        independentSwitch.setToggleState(independentFromParam, juce::dontSendNotification);
    
    // Update position label in standalone mode
    if (isStandalone)
    {
        if (audioProcessor.hasLoadedAudio())
        {
            if (!waveformBoundToProcessorBuffer && waveformDisplay)
            {
                waveformDisplay->setAudioBuffer(&audioProcessor.getLoadedAudio(), audioProcessor.getSampleRate());
                waveformBoundToProcessorBuffer = true;
            }

            if (waveformDisplay)
                waveformDisplay->setPlayheadPosition(audioProcessor.getPlayPosition());
        }
        else if (waveformBoundToProcessorBuffer)
        {
            if (waveformDisplay)
                waveformDisplay->clear();

            waveformBoundToProcessorBuffer = false;
        }

        // Format current position
        double pos = audioProcessor.getPlayPosition();
        double length = audioProcessor.getLoadedAudioLength();
        
        auto formatTime = [](double seconds) -> juce::String
        {
            int mins = static_cast<int>(seconds) / 60;
            int secs = static_cast<int>(seconds) % 60;
            return juce::String::formatted("%d:%02d", mins, secs);
        };
        
        positionLabel.setText(
            formatTime(pos) + " / " + formatTime(length),
            juce::dontSendNotification
        );
        
        // Update play button state
        playButton.setButtonText(audioProcessor.isPlaying() ? "STOP" : "PLAY");
    }
}

void TimeStretchXEditor::updateWaveform()
{
    // Would update waveform visualization here
    if (waveformDisplay)
        waveformDisplay->repaint();
}

void TimeStretchXEditor::loadAudioFile()
{
    auto chooser = std::make_shared<juce::FileChooser>(
        "Load Audio File",
        juce::File{},
        "*.wav;*.mp3;*.flac;*.aiff;*.ogg"
    );
    
    auto chooserFlags = juce::FileBrowserComponent::openMode |
                        juce::FileBrowserComponent::canSelectFiles;
    
    chooser->launchAsync(chooserFlags, [this, chooser](const juce::FileChooser& c)
    {
        auto file = c.getResult();
        if (file.existsAsFile())
        {
            if (audioProcessor.loadAudioFile(file) && waveformDisplay)
            {
                waveformDisplay->setAudioBuffer(&audioProcessor.getLoadedAudio(), audioProcessor.getSampleRate());
                waveformDisplay->setPlayheadPosition(0.0);
                waveformBoundToProcessorBuffer = true;
            }
        }
    });
}

void TimeStretchXEditor::togglePlayback()
{
    if (audioProcessor.isPlaying())
        audioProcessor.stop();
    else
        audioProcessor.play();
}
