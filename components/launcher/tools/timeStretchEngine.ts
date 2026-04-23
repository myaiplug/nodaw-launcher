import FFT from 'fft.js';

export interface TimeStretchParams {
  timeRatio: number;
  pitchShift: number;
  mixAmount: number;
  preserveFormants: boolean;
  antiAliasing: boolean;
}

export interface AudioBufferInfo {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  length: number;
}

type ProcessingPhase = 'analyzing' | 'transient-detect' | 'hybrid' | 'pitch' | 'post' | 'complete';
type ProcessingCallback = (progress: number, phase: ProcessingPhase) => void;

function cubicInterp(buffer: Float32Array, index: number): number {
  const i = Math.floor(index);
  const x = index - i;

  const y0 = buffer[i - 1] ?? 0;
  const y1 = buffer[i] ?? 0;
  const y2 = buffer[i + 1] ?? 0;
  const y3 = buffer[i + 2] ?? 0;

  return (
    y1 +
    0.5 * x * (y2 - y0 +
    x * (2 * y0 - 5 * y1 + 4 * y2 - y3 +
    x * (3 * (y1 - y2) + y3 - y0)))
  );
}

function lowpassInPlace(buffer: Float32Array, cutoff: number, sampleRate: number): void {
  if (buffer.length === 0) return;

  const rc = 1.0 / (cutoff * 2 * Math.PI);
  const dt = 1.0 / sampleRate;
  const alpha = dt / (rc + dt);

  let prev = buffer[0];

  for (let i = 1; i < buffer.length; i++) {
    prev = prev + alpha * (buffer[i] - prev);
    buffer[i] = prev;
  }
}

function detectTransients(buffer: Float32Array, threshold = 0.22): boolean[] {
  const transients = new Array(buffer.length).fill(false);

  for (let i = 1; i < buffer.length; i++) {
    const diff = Math.abs(buffer[i]) - Math.abs(buffer[i - 1]);
    if (diff > threshold) {
      transients[i] = true;
    }
  }

  return transients;
}

function getRms(buffer: Float32Array): number {
  if (buffer.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
}

function matchLoudness(input: Float32Array, output: Float32Array): void {
  const inRms = getRms(input);
  const outRms = getRms(output);
  if (inRms < 1e-6 || outRms < 1e-6) return;

  const gain = inRms / outRms;
  for (let i = 0; i < output.length; i++) output[i] *= gain;
}

class AdvancedPhaseVocoder {
  private readonly fftSize: number;
  private readonly hopSize: number;
  private readonly fft: FFT;
  private readonly window: Float32Array;
  private readonly phaseAcc: Float32Array;
  private readonly prevPhase: Float32Array;

  constructor(fftSize = 2048) {
    this.fftSize = fftSize;
    this.hopSize = fftSize / 4;
    this.fft = new FFT(fftSize);
    this.window = this.createHannWindow(fftSize);
    this.phaseAcc = new Float32Array(fftSize);
    this.prevPhase = new Float32Array(fftSize);
  }

  process(input: Float32Array, stretch: number): Float32Array {
    if (input.length < this.fftSize) {
      const shortOutput = new Float32Array(Math.max(1, Math.floor(input.length * stretch)));
      for (let i = 0; i < shortOutput.length; i++) {
        shortOutput[i] = cubicInterp(input, i / stretch);
      }
      return shortOutput;
    }

    const output = new Float32Array(Math.floor(input.length * stretch) + this.fftSize);
    const spectrum = this.fft.createComplexArray();
    const outputSpectrum = this.fft.createComplexArray();
    const inverseFrame = this.fft.createComplexArray();

    let inPos = 0;
    let outPos = 0;
    const synthesisHop = Math.max(1, Math.floor(this.hopSize * stretch));

    while (inPos + this.fftSize < input.length && outPos + this.fftSize < output.length) {
      const frame = new Float32Array(this.fftSize);

      for (let i = 0; i < this.fftSize; i++) {
        frame[i] = input[inPos + i] * this.window[i];
      }

      spectrum.fill(0);
      outputSpectrum.fill(0);
      this.fft.realTransform(spectrum, frame);
      if (this.fft.completeSpectrum) this.fft.completeSpectrum(spectrum);

      const halfBins = this.fftSize / 2;
      for (let bin = 0; bin <= halfBins; bin++) {
        const index = bin * 2;
        const real = spectrum[index] ?? 0;
        const imag = spectrum[index + 1] ?? 0;

        const mag = Math.sqrt(real * real + imag * imag);
        const phase = Math.atan2(imag, real);
        const expected = 2 * Math.PI * this.hopSize * bin / this.fftSize;
        let delta = phase - this.prevPhase[bin] - expected;
        this.prevPhase[bin] = phase;
        delta = this.unwrapPhase(delta);

        const trueFreq = expected + delta / this.hopSize;
        this.phaseAcc[bin] += trueFreq * synthesisHop;

        outputSpectrum[index] = mag * Math.cos(this.phaseAcc[bin]);
        outputSpectrum[index + 1] = mag * Math.sin(this.phaseAcc[bin]);
      }

      this.fft.inverseTransform(inverseFrame, outputSpectrum);

      for (let i = 0; i < this.fftSize && outPos + i < output.length; i++) {
        output[outPos + i] += (inverseFrame[i * 2] / this.fftSize) * this.window[i];
      }

      inPos += this.hopSize;
      outPos += synthesisHop;
    }

    return output.subarray(0, Math.floor(input.length * stretch));
  }

  private unwrapPhase(phase: number): number {
    while (phase < -Math.PI) phase += 2 * Math.PI;
    while (phase > Math.PI) phase -= 2 * Math.PI;
    return phase;
  }

  private createHannWindow(size: number): Float32Array {
    const w = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / size));
    }
    return w;
  }
}

