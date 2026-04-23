#include "PluginEditor.h"

// ---------------------------------------------------------------------------
// Free helper: clip transfer function mirroring PluginProcessor::applyClip
// Used for drawing the transfer curve in the editor.
// ---------------------------------------------------------------------------
namespace
{
    inline float displayClip(float x, float ceiling, float kneePercent, int mode) noexcept
    {
        if (x < 0.0f) return -displayClip(-x, ceiling, kneePercent, mode);
        if (ceiling < 1e-7f) return 0.0f;
        switch (mode)
        {
            case 1: return juce::jlimit(0.0f, ceiling, x);
            case 0:
            {
                const float k = 1.0f + (kneePercent / 100.0f) * 4.0f;
                return (std::tanh((x / ceiling) * k) / std::tanh(k)) * ceiling;
            }
            case 2:
            {
                const float ks = ceiling * (1.0f - (kneePercent / 100.0f) * 0.6f);
                if (x <= ks)       return x;
                if (x >= ceiling)  return ceiling;
                const float t = (x - ks) / (ceiling - ks + 1e-9f);
                const float s = t * t * (3.0f - 2.0f * t);
                return ks + s * (ceiling - ks);
            }
            default: return x;
        }
    }
} // namespace

// ---------------------------------------------------------------------------
// Constructor / Destructor
// ---------------------------------------------------------------------------
ClipITAudioProcessorEditor::ClipITAudioProcessorEditor(ClipITAudioProcessor& p)
    : AudioProcessorEditor(&p), audioProcessor(p)
{
    setSize(900, 520);

    // Knobs
    configureKnob(inputGainKnob,  inputGainLabel,  "Input Gain");
    configureKnob(ceilingKnob,    ceilingLabel,    "Ceiling");
    configureKnob(kneeKnob,       kneeLabel,       "Knee");
    configureKnob(outputGainKnob, outputGainLabel, "Output Gain");

    // APVTS attachments
    inputGainAttach  = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.apvts, ClipITParams::inputGain,  inputGainKnob);
    ceilingAttach    = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.apvts, ClipITParams::ceiling,    ceilingKnob);
    kneeAttach       = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.apvts, ClipITParams::knee,       kneeKnob);
    outputGainAttach = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.apvts, ClipITParams::outputGain, outputGainKnob);

    // Clip mode buttons — AudioParameterChoice(3): normalised 0 / 0.5 / 1.0
    for (auto* b : { &softBtn, &hardBtn, &hybridBtn }) setupButton(*b);
    softBtn.onClick   = [this] { audioProcessor.apvts.getParameter(ClipITParams::clipMode)->setValueNotifyingHost(0.0f); };
    hardBtn.onClick   = [this] { audioProcessor.apvts.getParameter(ClipITParams::clipMode)->setValueNotifyingHost(0.5f); };
    hybridBtn.onClick = [this] { audioProcessor.apvts.getParameter(ClipITParams::clipMode)->setValueNotifyingHost(1.0f); };

    // Oversampling buttons — AudioParameterChoice(4): normalised 0 / 1/3 / 2/3 / 1.0
    for (auto* b : { &os1xBtn, &os2xBtn, &os4xBtn, &os8xBtn }) setupButton(*b);
    os1xBtn.onClick = [this] { audioProcessor.apvts.getParameter(ClipITParams::oversampling)->setValueNotifyingHost(0.0f);       };
    os2xBtn.onClick = [this] { audioProcessor.apvts.getParameter(ClipITParams::oversampling)->setValueNotifyingHost(1.0f / 3.0f); };
    os4xBtn.onClick = [this] { audioProcessor.apvts.getParameter(ClipITParams::oversampling)->setValueNotifyingHost(2.0f / 3.0f); };
    os8xBtn.onClick = [this] { audioProcessor.apvts.getParameter(ClipITParams::oversampling)->setValueNotifyingHost(1.0f);        };

    // Utility toggles
    setupButton(hardSafetyBtn);
    setupButton(deltaSoloBtn);
    hardSafetyBtn.onClick = [this] {
        auto* param = audioProcessor.apvts.getParameter(ClipITParams::hardClip);
        param->setValueNotifyingHost(param->getValue() < 0.5f ? 1.0f : 0.0f);
    };
    deltaSoloBtn.onClick = [this] {
        auto* param = audioProcessor.apvts.getParameter(ClipITParams::deltaSolo);
        param->setValueNotifyingHost(param->getValue() < 0.5f ? 1.0f : 0.0f);
    };

    startTimerHz(60);
}

