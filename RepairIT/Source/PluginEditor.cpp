#include "PluginEditor.h"

RepairITAudioProcessorEditor::RepairITAudioProcessorEditor(RepairITAudioProcessor& p)
    : AudioProcessorEditor(&p), audioProcessor(p)
{
    setSize(760, 420);

    configureSlider(denoiseSlider, denoiseLabel, "Denoise");
    configureSlider(declickSlider, declickLabel, "DeClick");
    configureSlider(dehumSlider, dehumLabel, "DeHum");
    configureSlider(mixSlider, mixLabel, "Mix");

    denoiseAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.apvts, RepairITParams::denoise, denoiseSlider);
    declickAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.apvts, RepairITParams::declick, declickSlider);
    dehumAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.apvts, RepairITParams::dehum, dehumSlider);
    mixAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.apvts, RepairITParams::mix, mixSlider);

    for (auto* button : { &monitorDryButton, &monitorWetButton, &podcastPresetButton, &vinylPresetButton, &fieldPresetButton, &vocalPresetButton })
    {
        addAndMakeVisible(*button);
        button->setColour(juce::TextButton::buttonColourId, juce::Colour::fromRGB(33, 39, 50));
        button->setColour(juce::TextButton::textColourOffId, juce::Colour::fromRGB(210, 220, 235));
    }

    monitorDryButton.onClick = [this]
    {
        storedMixBeforeDryMonitor = getParameterPercent(RepairITParams::mix);
        setParameterPercent(RepairITParams::mix, 0.0f);
    };

    monitorWetButton.onClick = [this]
    {
        setParameterPercent(RepairITParams::mix, storedMixBeforeDryMonitor);
    };

    podcastPresetButton.onClick = [this]
    {
        setParameterPercent(RepairITParams::denoise, 52.0f);
        setParameterPercent(RepairITParams::declick, 14.0f);
        setParameterPercent(RepairITParams::dehum, 28.0f);
        setParameterPercent(RepairITParams::mix, 86.0f);
    };

    vinylPresetButton.onClick = [this]
    {
        setParameterPercent(RepairITParams::denoise, 44.0f);
        setParameterPercent(RepairITParams::declick, 68.0f);
        setParameterPercent(RepairITParams::dehum, 40.0f);
        setParameterPercent(RepairITParams::mix, 92.0f);
    };

    fieldPresetButton.onClick = [this]
    {
        setParameterPercent(RepairITParams::denoise, 72.0f);
        setParameterPercent(RepairITParams::declick, 24.0f);
        setParameterPercent(RepairITParams::dehum, 36.0f);
        setParameterPercent(RepairITParams::mix, 84.0f);
    };

    vocalPresetButton.onClick = [this]
    {
        setParameterPercent(RepairITParams::denoise, 58.0f);
        setParameterPercent(RepairITParams::declick, 20.0f);
        setParameterPercent(RepairITParams::dehum, 24.0f);
        setParameterPercent(RepairITParams::mix, 90.0f);
    };
}

RepairITAudioProcessorEditor::~RepairITAudioProcessorEditor() = default;

void RepairITAudioProcessorEditor::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colour::fromRGB(12, 14, 18));

    g.setColour(juce::Colour::fromRGB(230, 236, 248));
    g.setFont(juce::Font(juce::FontOptions{}.withHeight(28.0f).withName("Inter")));
    g.drawText("Repair-IT", 24, 20, getWidth() - 48, 40, juce::Justification::centredLeft);

    g.setColour(juce::Colour::fromRGB(127, 140, 166));
    g.setFont(juce::Font(juce::FontOptions{}.withHeight(14.0f).withName("JetBrains Mono")));
    g.drawText("v0.3 Restoration Console - A/B monitor + voiced presets", 24, 64, getWidth() - 48, 24, juce::Justification::centredLeft);

    g.setColour(juce::Colour::fromRGBA(90, 100, 120, 120));
    g.drawRoundedRectangle(getLocalBounds().toFloat().reduced(20.0f, 108.0f), 12.0f, 1.0f);

    g.setColour(juce::Colour::fromRGB(107, 121, 150));
    g.setFont(juce::Font(juce::FontOptions{}.withHeight(12.0f).withName("JetBrains Mono")));
    g.drawText("Use A/B monitor to compare source vs restored signal. Presets are tuned starting points.",
               26, getHeight() - 32, getWidth() - 52, 20, juce::Justification::centredLeft);
}