class PSOLALitePitchEngine {
  process(input: Float32Array, semitones: number): Float32Array {
    if (Math.abs(semitones) < 0.01) return input;
    const pitchRatio = Math.pow(2, semitones / 12);
    const output = new Float32Array(input.length);

    for (let i = 0; i < output.length; i++) {
      output[i] = cubicInterp(input, i * pitchRatio);
    }

    return output;
  }
}

function hybridProcess(input: Float32Array, stretch: number, vocoder: AdvancedPhaseVocoder): Float32Array {
  const transients = detectTransients(input);
  const output = new Float32Array(Math.floor(input.length * stretch) + 2048);
  let segmentStart = 0;

  for (let i = 1; i < input.length; i++) {
    if (!transients[i]) continue;

    const segment = input.slice(segmentStart, i);
    if (segment.length > 0) {
      const processed = vocoder.process(segment, stretch);
      output.set(processed.subarray(0, Math.min(processed.length, output.length - Math.floor(segmentStart * stretch))), Math.floor(segmentStart * stretch));
    }

    const outIndex = Math.floor(i * stretch);
    if (outIndex < output.length) {
      output[outIndex] = input[i];
    }

    segmentStart = i + 1;
  }

  if (segmentStart < input.length) {
    const tail = input.slice(segmentStart);
    const processedTail = vocoder.process(tail, stretch);
    output.set(processedTail.subarray(0, Math.min(processedTail.length, output.length - Math.floor(segmentStart * stretch))), Math.floor(segmentStart * stretch));
  }

  return output.subarray(0, Math.floor(input.length * stretch));
}

export class TimeStretchEngine {
  private audioContext: AudioContext | null = null;
  private sourceBuffer: AudioBuffer | null = null;
  private processedBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  private readonly phaseVocoder = new AdvancedPhaseVocoder();
  private readonly pitchEngine = new PSOLALitePitchEngine();

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  async loadFile(file: File): Promise<AudioBufferInfo> {
    return this.loadArrayBuffer(await file.arrayBuffer());
  }

  async loadArrayBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBufferInfo> {
    if (!this.audioContext) this.initAudioContext();
    this.sourceBuffer = await this.audioContext!.decodeAudioData(arrayBuffer.slice(0));

    return {
      duration: this.sourceBuffer.duration,
      sampleRate: this.sourceBuffer.sampleRate,
      numberOfChannels: this.sourceBuffer.numberOfChannels,
      length: this.sourceBuffer.length,
    };
  }