ClipITAudioProcessorEditor::~ClipITAudioProcessorEditor()
{
    stopTimer();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
void ClipITAudioProcessorEditor::configureKnob(juce::Slider& slider, juce::Label& label,
                                                const juce::String& name)
{
    slider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    slider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 72, 18);
    slider.setColour(juce::Slider::rotarySliderFillColourId,    juce::Colour(0xFFEF4444));
    slider.setColour(juce::Slider::rotarySliderOutlineColourId, juce::Colour(0xFF2D2D3D));
    slider.setColour(juce::Slider::textBoxTextColourId,         juce::Colour(0x99EBEBFF));
    slider.setColour(juce::Slider::textBoxOutlineColourId,      juce::Colour(0x00000000));
    slider.setColour(juce::Slider::textBoxBackgroundColourId,   juce::Colour(0x00000000));
    addAndMakeVisible(slider);

    label.setText(name, juce::dontSendNotification);
    label.setJustificationType(juce::Justification::centred);
    label.setFont(juce::Font(juce::FontOptions{}.withHeight(11.0f)));
    label.setColour(juce::Label::textColourId, juce::Colour(0x55EBEBFF));
    addAndMakeVisible(label);
}

void ClipITAudioProcessorEditor::setupButton(juce::TextButton& btn)
{
    btn.setColour(juce::TextButton::buttonColourId,   juce::Colour(0xFF1E1E2C));
    btn.setColour(juce::TextButton::buttonOnColourId, juce::Colour(0xFFEF4444));
    btn.setColour(juce::TextButton::textColourOffId,  juce::Colour(0x99EBEBFF));
    btn.setColour(juce::TextButton::textColourOnId,   juce::Colour(0xFFFFFFFF));
    addAndMakeVisible(btn);
}

void ClipITAudioProcessorEditor::updateButtonStates()
{
    const int  clipMode = static_cast<int>(audioProcessor.apvts.getRawParameterValue(ClipITParams::clipMode)->load());
    const int  osMode   = static_cast<int>(audioProcessor.apvts.getRawParameterValue(ClipITParams::oversampling)->load());
    const bool hcOn     = audioProcessor.apvts.getRawParameterValue(ClipITParams::hardClip)->load()  > 0.5f;
    const bool dsOn     = audioProcessor.apvts.getRawParameterValue(ClipITParams::deltaSolo)->load() > 0.5f;

    const juce::Colour active     { 0xFFEF4444 };
    const juce::Colour inactive   { 0xFF1E1E2C };
    const juce::Colour activeText { 0xFFFFFFFF };
    const juce::Colour mutedText  { 0x99EBEBFF };

    auto setMode = [&](juce::TextButton& b, bool on) {
        b.setColour(juce::TextButton::buttonColourId,  on ? active    : inactive);
        b.setColour(juce::TextButton::textColourOffId, on ? activeText : mutedText);
    };

    setMode(softBtn,   clipMode == 0);
    setMode(hardBtn,   clipMode == 1);
    setMode(hybridBtn, clipMode == 2);

    setMode(os1xBtn, osMode == 0);
    setMode(os2xBtn, osMode == 1);
    setMode(os4xBtn, osMode == 2);
    setMode(os8xBtn, osMode == 3);

    const juce::Colour hcCol = hcOn ? juce::Colour(0xFFF59E0B) : inactive;
    const juce::Colour dsCol = dsOn ? juce::Colour(0xFF8B5CF6) : inactive;
    hardSafetyBtn.setColour(juce::TextButton::buttonColourId,  hcCol);
    hardSafetyBtn.setColour(juce::TextButton::textColourOffId, hcOn ? activeText : mutedText);
    deltaSoloBtn .setColour(juce::TextButton::buttonColourId,  dsCol);
    deltaSoloBtn .setColour(juce::TextButton::textColourOffId, dsOn ? activeText : mutedText);
}

