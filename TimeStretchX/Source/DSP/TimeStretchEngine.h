/*
  ==============================================================================

    TimeStretchEngine.h
    Core DSP engine for time-stretching and pitch-shifting
    
    NoDAW Studio Suite
    Copyright (c) 2026 NoDAW Studio. All rights reserved.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include <vector>
#include <complex>
#include <cmath>

/**
 * Core time-stretching and pitch-shifting engine
 * Implements multiple algorithms: Phase Vocoder, Granular, and WSOLA
 */
class TimeStretchEngine
{
public:
    TimeStretchEngine();
    ~TimeStretchEngine();
    
    //==============================================================================
    /** Prepares the engine for playback */
    void prepare(double sampleRate, int samplesPerBlock, int numChannels);
    
    /** Resets internal state */
    void reset();
    
    /** Process audio buffer in-place */
    void process(juce::AudioBuffer<float>& buffer);
    
    /** Process a full audio file offline (for standalone mode) */
    juce::AudioBuffer<float> processOffline(const juce::AudioBuffer<float>& input,
                                            std::function<void(float)> progressCallback = nullptr);
    
    //==============================================================================
    // Parameter setters
    void setTimeStretch(float ratio);       // 0.25 to 4.0
    void setPitchShift(float semitones);    // -24 to +24
    void setFormantShift(float semitones);  // -12 to +12
    void setAlgorithm(int algorithmIndex);  // 0=PhaseVocoder, 1=Granular, 2=WSOLA
    void setQuality(int quality);           // 1-5
    void setKeyLock(bool enabled);          // Preserve pitch when time-stretching
    void setGrainSize(float ms);            // Granular grain size
    void setGrainDensity(float grainsPerSec); // Granular density
    
    // Parameter getters
    float getTimeStretch() const { return timeStretchRatio; }
    float getPitchShift() const { return pitchShiftSemitones; }
    float getFormantShift() const { return formantShiftSemitones; }
    int getAlgorithm() const { return currentAlgorithm; }
    int getQuality() const { return qualityLevel; }
    bool getKeyLock() const { return keyLockEnabled; }
    
    //==============================================================================
    /** Returns the latency in samples */
    int getLatencySamples() const;
    
private:
    //==============================================================================
    // Algorithm identifiers
    enum Algorithm
    {
        PhaseVocoder = 0,
        Granular = 1,
        WSOLA = 2
    };
    
    //==============================================================================
    // Phase Vocoder implementation
    class PhaseVocoderProcessor
    {
    public:
        void prepare(double sampleRate, int maxBlockSize, int numChannels);
        void reset();
        void process(juce::AudioBuffer<float>& buffer, float timeStretch, float pitchShift);
        void setQuality(int quality);
        int getLatency() const;
        
    private:
        // FFT configuration
        static constexpr int MIN_FFT_SIZE = 1024;
        static constexpr int MAX_FFT_SIZE = 8192;
        int fftSize = 4096;
        int hopSize = 1024;
        int overlapFactor = 4;
        
        // FFT processor
        std::unique_ptr<juce::dsp::FFT> fft;
        std::unique_ptr<juce::dsp::WindowingFunction<float>> window;
        
        // Buffers per channel
        struct ChannelState
        {
            std::vector<float> inputBuffer;
            std::vector<float> outputBuffer;
            std::vector<std::complex<float>> fftBuffer;
            std::vector<float> magnitudes;
            std::vector<float> phases;
            std::vector<float> lastPhases;
            std::vector<float> phaseDiff;
            std::vector<float> synthesisPhases;
            int inputWritePos  = 0;
            int outputReadPos  = 0;
            int outputWritePos = 0;   // next slot to overlap-add into
            int hopCounter     = 0;   // samples since last frame
        };
        std::vector<ChannelState> channelStates;
        
        double sampleRate = 44100.0;
        int numChannels = 2;
        
        void analyzeFrame(int channel);
        void synthesizeFrame(int channel, float timeStretch, float pitchShift);
        float unwrapPhase(float phase);
    };
    
    //==============================================================================
    // Granular implementation
    class GranularProcessor
    {
    public:
        void prepare(double sampleRate, int maxBlockSize, int numChannels);
        void reset();
        void process(juce::AudioBuffer<float>& buffer, float timeStretch, float pitchShift);
        void setGrainSize(float ms);
        void setGrainDensity(float grainsPerSec);
        int getLatency() const;
        
    private:
        struct Grain
        {
            bool active = false;
            int sourcePos = 0;
            int grainPos = 0;
            int length = 0;
            float amplitude = 1.0f;
            float pitchRatio = 1.0f;
        };
        
        static constexpr int MAX_GRAINS = 64;
        std::vector<Grain> grains;
        
        std::vector<float> inputBuffer;
        int inputWritePos = 0;
        float grainSizeMs = 100.0f;
        float grainsPerSecond = 20.0f;
        float grainSpawnCounter = 0.0f;
        
        double sampleRate = 44100.0;
        int numChannels = 2;
        
        void spawnGrain(int sourcePosition, float pitchRatio);
        float getWindowValue(int position, int length);
    };
    
    //==============================================================================
    // WSOLA implementation
    class WSOLAProcessor
    {
    public:
        void prepare(double sampleRate, int maxBlockSize, int numChannels);
        void reset();
        void process(juce::AudioBuffer<float>& buffer, float timeStretch);
        int getLatency() const;
        
    private:
        static constexpr int SEGMENT_SIZE = 1024;
        static constexpr int SEARCH_RANGE = 50;
        
        std::vector<float> inputBuffer;
        std::vector<float> outputBuffer;
        int inputReadPos = 0;
        int outputWritePos = 0;
        
        double sampleRate = 44100.0;
        int numChannels = 2;
        
        int findBestOverlap(const float* current, const float* target, int length);
        float crossCorrelate(const float* a, const float* b, int length);
    };
    
    //==============================================================================
    // Member variables
    double currentSampleRate = 44100.0;
    int currentBlockSize = 512;
    int currentNumChannels = 2;
    bool isPrepared = false;
    
    float timeStretchRatio = 1.0f;
    float pitchShiftSemitones = 0.0f;
    float formantShiftSemitones = 0.0f;
    int currentAlgorithm = PhaseVocoder;
    int qualityLevel = 3;
    bool keyLockEnabled = false;
    float grainSizeMs = 100.0f;
    float grainDensity = 20.0f;
    
    // Processors
    PhaseVocoderProcessor phaseVocoder;
    GranularProcessor granular;
    WSOLAProcessor wsola;
    
    // Formant preservation filter
    juce::dsp::IIR::Filter<float> formantFilter;
    
    //==============================================================================
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(TimeStretchEngine)
};
