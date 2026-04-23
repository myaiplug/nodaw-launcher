#pragma once

#include <juce_core/juce_core.h>
#include <juce_data_structures/juce_data_structures.h>
#include "ParameterLayout.h"

/**
 * PresetManager
 * Manages loading/saving presets for Time Stretch X
 */
class PresetManager
{
public:
    struct Preset
    {
        juce::String name;
        juce::String category;
        juce::ValueTree state;
    };

    PresetManager() = default;
    ~PresetManager() = default;

    // Factory presets for different use cases
    static std::vector<Preset> getFactoryPresets()
    {
        std::vector<Preset> presets;

        auto makeState = [](
            float timeStretch,
            float pitchShift,
            float formantShift,
            float mix,
            float outputGain,
            bool keyLock,
            bool linked,
            int algorithm,
            int quality,
            float grainSize,
            float grainDensity)
        {
            juce::ValueTree state("Parameters");
            state.setProperty(ParameterLayout::TIME_STRETCH_ID, timeStretch, nullptr);
            state.setProperty(ParameterLayout::PITCH_SHIFT_ID, pitchShift, nullptr);
            state.setProperty(ParameterLayout::FORMANT_SHIFT_ID, formantShift, nullptr);
            state.setProperty(ParameterLayout::MIX_ID, mix, nullptr);
            state.setProperty(ParameterLayout::OUTPUT_GAIN_ID, outputGain, nullptr);
            state.setProperty(ParameterLayout::KEY_LOCK_ID, keyLock, nullptr);
            state.setProperty(ParameterLayout::LINKED_ID, linked, nullptr);
            state.setProperty(ParameterLayout::ALGORITHM_ID, algorithm, nullptr);
            state.setProperty(ParameterLayout::QUALITY_ID, quality, nullptr);
            state.setProperty(ParameterLayout::GRAIN_SIZE_ID, grainSize, nullptr);
            state.setProperty(ParameterLayout::GRAIN_DENSITY_ID, grainDensity, nullptr);
            return state;
        };

        auto add = [&](const char* name,
                       const char* category,
                       float timeStretch,
                       float pitchShift,
                       float formantShift,
                       float mix,
                       float outputGain,
                       bool keyLock,
                       bool linked,
                       int algorithm,
                       int quality,
                       float grainSize,
                       float grainDensity)
        {
            presets.push_back({
                name,
                category,
                makeState(timeStretch, pitchShift, formantShift, mix, outputGain, keyLock, linked, algorithm, quality, grainSize, grainDensity)
            });
        };

        add("Default", "Utility", 1.00f, 0.0f, 0.0f, 100.0f, 0.0f, true, false, 0, 3, 100.0f, 20.0f);

        // Vocal FX
        add("Vocal Lift +3", "Vocal FX", 1.00f, 3.0f, 1.5f, 72.0f, -0.5f, true, false, 0, 4, 90.0f, 18.0f);
        add("Harmony Drift", "Vocal FX", 1.08f, 7.0f, 2.0f, 68.0f, -1.0f, true, false, 0, 4, 100.0f, 20.0f);
        add("Low Monster", "Vocal FX", 0.96f, -12.0f, -5.0f, 78.0f, -1.5f, true, false, 1, 3, 145.0f, 26.0f);
        add("Air Choir", "Vocal FX", 1.60f, 12.0f, 4.0f, 62.0f, -2.0f, true, false, 0, 5, 110.0f, 22.0f);
        add("Gender Blur", "Vocal FX", 1.03f, -4.0f, -3.5f, 70.0f, -0.8f, true, false, 0, 4, 90.0f, 18.0f);
        add("Formant Angel", "Vocal FX", 1.25f, 5.0f, 6.0f, 64.0f, -1.2f, true, false, 0, 5, 100.0f, 20.0f);
        add("Slur Bloom", "Vocal FX", 1.45f, 2.0f, 2.0f, 58.0f, -1.0f, true, false, 1, 4, 180.0f, 34.0f);
        add("Frozen Verse", "Vocal FX", 2.20f, 0.0f, 0.0f, 66.0f, -2.5f, true, false, 0, 5, 120.0f, 20.0f);

        // Drum Time Warp
        add("Break Slowdown", "Drum Time Warp", 0.50f, 0.0f, 0.0f, 100.0f, -1.0f, true, false, 2, 3, 90.0f, 20.0f);
        add("Snare Smear", "Drum Time Warp", 1.70f, 0.0f, 0.0f, 62.0f, -1.5f, true, false, 1, 3, 210.0f, 42.0f);
        add("Hat Freeze", "Drum Time Warp", 2.80f, 0.0f, 0.0f, 56.0f, -2.0f, true, false, 0, 5, 100.0f, 20.0f);
        add("Kick Sink", "Drum Time Warp", 0.72f, -3.0f, 0.0f, 75.0f, -0.6f, false, false, 2, 3, 90.0f, 20.0f);
        add("Perc Flutter", "Drum Time Warp", 1.35f, 4.0f, 0.0f, 54.0f, -1.3f, true, false, 1, 4, 80.0f, 48.0f);
        add("Transient Drag", "Drum Time Warp", 1.90f, 0.0f, 0.0f, 60.0f, -2.0f, true, false, 2, 4, 90.0f, 20.0f);
        add("Cymbal Bloom", "Drum Time Warp", 2.40f, 7.0f, 2.0f, 48.0f, -2.5f, true, false, 0, 4, 100.0f, 20.0f);
        add("Stomp Crunch", "Drum Time Warp", 0.84f, -7.0f, -1.0f, 82.0f, -0.5f, false, false, 2, 3, 100.0f, 20.0f);

        // Tape & Lo-Fi
        add("Cassette Drag", "Tape & Lo-Fi", 0.78f, -2.5f, -1.0f, 88.0f, -1.2f, false, false, 2, 3, 95.0f, 20.0f);
        add("Warped Deck", "Tape & Lo-Fi", 0.68f, -5.0f, -2.0f, 80.0f, -1.5f, false, false, 1, 3, 150.0f, 28.0f);
        add("Night Memory", "Tape & Lo-Fi", 1.40f, -4.0f, -2.5f, 64.0f, -1.8f, true, false, 0, 4, 100.0f, 20.0f);
        add("Bent Walkman", "Tape & Lo-Fi", 0.58f, -9.0f, -4.0f, 74.0f, -2.2f, false, false, 2, 2, 120.0f, 24.0f);
        add("Dusty Varispeed", "Tape & Lo-Fi", 1.18f, 2.0f, -1.0f, 66.0f, -1.0f, false, false, 2, 3, 100.0f, 20.0f);
        add("Ghost Cassette", "Tape & Lo-Fi", 2.05f, -7.0f, -4.5f, 52.0f, -2.8f, true, false, 0, 4, 100.0f, 20.0f);
        add("Melted Reel", "Tape & Lo-Fi", 2.60f, -12.0f, -3.0f, 58.0f, -3.0f, false, false, 1, 3, 220.0f, 36.0f);
        add("Sunk Radio", "Tape & Lo-Fi", 1.55f, -3.0f, -5.0f, 61.0f, -2.1f, true, false, 0, 5, 100.0f, 20.0f);

        // Cinematic Stretch
        add("Frozen Cathedral", "Cinematic Stretch", 3.50f, 0.0f, 0.0f, 78.0f, -4.0f, true, false, 0, 5, 100.0f, 20.0f);
        add("Submerged Piano", "Cinematic Stretch", 2.80f, -5.0f, -1.0f, 70.0f, -3.0f, true, false, 0, 5, 100.0f, 20.0f);
        add("Reverse Gravity", "Cinematic Stretch", 2.10f, 7.0f, 0.0f, 64.0f, -2.5f, true, false, 0, 5, 100.0f, 20.0f);
        add("Glass Horizon", "Cinematic Stretch", 1.85f, 12.0f, 3.0f, 58.0f, -2.2f, true, false, 0, 5, 100.0f, 20.0f);
        add("Titan Descent", "Cinematic Stretch", 2.50f, -12.0f, -2.0f, 72.0f, -3.4f, true, false, 0, 5, 100.0f, 20.0f);
        add("Distant Choir Hall", "Cinematic Stretch", 3.20f, 5.0f, 4.0f, 62.0f, -3.6f, true, false, 0, 5, 100.0f, 20.0f);
        add("Ice Bloom", "Cinematic Stretch", 2.35f, 0.0f, 2.5f, 60.0f, -2.8f, true, false, 1, 4, 250.0f, 30.0f);
        add("Void Shimmer", "Cinematic Stretch", 3.80f, 9.0f, 5.0f, 54.0f, -4.2f, true, false, 0, 5, 100.0f, 20.0f);

        // DJ Utility
        add("Tempo Match Clean", "DJ Utility", 1.08f, 0.0f, 0.0f, 100.0f, 0.0f, true, false, 2, 3, 100.0f, 20.0f);
        add("Pitch Nudge Up", "DJ Utility", 1.00f, 1.0f, 0.0f, 100.0f, 0.0f, true, false, 0, 4, 100.0f, 20.0f);
        add("Pitch Nudge Down", "DJ Utility", 1.00f, -1.0f, 0.0f, 100.0f, 0.0f, true, false, 0, 4, 100.0f, 20.0f);
        add("Acapella Fit", "DJ Utility", 1.12f, 0.0f, 0.0f, 100.0f, -0.2f, true, false, 2, 4, 100.0f, 20.0f);
        add("Drum Loop Tight", "DJ Utility", 0.94f, 0.0f, 0.0f, 100.0f, -0.3f, true, false, 2, 4, 100.0f, 20.0f);
        add("Linked Vinyl Brake", "DJ Utility", 0.50f, -12.0f, 0.0f, 100.0f, -1.0f, false, true, 2, 3, 100.0f, 20.0f);
        add("Linked Push Up", "DJ Utility", 1.50f, -7.0f, 0.0f, 100.0f, -0.8f, false, true, 2, 3, 100.0f, 20.0f);
        add("Club Blend Wide", "DJ Utility", 1.00f, 0.0f, 0.0f, 82.0f, 0.5f, true, false, 0, 4, 100.0f, 20.0f);

        // Experimental / Sound Design
        add("Granule Storm", "Experimental", 2.20f, 5.0f, 0.0f, 62.0f, -2.0f, true, false, 1, 4, 260.0f, 52.0f);
        add("Pixel Choir", "Experimental", 1.90f, 12.0f, 6.0f, 57.0f, -2.5f, true, false, 1, 4, 70.0f, 44.0f);
        add("Rubber Tunnel", "Experimental", 0.42f, -10.0f, -2.0f, 68.0f, -3.0f, false, false, 1, 3, 280.0f, 38.0f);
        add("Broken Orbit", "Experimental", 2.75f, -3.0f, 3.0f, 55.0f, -3.2f, true, false, 0, 5, 100.0f, 20.0f);
        add("Crystal Insects", "Experimental", 1.65f, 14.0f, 2.0f, 49.0f, -2.8f, true, false, 1, 4, 45.0f, 64.0f);
        add("Gravity Leak", "Experimental", 3.20f, -8.0f, -3.0f, 52.0f, -4.0f, false, false, 0, 5, 100.0f, 20.0f);
        add("Spectral Bloom", "Experimental", 2.40f, 3.0f, 5.0f, 59.0f, -2.0f, true, false, 0, 5, 100.0f, 20.0f);
        add("Time Fracture", "Experimental", 0.36f, 9.0f, 0.0f, 61.0f, -3.5f, false, false, 1, 3, 320.0f, 58.0f);
        
        return presets;
    }