// ---------------------------------------------------------------------------
// Timer
// ---------------------------------------------------------------------------
void ClipITAudioProcessorEditor::timerCallback()
{
    auto smooth = [](float& stored, float incoming) noexcept {
        stored = incoming > stored ? incoming : (stored * 0.88f + incoming * 0.12f);
    };
    smooth(uiInL,  audioProcessor.inputLevelL.load());
    smooth(uiInR,  audioProcessor.inputLevelR.load());
    smooth(uiOutL, audioProcessor.outputLevelL.load());
    smooth(uiOutR, audioProcessor.outputLevelR.load());
    smooth(uiGR,   audioProcessor.gainReduction.load());

    updateButtonStates();
    repaint();
}

// ---------------------------------------------------------------------------
// Paint
// ---------------------------------------------------------------------------
void ClipITAudioProcessorEditor::paint(juce::Graphics& g)
{
    g.fillAll(colours.bg);

    // Header bar
    g.setColour(juce::Colour(0xFF19191F));
    g.fillRect(0, 0, getWidth(), 72);
    g.setColour(colours.border);
    g.drawLine(0.0f, 72.0f, static_cast<float>(getWidth()), 72.0f, 1.0f);

    // Title
    g.setColour(colours.textPrimary);
    g.setFont(juce::Font(juce::FontOptions{}.withHeight(26.0f)));
    g.drawText("Clip-IT", 24, 16, 200, 36, juce::Justification::centredLeft);

    // Red tag
    g.setColour(colours.accent.withAlpha(0.85f));
    g.setFont(juce::Font(juce::FontOptions{}.withHeight(10.0f)));
    g.drawText("CLIPPING CONSOLE", 24, 52, 200, 14, juce::Justification::centredLeft);

    // Version
    g.setColour(colours.textMuted);
    g.setFont(juce::Font(juce::FontOptions{}.withHeight(11.0f)));
    g.drawText("v1.0  |  NoDAW Studio", getWidth() - 190, 28, 170, 16, juce::Justification::centredRight);

    // Vertical divider between left and right columns
    g.setColour(colours.border.withAlpha(0.6f));
    g.drawLine(470.0f, 80.0f, 470.0f, static_cast<float>(getHeight() - 14), 1.0f);

    // Right column section labels
    g.setFont(juce::Font(juce::FontOptions{}.withHeight(10.0f)));
    g.setColour(colours.textMuted);
    g.drawText("PARAMETERS",   482, 80,  200, 12, juce::Justification::centredLeft);
    g.drawText("CLIP MODE",    482, 232, 200, 12, juce::Justification::centredLeft);
    g.drawText("OVERSAMPLING", 482, 292, 200, 12, juce::Justification::centredLeft);
    g.drawText("UTILITIES",    482, 352, 200, 12, juce::Justification::centredLeft);

    // Section separator lines
    g.setColour(colours.border.withAlpha(0.4f));
    g.drawLine(482.0f, 246.0f, 884.0f, 246.0f, 0.5f);
    g.drawLine(482.0f, 306.0f, 884.0f, 306.0f, 0.5f);
    g.drawLine(482.0f, 366.0f, 884.0f, 366.0f, 0.5f);

    // Panels
    paintTransferCurve(g, juce::Rectangle<float>(16.0f, 80.0f, 444.0f, 268.0f));
    paintMeters       (g, juce::Rectangle<float>(16.0f, 358.0f, 444.0f, 130.0f));
}

