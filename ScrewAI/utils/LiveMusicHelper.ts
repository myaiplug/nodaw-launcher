
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { PlaybackState, Prompt } from '../types';
import type { AudioChunk, GoogleGenAI, LiveMusicServerMessage, LiveMusicSession } from '@google/genai';
import { decode, decodeAudioData, audioBufferToWav } from './audio';
import { throttle } from './throttle';
import { NEGATIVE_PROMPTS } from './presets';

// ---------------------------------------------------------------------------
// Phase Vocoder AudioWorklet (embedded as blob URL for Electron compatibility)
// ---------------------------------------------------------------------------
const PHASE_VOCODER_WORKLET_CODE = `
'use strict';
function pvFft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let b = n >> 1;
    for (; j & b; b >>= 1) j ^= b;
    j ^= b;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
          t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  for (let s = 2; s <= n; s <<= 1) {
    const h = s >> 1;
    const ca = Math.cos(-2 * Math.PI / s);
    const sa = Math.sin(-2 * Math.PI / s);
    for (let k = 0; k < n; k += s) {
      let wr = 1.0, wi = 0.0;
      for (let j = 0; j < h; j++) {
        const ar = re[k+j], ai = im[k+j];
        const br = re[k+j+h]*wr - im[k+j+h]*wi;
        const bi = re[k+j+h]*wi + im[k+j+h]*wr;
        re[k+j]   = ar+br; im[k+j]   = ai+bi;
        re[k+j+h] = ar-br; im[k+j+h] = ai-bi;
        const tr = wr*ca - wi*sa;
        wi = wr*sa + wi*ca;
        wr = tr;
      }
    }
  }
}
function pvIfft(re, im) {
  for (let i = 0; i < im.length; i++) im[i] = -im[i];
  pvFft(re, im);
  const n = re.length;
  for (let i = 0; i < n; i++) { re[i] /= n; im[i] = -im[i] / n; }
}
class PhaseVocoderProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    const N = 2048, OVERLAP = 4;
    this.N = N; this.hopA = N / OVERLAP; this.hopS = N / OVERLAP;
    this.win = new Float32Array(N);
    for (let i = 0; i < N; i++) this.win[i] = 0.5 * (1.0 - Math.cos(2.0 * Math.PI * i / N));
    this.prevPhase = [new Float32Array(N), new Float32Array(N)];
    this.phaseSum  = [new Float32Array(N), new Float32Array(N)];
    const ABUF = 16384, RBUF = 32768;
    this.abuf = [new Float32Array(ABUF), new Float32Array(ABUF)];
    this.abufSize = ABUF; this.abufCursor = 0;
    this.rbuf = [new Float32Array(RBUF), new Float32Array(RBUF)];
    this.rbufSize = RBUF; this.rbufWr = 0; this.rbufRd = 0; this.rbufFill = 0;
    this.input = null; this.inputLen = 0; this.numCh = 2; this.readPos = 0;
    this.speed = 1.0; this.pitchFactor = 1.0; this.isPlaying = false;
    this.port.onmessage = ({ data }) => this._onMsg(data);
  }
  _reset() {
    this.readPos = 0; this.abufCursor = 0;
    this.rbufWr = 0; this.rbufRd = 0; this.rbufFill = 0;
    for (let c = 0; c < 2; c++) {
      this.prevPhase[c].fill(0); this.phaseSum[c].fill(0);
      this.abuf[c].fill(0);
    }
  }
  _onMsg(data) {
    if (data.type === 'load') {
      this.input = data.channels; this.inputLen = data.length; this.numCh = data.channels.length;
      this._reset(); this.isPlaying = true;
    } else if (data.type === 'params') {
      this.speed = Math.max(0.25, Math.min(4.0, data.speed));
      this.pitchFactor = Math.pow(2.0, data.pitchST / 12.0);
      this.hopS = Math.max(64, Math.round(this.hopA * this.speed));
    } else if (data.type === 'stop') {
      this.isPlaying = false;
    }
  }
  _processFrame() {
    const N = this.N, hopA = this.hopA, hopS = this.hopS;
    const pf = this.pitchFactor, half = N >> 1, win = this.win;
    const norm = 2.0 * hopS / N;
    const TAU = 2.0 * Math.PI;
    for (let ch = 0; ch < 2; ch++) {
      const src = this.input[ch < this.numCh ? ch : 0];
      const re = new Float32Array(N), im = new Float32Array(N);
      const rp = Math.round(this.readPos);
      for (let i = 0; i < N; i++) re[i] = src[(rp + i + this.inputLen) % this.inputLen] * win[i];
      pvFft(re, im);
      const mag = new Float32Array(N), pha = new Float32Array(N);
      for (let k = 0; k < N; k++) { mag[k] = Math.hypot(re[k], im[k]); pha[k] = Math.atan2(im[k], re[k]); }
      const pp = this.prevPhase[ch], ps = this.phaseSum[ch];
      for (let k = 0; k <= half; k++) {
        const expected = TAU * k / N * hopA;
        let dphi = pha[k] - pp[k] - expected;
        dphi -= TAU * Math.round(dphi / TAU);
        ps[k] += (TAU * k / N + dphi / hopA) * hopS;
        pp[k] = pha[k];
      }
      for (let k = half + 1; k < N; k++) ps[k] = -ps[N - k];
      const oRe = new Float32Array(N), oIm = new Float32Array(N);
      for (let k = 0; k <= half; k++) {
        const sk = k / pf, k0 = sk | 0, fr = sk - k0;
        if (k0 <= half) {
          const k1 = Math.min(k0 + 1, half);
          const m = mag[k0] + fr * (mag[k1] - mag[k0]);
          const phi = ps[k0] + fr * (ps[k1] - ps[k0]);
          oRe[k] = m * Math.cos(phi); oIm[k] = m * Math.sin(phi);
        }
      }
      for (let k = 1; k < half; k++) { oRe[N-k] = oRe[k]; oIm[N-k] = -oIm[k]; }
      pvIfft(oRe, oIm);
      const ab = this.abuf[ch], abs = this.abufSize, cur = this.abufCursor;
      for (let i = 0; i < N; i++) ab[(cur + i) % abs] += oRe[i] * win[i] * norm;
    }
    const flush = Math.min(hopS, this.rbufSize - this.rbufFill);
    for (let s = 0; s < flush; s++) {
      const ai = (this.abufCursor + s) % this.abufSize;
      const ri = (this.rbufWr + s) % this.rbufSize;
      for (let ch = 0; ch < 2; ch++) { this.rbuf[ch][ri] = this.abuf[ch][ai]; this.abuf[ch][ai] = 0.0; }
    }
    this.rbufWr = (this.rbufWr + flush) % this.rbufSize;
    this.rbufFill += flush;
    this.abufCursor = (this.abufCursor + hopS) % this.abufSize;
    this.readPos = (this.readPos + hopA) % this.inputLen;
  }
  process(inputs, outputs) {
    if (!this.isPlaying || !this.input) return true;
    const out = outputs[0], bs = out[0] ? out[0].length : 128;
    const needed = bs + this.N * 2;
    while (this.rbufFill < needed) this._processFrame();
    for (let ch = 0; ch < 2; ch++) {
      const oc = out[ch];
      if (!oc) continue;
      for (let s = 0; s < bs; s++) oc[s] = this.rbuf[ch][(this.rbufRd + s) % this.rbufSize];
    }
    this.rbufRd = (this.rbufRd + bs) % this.rbufSize;
    this.rbufFill = Math.max(0, this.rbufFill - bs);
    return true;
  }
}
registerProcessor('phase-vocoder-processor', PhaseVocoderProcessor);
`;

