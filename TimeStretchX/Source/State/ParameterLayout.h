/*
  ==============================================================================

    ParameterLayout.h
    Time Stretch X Parameter Definitions
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>

namespace ParameterLayout
{
    // Parameter IDs
    inline const juce::String TIME_STRETCH_ID = "timeStretch";
    inline const juce::String PITCH_SHIFT_ID = "pitchShift";
    inline const juce::String FORMANT_SHIFT_ID = "formantShift";
    inline const juce::String MIX_ID = "mix";
    inline const juce::String OUTPUT_GAIN_ID = "outputGain";
    inline const juce::String KEY_LOCK_ID = "keyLock";
    inline const juce::String LINKED_ID = "linked";
    inline const juce::String ALGORITHM_ID = "algorithm";
    inline const juce::String QUALITY_ID = "quality";
    inline const juce::String GRAIN_SIZE_ID = "grainSize";
    inline const juce::String GRAIN_DENSITY_ID = "grainDensity";
    
    // Parameter ranges
    inline const float TIME_STRETCH_MIN = 0.25f;
    inline const float TIME_STRETCH_MAX = 4.0f;
    inline const float TIME_STRETCH_DEFAULT = 1.0f;
    
    inline const float PITCH_SHIFT_MIN = -24.0f;
    inline const float PITCH_SHIFT_MAX = 24.0f;
    inline const float PITCH_SHIFT_DEFAULT = 0.0f;
    
    inline const float FORMANT_SHIFT_MIN = -12.0f;
    inline const float FORMANT_SHIFT_MAX = 12.0f;
    inline const float FORMANT_SHIFT_DEFAULT = 0.0f;
    
    inline const float MIX_MIN = 0.0f;
    inline const float MIX_MAX = 100.0f;
    inline const float MIX_DEFAULT = 100.0f;
    
    inline const float OUTPUT_GAIN_MIN = -12.0f;
    inline const float OUTPUT_GAIN_MAX = 12.0f;
    inline const float OUTPUT_GAIN_DEFAULT = 0.0f;
    
    inline const int QUALITY_MIN = 1;
    inline const int QUALITY_MAX = 5;
    inline const int QUALITY_DEFAULT = 3;
    
    inline const float GRAIN_SIZE_MIN = 10.0f;
    inline const float GRAIN_SIZE_MAX = 500.0f;
    inline const float GRAIN_SIZE_DEFAULT = 100.0f;
    
    inline const float GRAIN_DENSITY_MIN = 1.0f;
    inline const float GRAIN_DENSITY_MAX = 100.0f;
    inline const float GRAIN_DENSITY_DEFAULT = 20.0f;
    
    /**
     * Creates the parameter layout for the APVTS
     */
    inline juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout()
    {
        std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;
        
        // Time Stretch (ratio: 0.25x to 4.0x)
        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { TIME_STRETCH_ID, 1 },
            "Time Stretch",
            juce::NormalisableRange<float>(TIME_STRETCH_MIN, TIME_STRETCH_MAX, 0.01f, 0.5f),
            TIME_STRETCH_DEFAULT,
            juce::AudioParameterFloatAttributes{}
                .withLabel("%")
                .withStringFromValueFunction([](float value, int) { return juce::String(value * 100.0f, 1) + "%"; })
                .withValueFromStringFunction([](const juce::String& text) { return text.getFloatValue() / 100.0f; })
        ));
        
        // Pitch Shift (semitones: -24 to +24)
        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { PITCH_SHIFT_ID, 1 },
            "Pitch Shift",
            juce::NormalisableRange<float>(PITCH_SHIFT_MIN, PITCH_SHIFT_MAX, 0.01f),
            PITCH_SHIFT_DEFAULT,
            juce::AudioParameterFloatAttributes{}
                .withLabel("st")
                .withStringFromValueFunction([](float value, int) {
                    juce::String prefix = value >= 0 ? "+" : "";
                    return prefix + juce::String(value, 2) + " st";
                })
                .withValueFromStringFunction([](const juce::String& text) { return text.getFloatValue(); })
        ));
        
        // Formant Shift (semitones: -12 to +12)
        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { FORMANT_SHIFT_ID, 1 },
            "Formant Shift",
            juce::NormalisableRange<float>(FORMANT_SHIFT_MIN, FORMANT_SHIFT_MAX, 0.1f),
            FORMANT_SHIFT_DEFAULT,
            juce::AudioParameterFloatAttributes{}
                .withLabel("st")
                .withStringFromValueFunction([](float value, int) {
                    juce::String prefix = value >= 0 ? "+" : "";
                    return prefix + juce::String(value, 1) + " st";
                })
                .withValueFromStringFunction([](const juce::String& text) { return text.getFloatValue(); })
        ));
        
        // Mix (0% to 100%)
        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { MIX_ID, 1 },
            "Mix",
            juce::NormalisableRange<float>(MIX_MIN, MIX_MAX, 1.0f),
            MIX_DEFAULT,
            juce::AudioParameterFloatAttributes{}
                .withLabel("%")
                .withStringFromValueFunction([](float value, int) { return juce::String(static_cast<int>(value)) + "%"; })
                .withValueFromStringFunction([](const juce::String& text) { return text.getFloatValue(); })
        ));
        
        // Output Gain (dB: -12 to +12)
        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { OUTPUT_GAIN_ID, 1 },
            "Output Gain",
            juce::NormalisableRange<float>(OUTPUT_GAIN_MIN, OUTPUT_GAIN_MAX, 0.1f),
            OUTPUT_GAIN_DEFAULT,
            juce::AudioParameterFloatAttributes{}
                .withLabel("dB")
                .withStringFromValueFunction([](float value, int) {
                    juce::String prefix = value >= 0 ? "+" : "";
                    return prefix + juce::String(value, 1) + " dB";
                })
                .withValueFromStringFunction([](const juce::String& text) { return text.getFloatValue(); })
        ));
        
        // Key Lock (boolean)
        params.push_back(std::make_unique<juce::AudioParameterBool>(
            juce::ParameterID { KEY_LOCK_ID, 1 },
            "Key Lock",
            false
        ));
        
        // Linked (boolean - links time and pitch knobs)
        params.push_back(std::make_unique<juce::AudioParameterBool>(
            juce::ParameterID { LINKED_ID, 1 },
            "Link Time/Pitch",
            false
        ));
        
        // Algorithm Choice
        params.push_back(std::make_unique<juce::AudioParameterChoice>(
            juce::ParameterID { ALGORITHM_ID, 1 },
            "Algorithm",
            juce::StringArray { "Phase Vocoder", "Granular", "WSOLA" },
            0  // Default to Phase Vocoder
        ));
        
        // Quality (1-5)
        params.push_back(std::make_unique<juce::AudioParameterInt>(
            juce::ParameterID { QUALITY_ID, 1 },
            "Quality",
            QUALITY_MIN,
            QUALITY_MAX,
            QUALITY_DEFAULT
        ));
        
        // Grain Size (for Granular algorithm)
        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { GRAIN_SIZE_ID, 1 },
            "Grain Size",
            juce::NormalisableRange<float>(GRAIN_SIZE_MIN, GRAIN_SIZE_MAX, 1.0f, 0.5f),
            GRAIN_SIZE_DEFAULT,
            juce::AudioParameterFloatAttributes{}
                .withLabel("ms")
                .withStringFromValueFunction([](float value, int) { return juce::String(static_cast<int>(value)) + " ms"; })
                .withValueFromStringFunction([](const juce::String& text) { return text.getFloatValue(); })
        ));
        
        // Grain Density (grains per second)
        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { GRAIN_DENSITY_ID, 1 },
            "Grain Density",
            juce::NormalisableRange<float>(GRAIN_DENSITY_MIN, GRAIN_DENSITY_MAX, 1.0f),
            GRAIN_DENSITY_DEFAULT,
            juce::AudioParameterFloatAttributes{}
                .withLabel("g/s")
                .withStringFromValueFunction([](float value, int) { return juce::String(static_cast<int>(value)) + " g/s"; })
                .withValueFromStringFunction([](const juce::String& text) { return text.getFloatValue(); })
        ));
        
        return { params.begin(), params.end() };
    }
    
} // namespace ParameterLayout