// ---------------------------------------------------------------------------
// Transfer curve panel
// ---------------------------------------------------------------------------
void ClipITAudioProcessorEditor::paintTransferCurve(juce::Graphics& g, juce::Rectangle<float> area)
{
    g.setColour(colours.surface);
    g.fillRoundedRectangle(area, 8.0f);
    g.setColour(colours.border);
    g.drawRoundedRectangle(area, 8.0f, 1.0f);

    const float padL = 44.0f, padR = 16.0f, padT = 28.0f, padB = 28.0f;
    const float plotX = area.getX() + padL;
    const float plotY = area.getY() + padT;
    const float plotW = area.getWidth()  - padL - padR;
    const float plotH = area.getHeight() - padT - padB;

    // Amplitude display range: 0..1.5 (+3.5 dBFS headroom)
    const float ampMax = 1.5f;
    auto aToX = [&](float a) noexcept { return plotX + (a / ampMax) * plotW; };
    auto aToY = [&](float a) noexcept { return plotY + plotH - (juce::jmin(a, ampMax) / ampMax) * plotH; };

    g.saveState();
    g.reduceClipRegion(juce::Rectangle<int>(static_cast<int>(plotX), static_cast<int>(plotY),
                                            static_cast<int>(plotW) + 1, static_cast<int>(plotH) + 1));

    // Grid
    const float gridAmps[] = { 0.126f, 0.251f, 0.501f, 1.0f };
    for (float amp : gridAmps)
    {
        if (amp > ampMax) continue;
        g.setColour(colours.border.withAlpha(0.45f));
        g.drawHorizontalLine(static_cast<int>(aToY(amp)), plotX, plotX + plotW);
        g.drawVerticalLine  (static_cast<int>(aToX(amp)), plotY, plotY + plotH);
    }

    // Identity line (1:1 reference)
    {
        juce::Path id;
        id.startNewSubPath(plotX, aToY(0.0f));
        id.lineTo(aToX(ampMax), aToY(ampMax));
        g.setColour(colours.border.withAlpha(0.75f));
        g.strokePath(id, juce::PathStrokeType(1.0f));
    }

    // Read current params
    const float ceilingDb   = audioProcessor.apvts.getRawParameterValue(ClipITParams::ceiling)->load();
    const float kneePercent = audioProcessor.apvts.getRawParameterValue(ClipITParams::knee)->load();
    const int   clipModeIdx = static_cast<int>(audioProcessor.apvts.getRawParameterValue(ClipITParams::clipMode)->load());
    const float ceiling     = juce::Decibels::decibelsToGain(ceilingDb);

    // Ceiling marker lines (amber)
    if (ceiling <= ampMax)
    {
        g.setColour(colours.accentAmber.withAlpha(0.35f));
        g.drawHorizontalLine(static_cast<int>(aToY(ceiling)), plotX, plotX + plotW);
        g.drawVerticalLine  (static_cast<int>(aToX(ceiling)), plotY, plotY + plotH);
    }

    // Build transfer curve path
    juce::Path curve;
    bool first = true;
    for (int i = 0; i <= 300; i++)
    {
        const float amp = (static_cast<float>(i) / 300.0f) * ampMax;
        const float out = displayClip(amp, ceiling, kneePercent, clipModeIdx);
        const float px  = aToX(amp);
        const float py  = aToY(out);
        if (first) { curve.startNewSubPath(px, py); first = false; }
        else        curve.lineTo(px, py);
    }

    // Glow fill under curve
    juce::Path fill(curve);
    fill.lineTo(aToX(ampMax), plotY + plotH);
    fill.lineTo(plotX, plotY + plotH);
    fill.closeSubPath();
    g.setColour(colours.accent.withAlpha(0.07f));
    g.fillPath(fill);

    // Curve stroke
    g.setColour(colours.accent);
    g.strokePath(curve, juce::PathStrokeType(2.0f, juce::PathStrokeType::curved,
                                              juce::PathStrokeType::rounded));

    // Real-time input level dot on the curve
    const float inLevel = std::max(audioProcessor.inputLevelL.load(),
                                   audioProcessor.inputLevelR.load());
    if (inLevel > 0.001f && inLevel <= ampMax)
    {
        const float outAtIn = displayClip(inLevel, ceiling, kneePercent, clipModeIdx);
        const float dotX    = aToX(inLevel);
        const float dotY    = aToY(outAtIn);
        g.setColour(colours.accentGreen.withAlpha(0.35f));
        g.drawVerticalLine(static_cast<int>(dotX), plotY, plotY + plotH);
        g.setColour(colours.accentGreen);
        g.fillEllipse(dotX - 4.0f, dotY - 4.0f, 8.0f, 8.0f);
    }

    g.restoreState();

    // Axis labels
    g.setFont(juce::Font(juce::FontOptions{}.withHeight(10.0f)));
    struct AxisLabel { float amp; const char* text; };
    const AxisLabel axLabels[] = { { 1.0f, "0" }, { 0.501f, "-6" }, { 0.251f, "-12" } };
    for (auto& l : axLabels)
    {
        if (l.amp > ampMax) continue;
        g.setColour(colours.textMuted);
        g.drawText(l.text,
                   static_cast<int>(area.getX() + 2),
                   static_cast<int>(aToY(l.amp) - 7), 38, 14,
                   juce::Justification::centredRight);
        g.drawText(l.text,
                   static_cast<int>(aToX(l.amp) - 10),
                   static_cast<int>(plotY + plotH + 3), 20, 14,
                   juce::Justification::centred);
    }

    // Panel title
    g.setColour(colours.textMuted);
    g.setFont(juce::Font(juce::FontOptions{}.withHeight(10.0f)));
    g.drawText("TRANSFER CURVE", static_cast<int>(area.getX() + padL), static_cast<int>(area.getY() + 6), 140, 14,
               juce::Justification::centredLeft);

    // Ceiling annotation
    if (ceiling <= ampMax)
    {
        g.setColour(colours.accentAmber.withAlpha(0.7f));
        g.setFont(juce::Font(juce::FontOptions{}.withHeight(9.0f)));
        g.drawText(juce::String(ceilingDb, 1) + " dB",
                   static_cast<int>(aToX(ceiling)) + 3,
                   static_cast<int>(plotY + 3), 44, 12,
                   juce::Justification::centredLeft);
    }
}

