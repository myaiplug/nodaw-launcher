#pragma once

#include <JuceHeader.h>

namespace RepairITParams
{
    static constexpr auto denoise = "DENOISE";
    static constexpr auto declick = "DECLICK";
    static constexpr auto dehum = "DEHUM";
    static constexpr auto mix = "MIX";

    inline juce::AudioProcessorValueTreeState::ParameterLayout createLayout()
    {
        std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { denoise, 1 }, "Denoise", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 35.0f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { declick, 1 }, "DeClick", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 25.0f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { dehum, 1 }, "DeHum", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 20.0f));

        params.push_back(std::make_unique<juce::AudioParameterFloat>(
            juce::ParameterID { mix, 1 }, "Mix", juce::NormalisableRange<float>(0.0f, 100.0f, 0.1f), 100.0f));

        return { params.begin(), params.end() };
    }
}
