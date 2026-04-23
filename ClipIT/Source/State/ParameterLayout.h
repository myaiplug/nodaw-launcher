#pragma once

#include <JuceHeader.h>

namespace ClipITParams
{
    static constexpr auto inputGain = "INPUT_GAIN";
    static constexpr auto outputGain = "OUTPUT_GAIN";
    static constexpr auto ceiling = "CEILING";
    static constexpr auto knee = "KNEE";
    static constexpr auto clipMode = "CLIP_MODE";
    static constexpr auto oversampling = "OVERSAMPLING";
    static constexpr auto hardClip = "HARD_CLIP";
    static constexpr auto deltaSolo = "DELTA_SOLO";
    static constexpr auto firRemainder = "FIR_REMAINDER";
    static constexpr auto loudnessComp = "LOUDNESS_COMP";
    static constexpr auto truePeakSafety = "TRUE_PEAK_SAFETY";
    static constexpr auto truePeakCeiling = "TRUE_PEAK_CEILING";
    static constexpr auto softVoice = "SOFT_VOICE";
    static constexpr auto hardVoice = "HARD_VOICE";
    static constexpr auto hybridVoice = "HYBRID_VOICE";

    inline juce::AudioProcessorValueTreeState::ParameterLayout createLayout()
    {
        std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { inputGain, 1 }, "Input Gain", juce::NormalisableRange<float>(-24.0f, 24.0f, 0.1f), 0.0f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { outputGain, 1 }, "Output Gain", juce::NormalisableRange<float>(-24.0f, 12.0f, 0.1f), 0.0f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { ceiling, 1 }, "Ceiling", juce::NormalisableRange<float>(-6.0f, 0.0f, 0.01f), -1.0f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { knee, 1 }, "Knee", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 30.0f));

        params.push_back(std::make_unique<juce::AudioParameterChoice>(
            juce::ParameterID { clipMode, 1 }, "Clip Mode", juce::StringArray { "Soft", "Hard", "Hybrid" }, 0));

        params.push_back(std::make_unique<juce::AudioParameterChoice>(
            juce::ParameterID { oversampling, 1 }, "Oversampling", juce::StringArray { "Off", "2x", "4x", "8x" }, 2));

        params.push_back(std::make_unique<juce::AudioParameterBool>(
            juce::ParameterID { hardClip, 1 }, "Hard Clip Safety", false));

        params.push_back(std::make_unique<juce::AudioParameterBool>(
            juce::ParameterID { deltaSolo, 1 }, "Delta Solo", false));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { loudnessComp, 1 }, "Loudness Compensation", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 0.0f));

        params.push_back(std::make_unique<juce::AudioParameterBool>(
            juce::ParameterID { truePeakSafety, 1 }, "True Peak Safety", false));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { truePeakCeiling, 1 }, "True Peak Ceiling", juce::NormalisableRange<float>(-2.0f, -0.1f, 0.01f), -0.3f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { softVoice, 1 }, "Soft Voice", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 35.0f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { hardVoice, 1 }, "Hard Voice", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 20.0f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { hybridVoice, 1 }, "Hybrid Voice", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 50.0f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { firRemainder, 1 }, "FIR Remainder", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 0.0f));

        return { params.begin(), params.end() };
    }
}