// ---------------------------------------------------------------------------
// Single vertical level/GR bar
// ---------------------------------------------------------------------------
void ClipITAudioProcessorEditor::paintLevelBar(juce::Graphics& g,
                                                float x, float y, float w, float h,
                                                float level, bool isGR)
{
    g.setColour(colours.bg);
    g.fillRoundedRectangle(x, y, w, h, 2.0f);

    if (level <= 0.001f) return;

    const float clamped = juce::jmin(level, 1.0f);
    const float fillH   = h * clamped;

    if (isGR)
    {
        // GR fills from top downward, red
        g.setColour(colours.meterRed);
        g.fillRoundedRectangle(x, y, w, fillH, 2.0f);
    }
    else
    {
        // Level fills from bottom, traffic-light colours
        const float fillY       = y + h - fillH;
        const float greenThres  = y + h * 0.5f;   // -6 dBFS boundary
        const float yellowThres = y + h * 0.3f;   // -3 dBFS boundary
        const float bottomY     = y + h;

        // Green
        const float gTop = std::max(fillY, greenThres);
        if (gTop < bottomY)
        {
            g.setColour(colours.meterGreen);
            g.fillRoundedRectangle(x, gTop, w, bottomY - gTop, 2.0f);
        }
        // Yellow
        if (fillY < greenThres)
        {
            const float yTop = std::max(fillY, yellowThres);
            if (yTop < greenThres)
            {
                g.setColour(colours.meterYellow);
                g.fillRoundedRectangle(x, yTop, w, greenThres - yTop, 2.0f);
            }
        }
        // Red
        if (fillY < yellowThres)
        {
            g.setColour(colours.meterRed);
            g.fillRoundedRectangle(x, fillY, w, yellowThres - fillY, 2.0f);
        }
    }

    // 0 dBFS tick line
    g.setColour(colours.accent.withAlpha(0.4f));
    g.drawHorizontalLine(isGR ? static_cast<int>(y + h) : static_cast<int>(y), x, x + w);
}