function createWorkletBlobURL(): string {
  const blob = new Blob([PHASE_VOCODER_WORKLET_CODE], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}

export class LiveMusicHelper extends EventTarget {

  private ai: GoogleGenAI;
  private model: string;

  private session: any | null = null;
  private sessionPromise: Promise<any> | null = null;

  private connectionError = true;
  private isUserInitiatedStop = false; 

  private filteredPrompts = new Set<string>();
  private nextStartTime = 0;
  private bufferTime = 4;

  public readonly audioContext: AudioContext;
  public extraDestination: AudioNode | null = null;

  private inputGain: GainNode;
  
  // FX CHAIN
  private preGain: GainNode;
  private lowCutNode: BiquadFilterNode;
  private highCutNode: BiquadFilterNode;
  private tubeDriveNode: WaveShaperNode;
  private tubeGain: GainNode;
  private satNode: WaveShaperNode;
  
  private tremoloNode: GainNode;
  private tremoloOsc: OscillatorNode;
  private tremoloDepth: GainNode;
  
  private chorusDelay: DelayNode;
  private chorusOsc: OscillatorNode;
  private chorusDepth: GainNode;
  private chorusMix: GainNode;
  
  private phaserChain: BiquadFilterNode[] = [];
  private phaserOsc: OscillatorNode;
  private phaserDepth: GainNode;
  private phaserMix: GainNode;

  private eqFilters: BiquadFilterNode[] = [];
  private busGain: GainNode;
  private fxReturnGain: GainNode;
  private limiterNode: DynamicsCompressorNode;
  
  private delayNode: DelayNode;
  private delayFeedback: GainNode;
  private delayWet: GainNode;
  private delayAmountGain: GainNode; 
  private delayLpf: BiquadFilterNode;
  private delayHpf: BiquadFilterNode;
  
  private reverbNode: ConvolverNode;
  private reverbWet: GainNode;
  private reverbLpf: BiquadFilterNode;
  private reverbHpf: BiquadFilterNode;
  
  private currentReverbType = 'Hall';
  private currentReverbSize = 0.5; 
  private currentReverbIntensity = 0.5; 
  private currentDelayNote = '1/4';
  
  private widthGain: GainNode;
  private masterGain: GainNode;
  
  private masterAnalyserNode: AnalyserNode;
  private fxAnalyserNode: AnalyserNode;
  private levelDataArray: Uint8Array;

  private playbackState: PlaybackState = 'stopped';
  private prompts: Map<string, Prompt>;
  
  private _bpm = 120;
  private playbackStartTime = 0;
  private quantizationBars = 4;
  private pendingPrompts: Map<string, Prompt> | null = null;
  private schedulerRafId: number | null = null;
  private lastQuantizationBar = -1;
  private currentContextPrompt = "";

  private rollingBuffer: Float32Array[] = [];
  private rollingBufferDuration = 30;
  private isLooping = false;
  private loopSource: AudioBufferSourceNode | null = null;
  private loopGain: GainNode;

  private recorderNode: ScriptProcessorNode | null = null;
  private recordedChunks: Float32Array[] = [];
  private isRecording = false;
  private recordStartTime = 0;
  private maxRecordTime = 150; 
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private disconnectTimeout: any = null;
  
  private playbackMode: 'ai' | 'file' = 'ai';
  private fileSource: AudioBufferSourceNode | null = null;
  private pvNode: AudioWorkletNode | null = null;
  private workletReady: Promise<void> | null = null;
  private workletBlobURL: string | null = null;
  private fileBuffer: AudioBuffer | null = null;
  private fileSpeed = 1;
  private filePitch = 0;

  constructor(ai: GoogleGenAI, model: string) {
    super();
    this.ai = ai;
    this.model = model;
    this.prompts = new Map();
    this.audioContext = new AudioContext({ sampleRate: 48000 });
    
    // Pre-load the phase vocoder worklet
    this.workletBlobURL = createWorkletBlobURL();
    this.workletReady = this.audioContext.audioWorklet.addModule(this.workletBlobURL)
      .catch(() => { /* worklet unavailable, will fall back to AudioBufferSourceNode */ });
    
    this.inputGain = this.audioContext.createGain();
    this.loopGain = this.audioContext.createGain();
    this.loopGain.gain.value = 0;

    this.preGain = this.audioContext.createGain(); 
    
    this.lowCutNode = this.audioContext.createBiquadFilter();
    this.lowCutNode.type = 'highpass';
    this.lowCutNode.frequency.value = 20;
    
    this.highCutNode = this.audioContext.createBiquadFilter();
    this.highCutNode.type = 'lowpass';
    this.highCutNode.frequency.value = 20000;
    
    this.tubeDriveNode = this.audioContext.createWaveShaper();
    this.tubeGain = this.audioContext.createGain();
    this.satNode = this.audioContext.createWaveShaper();

    this.tremoloNode = this.audioContext.createGain();
    this.tremoloOsc = this.audioContext.createOscillator();
    this.tremoloOsc.frequency.value = 4;
    this.tremoloDepth = this.audioContext.createGain();
    this.tremoloDepth.gain.value = 0;
    this.tremoloOsc.connect(this.tremoloDepth).connect(this.tremoloNode.gain);
    this.tremoloOsc.start();
    
    this.chorusDelay = this.audioContext.createDelay(0.1);
    this.chorusDelay.delayTime.value = 0.03;
    this.chorusOsc = this.audioContext.createOscillator();
    this.chorusOsc.frequency.value = 1.5; 
    this.chorusDepth = this.audioContext.createGain();
    this.chorusDepth.gain.value = 0; 
    this.chorusOsc.connect(this.chorusDepth).connect(this.chorusDelay.delayTime);
    this.chorusOsc.start();
    this.chorusMix = this.audioContext.createGain();
    this.chorusMix.gain.value = 0;

    this.phaserMix = this.audioContext.createGain();
    this.phaserMix.gain.value = 0;
    this.phaserOsc = this.audioContext.createOscillator();
    this.phaserOsc.frequency.value = 0.5;
    this.phaserDepth = this.audioContext.createGain();
    this.phaserDepth.gain.value = 0;
    this.phaserOsc.connect(this.phaserDepth);
    this.phaserOsc.start();
    
    let lastPhaserNode: AudioNode | null = null;
    for(let i=0; i<4; i++) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'allpass';
        filter.frequency.value = 1000;
        this.phaserChain.push(filter);
        this.phaserDepth.connect(filter.frequency);
        if (lastPhaserNode) lastPhaserNode.connect(filter);
        lastPhaserNode = filter;
    }

    this.inputGain.connect(this.preGain);
    this.loopGain.connect(this.preGain);
    
    this.preGain.connect(this.lowCutNode);
    this.lowCutNode.connect(this.highCutNode);
    this.highCutNode.connect(this.tubeDriveNode);
    this.tubeDriveNode.connect(this.tubeGain);
    this.tubeGain.connect(this.satNode);
    this.satNode.connect(this.tremoloNode);
    
    const frequencies = [60, 150, 400, 1000, 2400, 6000, 15000];
    this.eqFilters = frequencies.map(f => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = f;
      filter.gain.value = 0;
      return filter;
    });

    this.tremoloNode.connect(this.eqFilters[0]);
    this.tremoloNode.connect(this.chorusDelay);
    this.chorusDelay.connect(this.chorusMix);
    this.tremoloNode.connect(this.phaserChain[0]);

    for (let i = 0; i < this.eqFilters.length - 1; i++) {
      this.eqFilters[i].connect(this.eqFilters[i + 1]);
    }
    const eqOutput = this.eqFilters[this.eqFilters.length - 1];

    this.busGain = this.audioContext.createGain();
    eqOutput.connect(this.busGain);
    this.chorusMix.connect(this.busGain);
    if (lastPhaserNode) lastPhaserNode.connect(this.phaserMix);
    this.phaserMix.connect(this.busGain);

    this.delayNode = this.audioContext.createDelay(5.0);
    this.delayFeedback = this.audioContext.createGain();
    this.delayWet = this.audioContext.createGain();
    this.delayWet.gain.value = 0; 
    this.delayAmountGain = this.audioContext.createGain();
    
    this.delayLpf = this.audioContext.createBiquadFilter();
    this.delayLpf.type = 'lowpass';
    this.delayHpf = this.audioContext.createBiquadFilter();
    this.delayHpf.type = 'highpass';

    this.busGain.connect(this.delayAmountGain);
    this.delayAmountGain.connect(this.delayHpf);
    this.delayHpf.connect(this.delayLpf);
    this.delayLpf.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayWet);

    this.reverbNode = this.audioContext.createConvolver();
    this.reverbWet = this.audioContext.createGain();
    this.reverbWet.gain.value = 0; 
    this.reverbLpf = this.audioContext.createBiquadFilter();
    this.reverbLpf.type = 'lowpass';
    this.reverbHpf = this.audioContext.createBiquadFilter();
    this.reverbHpf.type = 'highpass';

    this.busGain.connect(this.reverbHpf);
    this.reverbHpf.connect(this.reverbLpf);
    this.reverbLpf.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbWet);

    this.regenerateReverb();

    this.fxReturnGain = this.audioContext.createGain();
    this.delayWet.connect(this.fxReturnGain);
    this.reverbWet.connect(this.fxReturnGain);

    this.widthGain = this.audioContext.createGain(); 

    const preLimiterNode = this.audioContext.createGain();
    this.busGain.connect(preLimiterNode);
    this.fxReturnGain.connect(preLimiterNode);

    this.limiterNode = this.audioContext.createDynamicsCompressor();
    this.limiterNode.threshold.value = -10;
    preLimiterNode.connect(this.limiterNode);

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.8;
    this.limiterNode.connect(this.masterGain);
    
    this.masterAnalyserNode = this.audioContext.createAnalyser();
    this.masterGain.connect(this.masterAnalyserNode);
    this.fxAnalyserNode = this.audioContext.createAnalyser();
    this.fxReturnGain.connect(this.fxAnalyserNode);
    this.levelDataArray = new Uint8Array(this.masterAnalyserNode.frequencyBinCount);

    this.startScheduler();
  }
  
  public setInputGain(val: number) { 
      this.preGain.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.05);
  }
  public setLowCut(val: number) { 
      const freq = 20 + (val * 480);
      this.lowCutNode.frequency.setTargetAtTime(freq, this.audioContext.currentTime, 0.05);
  }
  public setHighCut(val: number) { 
      const minLog = Math.log(1000);
      const maxLog = Math.log(20000);
      const freq = Math.exp(maxLog - val * (maxLog - minLog));
      this.highCutNode.frequency.setTargetAtTime(freq, this.audioContext.currentTime, 0.05);
  }
  public setTubeDrive(amount: number) { 
      const k = amount * 100;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      }
      this.tubeDriveNode.curve = curve;
      this.tubeGain.gain.setTargetAtTime(1 - (amount * 0.3), this.audioContext.currentTime, 0.05);
  }
  public setSaturation(amount: number) { 
      const k = amount * 10;
      const n_samples = 2048;
      const curve = new Float32Array(n_samples);
      for (let i = 0; i < n_samples; ++i) {
          const x = i * 2 / n_samples - 1;
          curve[i] = Math.tanh(k * x) / Math.tanh(k);
      }
      this.satNode.curve = curve;
  }
  public setTremolo(amount: number) { 
      this.tremoloDepth.gain.setTargetAtTime(amount, this.audioContext.currentTime, 0.05);
  }
  public setChorus(amount: number) { 
      this.chorusDepth.gain.setTargetAtTime(amount * 0.002, this.audioContext.currentTime, 0.05);
      this.chorusMix.gain.setTargetAtTime(amount, this.audioContext.currentTime, 0.05);
  }
  public setPhaser(amount: number) { 
      this.phaserDepth.gain.setTargetAtTime(amount * 1000, this.audioContext.currentTime, 0.05);
      this.phaserMix.gain.setTargetAtTime(amount, this.audioContext.currentTime, 0.05);
  }
  public setCompressor(ratioNorm: number) {
      this.limiterNode.ratio.setTargetAtTime(1 + (ratioNorm * 19), this.audioContext.currentTime, 0.05);
      this.limiterNode.threshold.setTargetAtTime(-10 - (ratioNorm * 20), this.audioContext.currentTime, 0.05);
  }
  
  public getLevels() {
      this.masterAnalyserNode.getByteTimeDomainData(this.levelDataArray);
      let sum = 0;
      for (let i = 0; i < this.levelDataArray.length; i++) {
        const v = (this.levelDataArray[i] - 128) / 128;
        sum += v * v;
      }
      const masterRms = Math.sqrt(sum / this.levelDataArray.length) * 5;

      this.fxAnalyserNode.getByteTimeDomainData(this.levelDataArray);
      sum = 0;
      for (let i = 0; i < this.levelDataArray.length; i++) {
        const v = (this.levelDataArray[i] - 128) / 128;
        sum += v * v;
      }
      const fxRms = Math.sqrt(sum / this.levelDataArray.length) * 5;

      return { master: Math.min(1, masterRms), fx: Math.min(1, fxRms) };
  }

  private handleFatalError(e: any, source: string) {
    console.error(`[Fatal Error - ${source}]`, e);
    this.isUserInitiatedStop = true; 
    this.cleanupSession();
    this.toggleLoop(false);
    if (this.isRecording) {
        try { this.stopRecording(); } catch(err) {}
    }
    this.nextStartTime = 0;
    const msg = this.getErrorMessage(e);
    this.dispatchEvent(new CustomEvent('error', { detail: `${msg}` }));
    this.setPlaybackState('stopped');
  }

  public async decodeAudioFile(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
      return await this.audioContext.decodeAudioData(arrayBuffer);
  }
  
  public playBuffer(buffer: AudioBuffer, speed: number, pitch: number) {
      this.stop(); 
      this.playbackMode = 'file';
      this.fileBuffer = buffer;
      this.fileSpeed = speed; 
      this.filePitch = pitch; 
      this.play();
  }
  
  public updateFileParams(speed: number, pitch: number) {
      this.fileSpeed = speed;
      this.filePitch = pitch;
      // Send to phase vocoder worklet if active
      if (this.pvNode) {
          this.pvNode.port.postMessage({ type: 'params', speed, pitchST: pitch });
          return;
      }
      // Fallback: compensate detune so time and pitch remain independent
      // playbackRate controls duration; detune corrects the resulting pitch
      if (this.fileSource && (this.playbackState === 'playing' || this.playbackState === 'loading')) {
          try {
             const compensatedDetune = (pitch - 12 * Math.log2(speed)) * 100;
             this.fileSource.playbackRate.setTargetAtTime(speed, this.audioContext.currentTime, 0.02);
             this.fileSource.detune.setTargetAtTime(compensatedDetune, this.audioContext.currentTime, 0.02);
          } catch(e) {}
      }
  }
  
  private async playFile() {
      if (!this.fileBuffer) return;
      // Stop any previous playback
      this._stopFileNodes();

      // Wait for worklet, then try phase vocoder path
      try {
          await this.workletReady;
          this.pvNode = new AudioWorkletNode(this.audioContext, 'phase-vocoder-processor', {
              numberOfInputs: 0,
              numberOfOutputs: 1,
              outputChannelCount: [2],
          });
          this.pvNode.connect(this.inputGain);

          // Transfer channel data as transferable
          const numCh = this.fileBuffer.numberOfChannels;
          const channels: Float32Array[] = [];
          for (let c = 0; c < numCh; c++) {
              const copy = new Float32Array(this.fileBuffer.getChannelData(c));
              channels.push(copy);
          }
          const transfers = channels.map(c => c.buffer);
          this.pvNode.port.postMessage(
              { type: 'load', channels, length: this.fileBuffer.length },
              transfers
          );
          this.pvNode.port.postMessage({ type: 'params', speed: this.fileSpeed, pitchST: this.filePitch });
          this.setPlaybackState('playing');
      } catch {
          // Worklet unavailable — fall back to AudioBufferSourceNode with detune compensation
          this.pvNode = null;
          this.fileSource = this.audioContext.createBufferSource();
          this.fileSource.buffer = this.fileBuffer;
          this.fileSource.loop = true;
          const compensatedDetune = (this.filePitch - 12 * Math.log2(this.fileSpeed)) * 100;
          this.fileSource.playbackRate.value = this.fileSpeed;
          this.fileSource.detune.value = compensatedDetune;
          this.fileSource.connect(this.inputGain);
          this.fileSource.start();
          this.setPlaybackState('playing');
      }
  }

  private _stopFileNodes() {
      if (this.pvNode) {
          try { this.pvNode.port.postMessage({ type: 'stop' }); this.pvNode.disconnect(); } catch(e) {}
          this.pvNode = null;
      }
      if (this.fileSource) {
          try { this.fileSource.stop(); this.fileSource.disconnect(); } catch(e) {}
          this.fileSource = null;
      }
  }
  
  public async renderOffline(buffer: AudioBuffer, speed: number, pitch: number): Promise<ArrayBuffer> {
      const outputLength = Math.ceil(buffer.length / speed);
      const offlineCtx = new OfflineAudioContext(2, outputLength, 48000);
      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;
      // playbackRate sets duration; detune is compensated so pitch is independent
      source.playbackRate.value = speed;
      source.detune.value = (pitch - 12 * Math.log2(speed)) * 100;
      source.connect(offlineCtx.destination);
      source.start();
      const renderedBuffer = await offlineCtx.startRendering();
      return audioBufferToWav(renderedBuffer);
  }

  public set bpm(value: number) {
    this._bpm = value;
    this.updateContext();
    this.recalcDelayTime();
  }
  public get bpm() { return this._bpm; }

  public setContext(bpm: number, description: string) {
    this._bpm = bpm;
    this.currentContextPrompt = `Tempo: ${bpm} BPM. Style: ${description}. ${NEGATIVE_PROMPTS}`;
    if (this.playbackState === 'playing' && this.playbackMode === 'ai') {
        this.setWeightedPrompts(this.prompts);
    }
    this.recalcDelayTime();
  }

  private updateContext() {
      const match = this.currentContextPrompt.match(/Tempo: \d+ BPM/);
      if (match) {
          this.currentContextPrompt = this.currentContextPrompt.replace(/Tempo: \d+ BPM/, `Tempo: ${this._bpm} BPM`);
          if (this.playbackState === 'playing' && this.playbackMode === 'ai') {
              this.setWeightedPrompts(this.prompts);
          }
      }
  }

  private startScheduler() {
    const check = () => {
      this.schedulerRafId = requestAnimationFrame(check);
      if (this.isRecording && (Date.now() - this.recordStartTime) / 1000 >= this.maxRecordTime) {
          this.stopRecording();
      }
      if (this.playbackState !== 'playing' || this.isLooping) return;
      const currentTime = this.audioContext.currentTime;
      const secondsPerBeat = 60 / this.bpm;
      const secondsPerBar = secondsPerBeat * 4;
      const elapsedTime = currentTime - this.playbackStartTime;
      const currentBar = Math.floor(elapsedTime / secondsPerBar);
      if (currentBar > this.lastQuantizationBar) {
        this.lastQuantizationBar = currentBar;
        if (currentBar % this.quantizationBars === 0 && this.pendingPrompts) {
             this.applyPromptsInternal(this.pendingPrompts);
             this.pendingPrompts = null;
        }
      }
    };
    check();
  }

  public startRecording() {
    if (this.isRecording) return;
    try {
        this.isRecording = true;
        this.recordedChunks = [];
        this.recordStartTime = Date.now();
        this.recorderNode = this.audioContext.createScriptProcessor(4096, 2, 2);
        this.recorderNode.onaudioprocess = (e) => {
            if (!this.isRecording || this.playbackState !== 'playing') return;
            const inputL = e.inputBuffer.getChannelData(0);
            const inputR = e.inputBuffer.getChannelData(1);
            const interleaved = new Float32Array(inputL.length + inputR.length);
            for(let i=0; i < inputL.length; i++) {
                interleaved[i*2] = inputL[i];
                interleaved[i*2+1] = inputR[i];
            }
            this.recordedChunks.push(interleaved);
            let sum = 0;
            for (let i = 0; i < inputL.length; i++) sum += Math.abs(inputL[i]);
            this.dispatchEvent(new CustomEvent('recording-data', { detail: sum / inputL.length }));
        };
        this.masterGain.connect(this.recorderNode);
        this.recorderNode.connect(this.audioContext.destination);
    } catch (e) {
        this.handleFatalError(e, "Start Recording");
    }
  }

  public stopRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;
    if (this.recorderNode) {
        try { this.recorderNode.disconnect(); } catch (e) {}
        this.recorderNode = null;
    }
    if (this.recordedChunks.length === 0) return;
    try {
        const totalLength = this.recordedChunks.reduce((acc, c) => acc + c.length, 0);
        const result = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of this.recordedChunks) { result.set(chunk, offset); offset += chunk.length; }
        const buffer = this.audioContext.createBuffer(2, totalLength / 2, this.audioContext.sampleRate);
        const l = buffer.getChannelData(0); const r = buffer.getChannelData(1);
        for (let i = 0; i < buffer.length; i++) { l[i] = result[i*2]; r[i] = result[i*2+1]; }
        this.dispatchEvent(new CustomEvent('recording-finished', { detail: buffer }));
    } catch (e) {}
  }


  public async toggleLoop(active: boolean) {
    if (active) {
        if (this.isLooping) return;
        try {
            const secondsPerBeat = 60 / this.bpm;
            const duration = secondsPerBeat * 4 * 8; 
            const buffer = await this.createBufferFromHistory(duration);
            if (!buffer) return;
            this.loopSource = this.audioContext.createBufferSource();
            this.loopSource.buffer = buffer;
            this.loopSource.loop = true;
            this.loopSource.connect(this.loopGain);
            this.loopSource.start();
            this.loopGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.loopGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.05);
            this.inputGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
            this.isLooping = true;
        } catch (e) {}
    } else {
        if (!this.isLooping) return;
        try {
            this.inputGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.1);
            this.loopGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
            setTimeout(() => { if (this.loopSource) { this.loopSource.stop(); this.loopSource.disconnect(); this.loopSource = null; } }, 150);
            this.isLooping = false;
        } catch (e) {}
    }
  }
  
  private async createBufferFromHistory(durationSeconds: number): Promise<AudioBuffer | null> {
    if (this.rollingBuffer.length === 0) return null;
    const neededSamples = Math.ceil(durationSeconds * 48000);
    let totalSamples = 0;
    for(const chunk of this.rollingBuffer) totalSamples += chunk.length;
    if (totalSamples < neededSamples || neededSamples <= 0) return null; 
    const output = this.audioContext.createBuffer(2, neededSamples, 48000);
    const left = output.getChannelData(0); const right = output.getChannelData(1);
    let filled = 0;
    for (let i = this.rollingBuffer.length - 1; i >= 0; i--) {
        const chunk = this.rollingBuffer[i]; const samplesInChunk = chunk.length / 2;
        const take = Math.min(samplesInChunk, neededSamples - filled);
        for (let s = 0; s < take; s++) {
             const srcIdx = (samplesInChunk - 1 - s) * 2; const dstIdx = neededSamples - 1 - filled - s;
             left[dstIdx] = chunk[srcIdx]; right[dstIdx] = chunk[srcIdx + 1];
        }
        filled += take; if (filled >= neededSamples) break;
    }
    return output;
  }

  public setBusVolume(val: number) { this.busGain.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.05); }
  public setEqBands(gains: number[]) {
      if (gains.length !== this.eqFilters.length) return;
      for(let i=0; i < this.eqFilters.length; i++) this.eqFilters[i].gain.setTargetAtTime(gains[i], this.audioContext.currentTime, 0.05);
  }
  public setFxReturnVolume(val: number) { this.fxReturnGain.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.05); }
  public setLimiterThreshold(val: number) { this.limiterNode.threshold.setTargetAtTime(-60 + (val * 60), this.audioContext.currentTime, 0.05); }
  public setReverbType(type: string) { this.currentReverbType = type; this.regenerateReverb(); }
  public setReverbSize(val: number) { this.currentReverbSize = val; this.regenerateReverb(); }
  public setReverbIntensity(val: number) { this.currentReverbIntensity = val; this.regenerateReverb(); }
  public setReverbMix(val: number) { this.reverbWet.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.05); }
  public setReverbFilters(lpfNorm: number, hpfNorm: number) { 
      const minLog = Math.log(20); const maxLog = Math.log(20000);
      this.reverbLpf.frequency.setTargetAtTime(Math.exp(minLog + (maxLog - minLog) * lpfNorm), this.audioContext.currentTime, 0.05);
      this.reverbHpf.frequency.setTargetAtTime(Math.exp(minLog + (maxLog - minLog) * hpfNorm), this.audioContext.currentTime, 0.05);
  }

  private regenerateReverb() {
    try {
        let baseDuration = 2.0; let baseDecay = 2.0;
        switch(this.currentReverbType) {
            case 'Room': baseDuration = 0.8; baseDecay = 4.0; break;
            case 'Hall': baseDuration = 2.5; baseDecay = 2.0; break;
            case 'Plate': baseDuration = 1.5; baseDecay = 3.0; break;
            case 'Cathedral': baseDuration = 4.0; baseDecay = 1.5; break;
        }
        const duration = baseDuration * (0.5 + (this.currentReverbSize * 1.5));
        const decay = baseDecay * (1.5 - this.currentReverbIntensity); 
        const rate = this.audioContext.sampleRate; const length = rate * duration;
        const impulse = this.audioContext.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0); const right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
            const env = Math.pow(1 - i / length, decay);
            left[i] = (Math.random() * 2 - 1) * env; right[i] = (Math.random() * 2 - 1) * env;
        }
        this.reverbNode.buffer = impulse;
    } catch(e) {}
  }

  public setDelayMix(val: number) { this.delayWet.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.05); }
  public setDelayFeedback(val: number) { this.delayFeedback.gain.setTargetAtTime(val * 0.9, this.audioContext.currentTime, 0.05); }
  public setDelayAmount(val: number) { this.delayAmountGain.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.05); }
  public setDelayFilters(lpfNorm: number, hpfNorm: number) {
      const minLog = Math.log(20); const maxLog = Math.log(20000);
      this.delayLpf.frequency.setTargetAtTime(Math.exp(minLog + (maxLog - minLog) * lpfNorm), this.audioContext.currentTime, 0.05);
      this.delayHpf.frequency.setTargetAtTime(Math.exp(minLog + (maxLog - minLog) * hpfNorm), this.audioContext.currentTime, 0.05);
  }
  public setDelayNote(note: string) { this.currentDelayNote = note; this.recalcDelayTime(); }
  private recalcDelayTime() {
      let time = 60 / this.bpm;
      if (this.currentDelayNote === '1/2') time *= 2;
      else if (this.currentDelayNote === '1/8') time /= 2;
      else if (this.currentDelayNote === '1/16') time /= 4;
      this.delayNode.delayTime.setTargetAtTime(time, this.audioContext.currentTime, 0.05);
  }
  public setStereoWidth(val: number) {}
  public setMasterVolume(val: number) { this.masterGain.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.05); }

  private getSession(): Promise<any> {
    this.isUserInitiatedStop = false; 
    if (!this.sessionPromise) { this.sessionPromise = this.connectWithRetry(); }
    return this.sessionPromise;
  }

  private getErrorMessage(err: any): string {
      if (err instanceof Error) return err.message;
      return String(err);
  }

  private async connectWithRetry(retries = 3): Promise<any> {
      let lastError;
      for (let i = 0; i < retries; i++) {
          try { return await this.connect(); } catch (e) {
              lastError = e;
              const msg = this.getErrorMessage(e);
              if (msg.includes('403') || msg.includes('404')) throw e;
              await new Promise(r => setTimeout(r, 1000));
          }
      }
      throw lastError;
  }

  private async connect(): Promise<any> {
    const session = await (this.ai.live as any).connect({
        model: this.model,
        config: { responseModalities: ['AUDIO'] },
        callbacks: {
            onmessage: async (e: any) => {
                if (e.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
                    await this.processAudioChunks([{ data: e.serverContent.modelTurn.parts[0].inlineData.data }]);
                }
            },
            onerror: (err: any) => { if (!this.isUserInitiatedStop) this.handleFatalError(err, 'LiveAPI Callback'); },
            onclose: (e: any) => { if (!this.isUserInitiatedStop && e.code !== 1000) this.handleFatalError(e, 'LiveAPI Close'); }
        }
    });
    return session;
  }
  
  private cleanupSession() {
      if (this.session) { try { this.session.close(); } catch(e) {} }
      this.session = null; this.sessionPromise = null;
  }

  private setPlaybackState(state: PlaybackState) {
    this.playbackState = state;
    this.dispatchEvent(new CustomEvent('playback-state-changed', { detail: state }));
  }

  private async processAudioChunks(audioChunks: any[]) {
    if (this.playbackState === 'paused' || this.playbackState === 'stopped') return;
    try {
        const audioBuffer = await decodeAudioData(decode(audioChunks[0].data!), this.audioContext, 48000, 2);
        const channelData = new Float32Array(audioBuffer.length * 2);
        const l = audioBuffer.getChannelData(0); const r = audioBuffer.getChannelData(1);
        for (let i = 0; i < audioBuffer.length; i++) { channelData[i*2] = l[i]; channelData[i*2+1] = r[i]; }
        this.rollingBuffer.push(channelData);
        if (this.nextStartTime === 0) {
          this.nextStartTime = this.audioContext.currentTime + this.bufferTime;
          this.playbackStartTime = this.nextStartTime; this.lastQuantizationBar = -1;
          setTimeout(() => { this.setPlaybackState('playing'); }, this.bufferTime * 1000);
        }
        if (this.nextStartTime < this.audioContext.currentTime) { this.setPlaybackState('loading'); this.nextStartTime = 0; return; }
        const source = this.audioContext.createBufferSource(); source.buffer = audioBuffer; source.connect(this.inputGain);
        source.start(this.nextStartTime); this.nextStartTime += audioBuffer.duration;
    } catch (e) {}
  }

  private readonly applyPromptsInternal = throttle(async (prompts: Map<string, Prompt>) => {
    if (this.playbackMode !== 'ai' || !this.session) return;
    const finalPrompts = Array.from(prompts.values()).filter(p => !this.filteredPrompts.has(p.text) && p.weight > 0).map(p => ({ text: p.text, weight: p.weight }));
    if (this.currentContextPrompt) finalPrompts.push({ text: this.currentContextPrompt, weight: 1.0 });
    try { await this.session.send({ realtimeInput: { weightedPrompts: finalPrompts } }); } catch (e) {}
  }, 200);

  public setWeightedPrompts(prompts: Map<string, Prompt>) {
    this.prompts = prompts;
    if (this.playbackMode === 'ai') {
        this.pendingPrompts = prompts;
        if (this.playbackState !== 'playing') { this.applyPromptsInternal(prompts); this.pendingPrompts = null; }
    }
  }

  public async play() {
    if (this.disconnectTimeout) { clearTimeout(this.disconnectTimeout); this.disconnectTimeout = null; }
    try {
        if (this.audioContext.state === 'suspended') await this.audioContext.resume();
        if (this.playbackMode === 'file') {
            await this.playFile();
            this.masterGain.connect(this.audioContext.destination);
            if (this.extraDestination) this.masterGain.connect(this.extraDestination);
            return;
        }
        this.setPlaybackState('loading'); this.rollingBuffer = []; this.reconnectAttempts = 0;
        this.session = await this.getSession();
        this.applyPromptsInternal(this.prompts);
        this.masterGain.connect(this.audioContext.destination);
        if (this.extraDestination) this.masterGain.connect(this.extraDestination);
    } catch (e) { this.handleFatalError(e, "Play Initialization"); }
  }

  public stop() {
    this.isUserInitiatedStop = true; 
    if (this.playbackMode === 'ai') this.cleanupSession();
    else this._stopFileNodes();
    this.toggleLoop(false); this.stopRecording();
    this.nextStartTime = 0; this.setPlaybackState('stopped'); 
    if (this.disconnectTimeout) clearTimeout(this.disconnectTimeout);
    this.disconnectTimeout = setTimeout(() => { try { this.masterGain.disconnect(); } catch(e) {} this.disconnectTimeout = null; }, 150);
  }

  public async playPause() {
    if (this.playbackState === 'playing') this.stop();
    else this.play();
  }
}