void RepairITAudioProcessorEditor::resized()
{
    auto bounds = getLocalBounds();
    auto controlArea = bounds.reduced(28, 118);

    auto topRow = controlArea.removeFromTop(180);
    auto sliderWidth = topRow.getWidth() / 4;

    denoiseLabel.setBounds(topRow.removeFromLeft(sliderWidth).removeFromTop(22));
    declickLabel.setBounds(topRow.removeFromLeft(sliderWidth).removeFromTop(22));
    dehumLabel.setBounds(topRow.removeFromLeft(sliderWidth).removeFromTop(22));
    mixLabel.setBounds(topRow.removeFromLeft(sliderWidth).removeFromTop(22));

    auto topRowSliders = bounds.reduced(28, 118).removeFromTop(180).withTrimmedTop(24);
    denoiseSlider.setBounds(topRowSliders.removeFromLeft(sliderWidth).reduced(10, 8));
    declickSlider.setBounds(topRowSliders.removeFromLeft(sliderWidth).reduced(10, 8));
    dehumSlider.setBounds(topRowSliders.removeFromLeft(sliderWidth).reduced(10, 8));
    mixSlider.setBounds(topRowSliders.removeFromLeft(sliderWidth).reduced(10, 8));

    auto lowerArea = bounds.reduced(28, 118).withTrimmedTop(196);
    auto monitorRow = lowerArea.removeFromTop(42);
    monitorDryButton.setBounds(monitorRow.removeFromLeft(220).reduced(4));
    monitorWetButton.setBounds(monitorRow.removeFromLeft(220).reduced(4));

    lowerArea.removeFromTop(14);
    auto presetRow = lowerArea.removeFromTop(42);
    auto presetWidth = presetRow.getWidth() / 4;
    podcastPresetButton.setBounds(presetRow.removeFromLeft(presetWidth).reduced(4));
    vinylPresetButton.setBounds(presetRow.removeFromLeft(presetWidth).reduced(4));
    fieldPresetButton.setBounds(presetRow.removeFromLeft(presetWidth).reduced(4));
    vocalPresetButton.setBounds(presetRow.removeFromLeft(presetWidth).reduced(4));
}

void RepairITAudioProcessorEditor::configureSlider(juce::Slider& slider, juce::Label& label, const juce::String& labelText)
{
    slider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    slider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 72, 20);
    slider.setColour(juce::Slider::rotarySliderFillColourId, juce::Colour::fromRGB(61, 164, 255));
    slider.setColour(juce::Slider::rotarySliderOutlineColourId, juce::Colour::fromRGB(45, 54, 68));
    slider.setColour(juce::Slider::textBoxTextColourId, juce::Colour::fromRGB(217, 225, 238));
    slider.setColour(juce::Slider::textBoxOutlineColourId, juce::Colour::fromRGBA(0, 0, 0, 0));
    addAndMakeVisible(slider);

    label.setText(labelText, juce::dontSendNotification);
    label.setJustificationType(juce::Justification::centred);
    label.setColour(juce::Label::textColourId, juce::Colour::fromRGB(188, 200, 222));
    addAndMakeVisible(label);
}

void RepairITAudioProcessorEditor::setParameterPercent(const juce::String& paramId, float valuePercent)
{
    if (auto* param = audioProcessor.apvts.getParameter(paramId))
        param->setValueNotifyingHost(param->convertTo0to1(valuePercent));
}

float RepairITAudioProcessorEditor::getParameterPercent(const juce::String& paramId) const
{
    if (auto* raw = audioProcessor.apvts.getRawParameterValue(paramId))
        if (auto* param = audioProcessor.apvts.getParameter(paramId))
            return param->convertFrom0to1(raw->load());

    return 100.0f;
}