  getWaveformData(samples = 1000): Float32Array | null {
    if (!this.sourceBuffer) return null;

    const channelData = this.sourceBuffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channelData.length / samples));
    const waveform = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      let sum = 0;

      for (let j = 0; j < blockSize && start + j < channelData.length; j++) {
        sum += Math.abs(channelData[start + j]);
      }

      waveform[i] = sum / blockSize;
    }

    return waveform;
  }

  async process(params: TimeStretchParams, onProgress?: ProcessingCallback): Promise<void> {
    if (!this.sourceBuffer || !this.audioContext) throw new Error('No audio loaded');

    onProgress?.(10, 'analyzing');

    const sampleRate = this.sourceBuffer.sampleRate;
    const outputLength = Math.floor(this.sourceBuffer.length * params.timeRatio);
    this.processedBuffer = this.audioContext.createBuffer(
      this.sourceBuffer.numberOfChannels,
      outputLength,
      sampleRate,
    );

    onProgress?.(25, 'transient-detect');

    for (let channel = 0; channel < this.sourceBuffer.numberOfChannels; channel++) {
      const inputData = this.sourceBuffer.getChannelData(channel);
      const outputData = this.processedBuffer.getChannelData(channel);

      onProgress?.(40, 'hybrid');
      let processed = hybridProcess(inputData, params.timeRatio, this.phaseVocoder);

      onProgress?.(65, 'pitch');
      if (Math.abs(params.pitchShift) > 0.01) {
        processed = this.pitchEngine.process(processed, params.pitchShift);
      }

      onProgress?.(82, 'post');
      if (params.antiAliasing && params.pitchShift > 0) {
        lowpassInPlace(processed, Math.min(sampleRate * 0.45, 12000), sampleRate);
      }

      matchLoudness(inputData, processed);

      const wetAmount = params.mixAmount / 100;
      const dryAmount = 1 - wetAmount;

      for (let i = 0; i < outputLength; i++) {
        const wet = processed[i] ?? 0;
        const dry = cubicInterp(inputData, i / params.timeRatio);
        outputData[i] = wet * wetAmount + dry * dryAmount;
      }
    }

    onProgress?.(100, 'complete');
  }

  async play(): Promise<void> {
    if (this.isPlaying) this.stop();

    const buffer = this.processedBuffer || this.sourceBuffer;
    if (!buffer || !this.audioContext || !this.gainNode) return;

    await this.audioContext.resume();

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.connect(this.gainNode);
    this.sourceNode.start();
    this.isPlaying = true;

    this.sourceNode.onended = () => {
      this.isPlaying = false;
    };
  }

  stop(): void {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch {
      }
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    this.isPlaying = false;
  }

  setVolume(volume: number): void {
    this.gainNode?.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext?.currentTime ?? 0);
  }

  async exportWav(): Promise<Blob> {
    const buffer = this.processedBuffer || this.sourceBuffer;
    if (!buffer) throw new Error('No audio to export');

    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const samples = buffer.length;
    const dataLength = samples * numChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, value: string): void => {
      for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < samples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = buffer.getChannelData(ch)[i] ?? 0;
        const clamped = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  async exportMp3(): Promise<Blob> {
    return this.exportWav();
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getProcessedInfo(): AudioBufferInfo | null {
    if (!this.processedBuffer) return null;

    return {
      duration: this.processedBuffer.duration,
      sampleRate: this.processedBuffer.sampleRate,
      numberOfChannels: this.processedBuffer.numberOfChannels,
      length: this.processedBuffer.length,
    };
  }

  dispose(): void {
    this.stop();
    void this.audioContext?.close();
    this.audioContext = null;
    this.sourceBuffer = null;
    this.processedBuffer = null;
  }
}

let engineInstance: TimeStretchEngine | null = null;

export function getTimeStretchEngine(): TimeStretchEngine {
  if (!engineInstance) engineInstance = new TimeStretchEngine();
  return engineInstance;
}

export default TimeStretchEngine;
