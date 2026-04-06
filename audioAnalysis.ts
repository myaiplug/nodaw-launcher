// NoDAW Audio Analysis - BPM Detection & Pitch Analysis
// Uses multiple methods for accurate tempo detection

import { analyze } from 'web-audio-beat-detector';

export interface AudioAnalysisResult {
  bpm: number;
  confidence: number;
  key: string | null;
  pitch: number | null;
  duration: number;
  sampleRate: number;
  channels: number;
}

// Primary BPM detection using web-audio-beat-detector
export const detectBpmPrimary = async (buffer: AudioBuffer): Promise<{ bpm: number; offset: number }> => {
  try {
    const result = await analyze(buffer);
    return { bpm: Math.round(result.tempo), offset: result.offset };
  } catch (e) {
    console.warn('Primary BPM detection failed, using fallback', e);
    return { bpm: 0, offset: 0 };
  }
};

// Secondary BPM detection using peak detection (onset-based)
export const detectBpmSecondary = (buffer: AudioBuffer): number => {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // Downsample for faster processing
  const downsampleFactor = 4;
  const downsampled: number[] = [];
  for (let i = 0; i < channelData.length; i += downsampleFactor) {
    let sum = 0;
    for (let j = 0; j < downsampleFactor && i + j < channelData.length; j++) {
      sum += Math.abs(channelData[i + j]);
    }
    downsampled.push(sum / downsampleFactor);
  }
  
  // Find peaks (onset detection)
  const windowSize = Math.floor((sampleRate / downsampleFactor) * 0.05); // 50ms window
  const peaks: number[] = [];
  const threshold = 1.5;
  
  for (let i = windowSize; i < downsampled.length - windowSize; i++) {
    const windowMax = Math.max(...downsampled.slice(i - windowSize, i));
    if (downsampled[i] > windowMax * threshold && downsampled[i] > 0.01) {
      peaks.push(i);
      i += windowSize; // Skip ahead to avoid duplicate peaks
    }
  }
  
  if (peaks.length < 4) return 0;
  
  // Calculate intervals between peaks
  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }
  
  // Find most common interval (mode) using histogram
  const histogram: Record<number, number> = {};
  const tolerance = Math.floor((sampleRate / downsampleFactor) * 0.02); // 20ms tolerance
  
  intervals.forEach(interval => {
    const bucket = Math.round(interval / tolerance) * tolerance;
    histogram[bucket] = (histogram[bucket] || 0) + 1;
  });
  
  // Find the most common interval
  let modeInterval = 0;
  let maxCount = 0;
  for (const [interval, count] of Object.entries(histogram)) {
    if (count > maxCount) {
      maxCount = count;
      modeInterval = parseInt(interval);
    }
  }
  
  if (modeInterval === 0) return 0;
  
  // Convert interval to BPM
  const secondsPerBeat = (modeInterval * downsampleFactor) / sampleRate;
  let bpm = 60 / secondsPerBeat;
  
  // Normalize to common BPM range (60-180)
  while (bpm < 60) bpm *= 2;
  while (bpm > 180) bpm /= 2;
  
  return Math.round(bpm);
};

// Autocorrelation-based BPM detection (third method for verification)
export const detectBpmAutocorrelation = (buffer: AudioBuffer): number => {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // Take a sample from the middle of the track (30 seconds max)
  const sampleDuration = Math.min(30, buffer.duration);
  const startSample = Math.floor((buffer.duration - sampleDuration) / 2 * sampleRate);
  const endSample = startSample + Math.floor(sampleDuration * sampleRate);
  
  // Low-pass filter and downsample
  const downsampleRate = 4;
  const samples: number[] = [];
  for (let i = startSample; i < endSample; i += downsampleRate) {
    let sum = 0;
    for (let j = 0; j < downsampleRate && i + j < endSample; j++) {
      sum += Math.abs(channelData[i + j]);
    }
    samples.push(sum / downsampleRate);
  }
  
  // Compute energy envelope
  const envelopeSize = Math.floor((sampleRate / downsampleRate) * 0.01); // 10ms window
  const envelope: number[] = [];
  for (let i = 0; i < samples.length - envelopeSize; i += envelopeSize) {
    let energy = 0;
    for (let j = 0; j < envelopeSize; j++) {
      energy += samples[i + j] * samples[i + j];
    }
    envelope.push(Math.sqrt(energy / envelopeSize));
  }
  
  // BPM range: 60-180 BPM
  const minBpm = 60;
  const maxBpm = 180;
  const effectiveSampleRate = sampleRate / downsampleRate / envelopeSize;
  const minLag = Math.floor((60 / maxBpm) * effectiveSampleRate);
  const maxLag = Math.floor((60 / minBpm) * effectiveSampleRate);
  
  // Autocorrelation
  let maxCorrelation = 0;
  let bestLag = 0;
  
  for (let lag = minLag; lag <= Math.min(maxLag, envelope.length / 2); lag++) {
    let correlation = 0;
    let count = 0;
    for (let i = 0; i < envelope.length - lag; i++) {
      correlation += envelope[i] * envelope[i + lag];
      count++;
    }
    correlation /= count;
    
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestLag = lag;
    }
  }
  
  if (bestLag === 0) return 0;
  
  const bpm = (60 * effectiveSampleRate) / bestLag;
  return Math.round(bpm);
};