    // Save/load user presets
    bool savePreset(const juce::File& presetFile, const juce::ValueTree& state, const juce::String& name)
    {
        juce::ValueTree preset("TimeStretchXPreset");
        preset.setProperty("name", name, nullptr);
        preset.appendChild(state.createCopy(), nullptr);
        
        auto xml = preset.createXml();
        return xml && xml->writeTo(presetFile);
    }

    bool loadPreset(const juce::File& presetFile, juce::ValueTree& outState)
    {
        if (!presetFile.existsAsFile())
            return false;
            
        std::unique_ptr<juce::XmlElement> xml(juce::XmlDocument::parse(presetFile));
        if (!xml)
            return false;
            
        juce::ValueTree preset = juce::ValueTree::fromXml(*xml);
        if (preset.isValid() && preset.hasType("TimeStretchXPreset"))
        {
            outState = preset.getChildWithName("APVTS");
            return outState.isValid();
        }
        
        return false;
    }

    // Get preset directory
    static juce::File getPresetsDirectory()
    {
        #if JUCE_WINDOWS
            auto appData = juce::File::getSpecialLocation(juce::File::commonApplicationDataDirectory);
            return appData.getChildFile("NoDAW").getChildFile("TimeStretchX").getChildFile("Presets");
        #elif JUCE_MAC
            auto appSupport = juce::File::getSpecialLocation(juce::File::userApplicationDataDirectory);
            return appSupport.getChildFile("NoDAW/TimeStretchX/Presets");
        #else
            auto home = juce::File::getSpecialLocation(juce::File::userHomeDirectory);
            return home.getChildFile(".config").getChildFile("NoDAW/TimeStretchX/Presets");
        #endif
    }

private:
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(PresetManager)
};