// ---------------------------------------------------------------------------
// Meters panel
// ---------------------------------------------------------------------------
void ClipITAudioProcessorEditor::paintMeters(juce::Graphics& g, juce::Rectangle<float> area)
{
    g.setColour(colours.surface);
    g.fillRoundedRectangle(area, 8.0f);
    g.setColour(colours.border);
    g.drawRoundedRectangle(area, 8.0f, 1.0f);

    const float padX   = 12.0f, padY = 10.0f;
    const float innerX = area.getX() + padX;
    const float innerW = area.getWidth() - padX * 2.0f;
    const float barTop = area.getY() + padY + 18.0f;
    const float barH   = area.getHeight() - padY * 2.0f - 36.0f;

    const float inW  = innerW * 0.36f;
    const float grW  = innerW * 0.22f;
    const float outW = innerW * 0.36f;
    const float gap  = (innerW - inW - grW - outW) / 2.0f;
    const float grX  = innerX + inW + gap;
    const float outX = grX + grW + gap;

    auto drawGroup = [&](float gx, float gw, const char* title,
                         float levelL, float levelR, bool mono, bool isGR)
    {
        g.setColour(colours.surfaceHi);
        g.fillRoundedRectangle(gx, area.getY() + padY, gw,
                               area.getHeight() - padY * 2.0f, 5.0f);

        g.setColour(colours.textMuted);
        g.setFont(juce::Font(juce::FontOptions{}.withHeight(9.0f)));
        g.drawText(title, static_cast<int>(gx),
                   static_cast<int>(area.getY() + padY + 2),
                   static_cast<int>(gw), 14, juce::Justification::centred);

        const float bw     = mono ? 10.0f : 7.0f;
        const float bGap   = 3.0f;
        const float totalW = mono ? bw : bw * 2.0f + bGap;
        const float bx     = gx + (gw - totalW) * 0.5f;

        paintLevelBar(g, bx, barTop, bw, barH, levelL, isGR);
        if (!mono)
            paintLevelBar(g, bx + bw + bGap, barTop, bw, barH, levelR, false);

        const float peak = mono ? levelL : std::max(levelL, levelR);
        const float db   = peak > 0.001f ? juce::Decibels::gainToDecibels(peak) : -60.0f;
        g.setColour(colours.textMuted);
        g.setFont(juce::Font(juce::FontOptions{}.withHeight(9.0f)));
        g.drawText(juce::String(db, 1),
                   static_cast<int>(gx), static_cast<int>(barTop + barH + 4),
                   static_cast<int>(gw), 12, juce::Justification::centred);
    };

    drawGroup(innerX, inW,  "INPUT",  uiInL,  uiInR,  false, false);
    drawGroup(grX,    grW,  "GR",     uiGR,   0.0f,   true,  true);
    drawGroup(outX,   outW, "OUTPUT", uiOutL, uiOutR, false, false);
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
void ClipITAudioProcessorEditor::resized()
{
    const int rX = 482, rW = 402;

    // Knobs — 4 equal slots of ~100 px
    const int slotW = rW / 4;
    const int knobY = 94, knobH = 108;
    const int lblY  = knobY + knobH, lblH = 16;

    inputGainKnob .setBounds(rX + 0 * slotW + 8, knobY, slotW - 16, knobH);
    ceilingKnob   .setBounds(rX + 1 * slotW + 8, knobY, slotW - 16, knobH);
    kneeKnob      .setBounds(rX + 2 * slotW + 8, knobY, slotW - 16, knobH);
    outputGainKnob.setBounds(rX + 3 * slotW + 8, knobY, slotW - 16, knobH);

    inputGainLabel .setBounds(rX + 0 * slotW, lblY, slotW, lblH);
    ceilingLabel   .setBounds(rX + 1 * slotW, lblY, slotW, lblH);
    kneeLabel      .setBounds(rX + 2 * slotW, lblY, slotW, lblH);
    outputGainLabel.setBounds(rX + 3 * slotW, lblY, slotW, lblH);

    // Clip mode buttons — 3 equal
    const int mW = rW / 3, mY = 250, mH = 34;
    softBtn  .setBounds(rX + 0 * mW + 2, mY, mW - 4, mH);
    hardBtn  .setBounds(rX + 1 * mW + 2, mY, mW - 4, mH);
    hybridBtn.setBounds(rX + 2 * mW + 2, mY, mW - 4, mH);

    // Oversampling buttons — 4 equal
    const int osW = rW / 4, osY = 310, osH = 34;
    os1xBtn.setBounds(rX + 0 * osW + 2, osY, osW - 4, osH);
    os2xBtn.setBounds(rX + 1 * osW + 2, osY, osW - 4, osH);
    os4xBtn.setBounds(rX + 2 * osW + 2, osY, osW - 4, osH);
    os8xBtn.setBounds(rX + 3 * osW + 2, osY, osW - 4, osH);

    // Utility toggles — 2 equal halves
    const int uY = 370, uH = 34;
    hardSafetyBtn.setBounds(rX + 2,          uY, rW / 2 - 4, uH);
    deltaSoloBtn .setBounds(rX + rW / 2 + 2, uY, rW / 2 - 4, uH);
}