// Pitch detection using autocorrelation (fundamental frequency)
export const detectPitch = (buffer: AudioBuffer): number | null => {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // Take a 1 second sample from the middle
  const sampleDuration = Math.min(1, buffer.duration);
  const startSample = Math.floor((buffer.duration - sampleDuration) / 2 * sampleRate);
  const samples = channelData.slice(startSample, startSample + Math.floor(sampleDuration * sampleRate));
  
  // Simple autocorrelation for pitch
  const minFreq = 80; // Min pitch (Hz)
  const maxFreq = 1000; // Max pitch (Hz)
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);
  
  let maxCorrelation = 0;
  let bestPeriod = 0;
  
  for (let period = minPeriod; period <= maxPeriod; period++) {
    let correlation = 0;
    for (let i = 0; i < samples.length - period; i++) {
      correlation += samples[i] * samples[i + period];
    }
    
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestPeriod = period;
    }
  }
  
  if (bestPeriod === 0) return null;
  return Math.round(sampleRate / bestPeriod);
};

// Detect musical key from pitch
export const detectKey = (fundamentalPitch: number | null): string | null => {
  if (!fundamentalPitch) return null;
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const A4 = 440;
  
  // Calculate semitones from A4
  const semitones = 12 * Math.log2(fundamentalPitch / A4);
  const noteIndex = Math.round(semitones) % 12;
  const adjustedIndex = (noteIndex + 9 + 12) % 12; // A is at index 9, normalize to C=0
  
  return noteNames[adjustedIndex];
};

// Main analysis function - combines all methods
export const analyzeAudio = async (buffer: AudioBuffer): Promise<AudioAnalysisResult> => {
  // Run BPM detection methods in parallel
  const [primaryResult, secondaryBpm, autocorrBpm] = await Promise.all([
    detectBpmPrimary(buffer),
    Promise.resolve(detectBpmSecondary(buffer)),
    Promise.resolve(detectBpmAutocorrelation(buffer))
  ]);
  
  // Weight the results - primary is most reliable
  let finalBpm = primaryResult.bpm;
  let confidence = 0;
  
  const validBpms = [primaryResult.bpm, secondaryBpm, autocorrBpm].filter(b => b > 0);
  
  if (validBpms.length === 0) {
    finalBpm = 0;
    confidence = 0;
  } else if (validBpms.length === 1) {
    finalBpm = validBpms[0];
    confidence = 0.5;
  } else {
    // Check agreement between methods
    const tolerance = 5; // BPM tolerance
    const agreements = validBpms.filter(bpm => 
      validBpms.some(other => Math.abs(bpm - other) <= tolerance && bpm !== other)
    );
    
    if (agreements.length >= 2) {
      // Multiple methods agree - high confidence
      finalBpm = Math.round(agreements.reduce((a, b) => a + b) / agreements.length);
      confidence = 0.9;
    } else if (primaryResult.bpm > 0) {
      // Trust primary
      finalBpm = primaryResult.bpm;
      confidence = 0.7;
    } else {
      // Average all valid results
      finalBpm = Math.round(validBpms.reduce((a, b) => a + b) / validBpms.length);
      confidence = 0.5;
    }
  }
  
  // Pitch detection
  const pitch = detectPitch(buffer);
  const key = detectKey(pitch);
  
  return {
    bpm: finalBpm,
    confidence,
    key,
    pitch,
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    channels: buffer.numberOfChannels
  };
};

// Format duration as MM:SS
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format BPM with confidence indicator
export const formatBpmWithConfidence = (bpm: number, confidence: number): string => {
  if (bpm === 0) return '--';
  const indicator = confidence >= 0.8 ? '●' : confidence >= 0.5 ? '◐' : '○';
  return `${bpm} ${indicator}`;
};
