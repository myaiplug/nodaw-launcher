








/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import './PromptController';
import './ControlsBar';
import './EqDrawer';
import './FxDrawer'; 
import './MasterDrawer';
import './MixDrawer';
import './RecorderDrawer'; 
import './GenreDrawer';
import './ThemeToggle';
import './VerticalFader';
import './SettingsModal';
import './AudioEditorModal';
import './DownloadModal';
import './CodeineProcessor'; // New
import './ProcessingModal'; // New

import type { PlaybackState, Prompt, ControlChange } from '../types';
import { MidiDispatcher } from '../utils/MidiDispatcher';
import { AudioAnalyser } from '../utils/AudioAnalyser';
import { LiveMusicHelper } from '../utils/LiveMusicHelper';
import { REGION_PRESETS } from '../utils/presets';
import { RecorderDrawer } from './RecorderDrawer';

interface MidiMapping {
    action: string;
    cc: number;
    channel: number;
}

/** The rack of prompt inputs. */
@customElement('prompt-dj-midi')
export class PromptDjMidi extends LitElement {
  static styles = css`
    :host {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start; 
      align-items: center;
      box-sizing: border-box;
      position: relative;
      /* Background is handled by body for full immersion */
      background: transparent; 
      color: var(--text-main);
      overflow: hidden; /* Prevent scroll */
    }
    
    .layout-wrapper {
      position: relative;
      display: inline-flex;
      justify-content: center;
      /* Shift entire container down more to accommodate recorder drawer + changes */
      margin-top: calc(10vmin + 15px); 
      transition: all 0.3s ease;
    }
    
    /* Hide side drawers when mixer is flipped */
    .layout-wrapper.mixer-open eq-drawer,
    .layout-wrapper.mixer-open fx-drawer,
    .layout-wrapper.mixer-open genre-drawer {
       opacity: 0;
       pointer-events: none;
       transition: opacity 0.3s ease;
    }
    
    /* WIDE MODE TRANSFORMS */
    .layout-wrapper.wide-mode {
        width: 120%; /* 20% Wider logic handled by flex children scaling */
    }
    
    eq-drawer { z-index: 5; }
    fx-drawer { z-index: 4; }
    genre-drawer { z-index: 5; }
    recorder-drawer { z-index: 5; } 
    
    .perspective-container {
      perspective: 2000px;
      z-index: 10; 
      transition: width 0.3s ease;
    }
    
    .flipper {
      position: relative;
      transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transform-style: preserve-3d;
      transform-origin: center;
    }
    .flipper.flipped { transform: rotateY(180deg); }

    .face {
      backface-visibility: hidden;
      border-radius: 1vmin;
      box-shadow: 
        inset 0 0 50px rgba(0,0,0,0.1),
        0 0 0 2px var(--border-dark),
        var(--shadow-rack);
      width: fit-content;
      min-width: 60vmin; 
      transition: min-width 0.3s ease;
    }
    
    /* Wide Mode Face */
    .wide-mode .face {
        min-width: 72vmin; /* 20% wider than 60 */
        font-size: 1.1em; /* Larger text/scale */
    }

    /* FRONT: The Rack */
    #rack-container {
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 1.5vmin;
      /* Reduced padding: removed bottom large padding, reduced top to practically zero */
      padding: 1.5vmin 3vmin;
      padding-top: 0.4vmin; 
      background: var(--bg-rack);
      transform: rotateY(0deg);
      position: relative;
    }

    /* BACK: The Mixer */
    #mixer-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      /* Use theme variables */
      background: var(--bg-rack);
      display: flex;
      flex-direction: column;
      padding: 1.5vmin 3vmin;
      padding-top: 0.8vmin; 
      box-sizing: border-box;
      transform: rotateY(180deg);
      border: 3px solid var(--border-main);
      border-radius: 1vmin;
    }
    
    .mixer-board {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      justify-content: center; 
      flex-grow: 1;
      padding: 2vmin;
      gap: 3vmin;
      background: var(--bg-controls);
      box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
      border-radius: 4px 4px 0 0;
      margin-bottom: 2vmin;
      border: 1px solid var(--border-dark);
    }
    
    .mixer-channel {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-end;
      width: 10vmin;
      min-width: 80px; 
      position: relative;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 4px;
      padding-bottom: 10px;
    }
    
    .channel-label {
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 1.3vmin; /* Increased size */
      color: var(--text-dim);
      margin-bottom: 1.5vmin;
      width: 100%;
      text-align: center;
      border-bottom: 1px solid var(--border-dark);
      padding: 8px 0;
      background: rgba(0,0,0,0.1);
      font-weight: bold;
      letter-spacing: 0.05em;
    }

    controls-bar {
      width: calc(100% + 6vmin); 
      margin-left: -3vmin; 
      /* Moved to bottom */
    }

    .rack-unit {
      display: flex;
      flex-direction: row;
      gap: 2vmin;
      padding: 2vmin 3vmin;
      background: var(--bg-rack-unit);
      border-top: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-dark);
      border-radius: 0.5vmin;
      box-shadow: 
        var(--shadow-unit),
        var(--shadow-inset);
      position: relative;
      align-items: center;
    }

    .rack-unit::before, .rack-unit::after {
      content: '';
      position: absolute;
      width: 1.2vmin;
      height: 1.2vmin;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, var(--border-light), var(--border-dark));
      box-shadow: 
        inset 0 1px 2px rgba(0,0,0,0.5),
        0 1px 0 rgba(255,255,255,0.5);
      top: 50%;
      transform: translateY(-50%);
    }
    .rack-unit::before { left: 1vmin; }
    .rack-unit::after { right: 1vmin; }

    prompt-controller {
      width: 13vmin;
    }
    
    .sticker-logo {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5vmin 0;
        margin-top: -0.5vmin;
        margin-bottom: -0.5vmin;
    }
    
    .sticker-logo svg {
        height: 2vmin;
        width: auto;
    }

    /* PROCESSOR OVERLAY */
    .processor-wrapper {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: #050505;
        z-index: 6000;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: opacity 0.5s;
    }
    .processor-wrapper.hidden {
        opacity: 0;
        pointer-events: none;
    }
  `;

  private prompts: Map<string, Prompt>;
  private midiDispatcher: MidiDispatcher;

  @property({ type: Boolean }) private showMidi = false;
  @property({ type: String }) public playbackState: PlaybackState = 'stopped';
  @state() public audioLevel = 0;
  @state() private midiInputIds: string[] = [];
  @state() private activeMidiInputId: string | null = null;
  @state() private currentRegion: string = 'Atlanta';
  @state() private mixerOpen = false;
  @state() private currentBpm = 140; 
  
  // Customization State
  @state() private currentTheme = '';
  @state() private currentKnobStyle = 'metallic';
  @state() private settingsOpen = false;
  @state() private wideMode = false;
  
  // Editor & Download State
  @state() private editorOpen = false;
  @state() private editorBuffer: AudioBuffer | null = null;
  
  @state() private downloadModalOpen = false;
  @state() private pendingDownloadUrl = '';
  
  // Mixer State
  @state() private masterVol = 0.8;
  @state() private busVol = 1.0;
  @state() private fxMix = 1.0;
  @state() private limiterThresh = 0.8; 
  
  // Real-time Metering State
  @state() private masterLevel = 0;
  @state() private fxLevel = 0;

  @state() private learnMode = false;
  @state() private waitingForMidi: string | null = null; 
  private midiMappings = new Map<string, MidiMapping>();
  
  // Codeine Processor State
  @state() private appMode: 'processor' | 'rack' = 'processor';
  @state() private processModalOpen = false;
  @state() private processingComplete = false;
  @state() private processedBuffer: AudioBuffer | null = null;
  @state() private processorPreviewBuffer: AudioBuffer | null = null; // New for preview
  
  @property({ attribute: false }) public audioAnalyser?: AudioAnalyser;
  @property({ attribute: false }) public onEqChange?: (gains: number[]) => void;
  @property({ attribute: false }) public liveMusicHelper?: LiveMusicHelper;
  
  private meterRafId = 0;

  @property({ type: Object })
  private filteredPrompts = new Set<string>();

  private tempAudioFile: File | null = null;
  private tempParams = { speed: 1, pitch: 0 };

  constructor(
    initialPrompts: Map<string, Prompt>,
  ) {
    super();
    this.prompts = initialPrompts;
    this.midiDispatcher = new MidiDispatcher();
    this.midiDispatcher.addEventListener('cc-message', this.handleMidiMessage.bind(this));
  }

  firstUpdated() {
      // Don't set context for generation since we are in processor mode
      this.startMeterLoop();
      // Initially, labels might be default or whatever, but when entering rack mode they update
  }
  
  updateRackLabels() {
      const p = new Map(this.prompts);
      // Row 1: Pre/Color
      const row1 = ["PRE GAIN", "LOW CUT", "HIGH CUT", "TUBE DRV", "SATURATE"];
      // Row 2: Modulation
      const row2 = ["CHORUS", "FLANGER", "PHASER", "TREMOLO", "PAN"]; // Pan is simpler vibrato
      // Row 3: Dynamics
      const row3 = ["COMPRESS", "LIMITER", "HARMONY", "DYNAMICS", "WIDTH"];
      
      const allLabels = [...row1, ...row2, ...row3];
      
      for(let i=0; i<15; i++) {
          const id = `prompt-${i}`;
          if (p.has(id)) {
              const item = p.get(id)!;
              item.text = allLabels[i] || "FX";
              // Reset visual weights to 0 for a clean slate if needed, or keep them
              // item.weight = 0; 
              p.set(id, item);
          }
      }
      this.prompts = p;
      (this as any).requestUpdate();
  }
  
  disconnectedCallback() {
      super.disconnectedCallback();
      cancelAnimationFrame(this.meterRafId);
  }
  
  private startMeterLoop() {
      const loop = () => {
          this.meterRafId = requestAnimationFrame(loop);
          if (this.liveMusicHelper) { // Always update meters if helper exists
              const levels = this.liveMusicHelper.getLevels();
              this.masterLevel = levels.master;
              this.fxLevel = levels.fx;
              (this as any).requestUpdate(); 
          }
      };
      loop();
  }

  updated(changedProps: Map<string, unknown>) {
      if (changedProps.has('currentTheme')) {
          const oldTheme = changedProps.get('currentTheme') as string;
          if (oldTheme) document.body.classList.remove(oldTheme);
          if (this.currentTheme) document.body.classList.add(this.currentTheme);
      }
  }

  private handleMidiMessage(e: Event) {
    const customEvent = e as CustomEvent<ControlChange>;
    const { channel, cc, value } = customEvent.detail;
    
    if (this.learnMode && this.waitingForMidi) {
        this.midiMappings.set(this.waitingForMidi, { action: this.waitingForMidi, cc, channel });
        this.waitingForMidi = null;
        (this as any).requestUpdate();
        return;
    }

    for (const [action, mapping] of this.midiMappings.entries()) {
        if (mapping.cc === cc) { 
            this.executeAction(action, value);
        }
    }
  }

  private executeAction(action: string, value: number) {
     if (!this.liveMusicHelper) return;
     const norm = value / 127;
     
     if (action === 'play' && value > 64) this.playPause();
     else if (action === 'stop' && value > 64) this.stop();
     else if (action === 'record' && value > 64) this.toggleRecord();
     else if (action === 'loop' && value > 64) {
         const bar = (this as unknown as HTMLElement).shadowRoot?.querySelector('controls-bar') as any;
         if (bar) bar.clickLoop();
     } 
     else if (action === 'master') {
         this.masterVol = norm;
         this.liveMusicHelper.setMasterVolume(norm);
         const drawer = (this as unknown as HTMLElement).shadowRoot?.querySelector('master-drawer') as any;
         if (drawer) drawer.masterVol = norm;
     } 
  }

  private handlePromptChanged(e: CustomEvent<Prompt>) {
    const { promptId, text, weight, cc, muted, pan } = e.detail;
    
    // Update visual state
    const prompt = this.prompts.get(promptId);
    if (prompt) {
        prompt.weight = weight;
        const newPrompts = new Map(this.prompts);
        newPrompts.set(promptId, prompt);
        this.prompts = newPrompts;
        (this as any).requestUpdate();
    }

    // In Processor/Rack Mode, we map knobs to FX directly
    if (this.appMode === 'rack' && this.liveMusicHelper) {
        const index = parseInt(promptId.replace('prompt-', ''));
        const val = weight / 2; // Normalize 0-2 range to 0-1
        
        switch(index) {
            // Row 1
            case 0: this.liveMusicHelper.setInputGain(val * 2); break; // 0-2
            case 1: this.liveMusicHelper.setLowCut(val); break;
            case 2: this.liveMusicHelper.setHighCut(val); break;
            case 3: this.liveMusicHelper.setTubeDrive(val); break;
            case 4: this.liveMusicHelper.setSaturation(val); break;
            // Row 2
            case 5: this.liveMusicHelper.setChorus(val); break;
            case 6: /* Flanger not impl yet, maybe reuse chorus with high feedback? */ break;
            case 7: this.liveMusicHelper.setPhaser(val); break;
            case 8: this.liveMusicHelper.setTremolo(val); break;
            case 9: /* Pan */ break; 
            // Row 3
            case 10: this.liveMusicHelper.setCompressor(val); break;
            case 11: this.liveMusicHelper.setLimiterThreshold(val); break;
            // 12-14 handled elsewhere or placeholders
        }
    }
  }

  private handleMasterMixer(e: CustomEvent) {
      this.masterVol = e.detail;
      this.liveMusicHelper?.setMasterVolume(this.masterVol);
      (this as any).requestUpdate();
  }
  private handleBusMixer(e: CustomEvent) {
      this.busVol = e.detail;
      this.liveMusicHelper?.setBusVolume(this.busVol);
      (this as any).requestUpdate();
  }
  private handleFxMixer(e: CustomEvent) {
      this.fxMix = e.detail;
      this.liveMusicHelper?.setFxReturnVolume(this.fxMix);
      (this as any).requestUpdate();
  }
  private handleLimiterMixer(e: CustomEvent) {
      this.limiterThresh = e.detail;
      this.liveMusicHelper?.setLimiterThreshold(this.limiterThresh);
      (this as any).requestUpdate();
  }

  public async setShowMidi(show: boolean) {
    this.showMidi = show;
    if (!this.showMidi) return;
    try {
      const inputIds = await this.midiDispatcher.getMidiAccess();
      this.midiInputIds = inputIds;
      if (this.midiInputIds.length > 0 && !this.activeMidiInputId) {
          this.activeMidiInputId = this.midiDispatcher.activeMidiInputId;
      }
    } catch (e) {
      this.showMidi = false;
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('error', {detail: e.message}));
    }
  }

  private handleMidiInputChange(event: CustomEvent) {
    const newMidiId = event.detail;
    this.activeMidiInputId = newMidiId;
    this.midiDispatcher.activeMidiInputId = newMidiId;
  }

  private handleRegionChange(event: CustomEvent) {
      // Visual only in this mode
      this.currentRegion = event.detail;
      (this as any).requestUpdate();
  }

  private playPause() {
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('play-pause'));
  }

  private stop() {
    if (this.liveMusicHelper) this.liveMusicHelper.stop();
  }
  
  private toggleRecord() {
      const drawer = (this as unknown as HTMLElement).shadowRoot?.querySelector('recorder-drawer') as unknown as RecorderDrawer;
      if (drawer) {
          if (drawer.recording) {
              drawer.stopRecording();
          } else {
              drawer.startRecording();
          }
      }
      const bar = (this as unknown as HTMLElement).shadowRoot?.querySelector('controls-bar') as any;
      if (bar) bar.toggleRecord();
  }
  
  private toggleLoop(e: CustomEvent) {
      const active = e.detail;
      if (this.liveMusicHelper) this.liveMusicHelper.toggleLoop(active);
  }
  
  private updateBpm(e: CustomEvent) {
      this.currentBpm = e.detail;
      if (this.liveMusicHelper) this.liveMusicHelper.bpm = e.detail;
  }
  
  private handleMidiLearnRequest(e: CustomEvent) {
      const action = e.detail;
      if (this.learnMode) {
          this.waitingForMidi = action;
      }
  }
  
  private toggleGlobalLearn() {
      this.learnMode = !this.learnMode;
      this.waitingForMidi = null;
  }

  private toggleMixer(e: CustomEvent) {
      this.mixerOpen = e.detail;
  }
  
  private openSettings() {
      this.settingsOpen = true;
  }
  
  private openEditor(e: CustomEvent) {
      this.editorBuffer = e.detail;
      this.editorOpen = true;
  }

  public addFilteredPrompt(prompt: string) {
    this.filteredPrompts = new Set([...this.filteredPrompts, prompt]);
  }

  private handleFxChange(e: CustomEvent) {
    if (!this.liveMusicHelper) return;
    const { type, value } = e.detail;
    if (type === 'reverb') this.liveMusicHelper.setReverbMix(value);
    if (type === 'delay') this.liveMusicHelper.setDelayMix(value);
    if (type === 'width') this.liveMusicHelper.setStereoWidth(value);
    if (type === 'master') {
        this.masterVol = value;
        this.liveMusicHelper.setMasterVolume(value);
    }
  }
  
  private handleDownloadRequest(e: CustomEvent) {
      this.pendingDownloadUrl = e.detail.url;
      this.downloadModalOpen = true;
  }
  
  private handleDownloadConfirm(e: CustomEvent) {
      const split = e.detail; // boolean
      
      // Trigger download
      const a = document.createElement('a');
      a.href = this.pendingDownloadUrl;
      a.download = `myaiplug_recording_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (split) {
          window.open('https://myaiplug.com', '_blank');
      }
      
      this.downloadModalOpen = false;
      this.pendingDownloadUrl = '';
  }

  // --- Codeine Processor Handlers ---

  private handleFileLoaded(e: CustomEvent) {
      this.tempAudioFile = e.detail;
      // Immediately decode for preview
      if (this.tempAudioFile && this.liveMusicHelper) {
          const reader = new FileReader();
          reader.onload = async (ev) => {
              const arrayBuffer = ev.target?.result as ArrayBuffer;
              const buffer = await this.liveMusicHelper!.decodeAudioFile(arrayBuffer);
              this.processorPreviewBuffer = buffer;
              (this as any).requestUpdate();
          }
          reader.readAsArrayBuffer(this.tempAudioFile);
      }
  }

  private handleProcessStart(e: CustomEvent) {
      if (!this.tempAudioFile) return;
      this.tempParams = e.detail;
      
      this.processedBuffer = this.processorPreviewBuffer;
      
      // Check if we should skip the modal animation
      if (e.detail.skipModal) {
          return; // Modal handling logic is skipped, rely on request-effects to switch view
      }
      
      this.processModalOpen = true;
      this.processingComplete = false;
  }

  private enterRackMode() {
      this.processModalOpen = false;
      this.appMode = 'rack';
      
      this.updateRackLabels();
      
      // Load the buffer into the helper for playback
      if (this.liveMusicHelper && this.processedBuffer) {
          // Store the buffer and play params in helper (custom implementation needed)
          this.liveMusicHelper.playBuffer(this.processedBuffer, this.tempParams.speed, this.tempParams.pitch);
      }
  }
  
  private backToProcessor() {
      this.appMode = 'processor';
      (this as any).requestUpdate();
  }

  render() {
    const promptValues = [...this.prompts.values()];
    const rows = [];
    const itemsPerRow = 5;
    
    for (let i = 0; i < promptValues.length; i += itemsPerRow) {
        rows.push(promptValues.slice(i, i + itemsPerRow));
    }

    const controlsBar = html`
      <controls-bar 
        .playbackState=${this.playbackState}
        .learning=${this.learnMode}
        .waitingFor=${this.waitingForMidi}
        .mixerOpen=${this.mixerOpen}
        .bpm=${this.currentBpm}
        .appMode=${this.appMode}
        @play-pause=${this.playPause}
        @stop=${this.stop}
        @record-toggle=${this.toggleRecord}
        @loop-toggle=${this.toggleLoop}
        @bpm-change=${this.updateBpm}
        @learn-toggle=${this.toggleGlobalLearn}
        @mixer-toggle=${this.toggleMixer}
        @mapping-request=${this.handleMidiLearnRequest}
        @open-settings=${this.openSettings}
        @switch-view=${this.backToProcessor}>
      </controls-bar>
    `;
    
    const wrapperClasses = classMap({
        'layout-wrapper': true,
        'wide-mode': this.wideMode,
        'mixer-open': this.mixerOpen
    });

    return html`
      <theme-toggle></theme-toggle>
      
      <!-- Codeine Processor Mode -->
      <div class="processor-wrapper ${this.appMode === 'rack' ? 'hidden' : ''}">
          <codeine-processor 
             .previewBuffer=${this.processorPreviewBuffer}
             .liveMusicHelper=${this.liveMusicHelper}
             .audioAnalyser=${this.audioAnalyser}
             @file-loaded=${this.handleFileLoaded}
             @process-start=${this.handleProcessStart}
             @request-effects=${this.enterRackMode}>
          </codeine-processor>
      </div>
      
      <processing-modal 
         ?open=${this.processModalOpen}
         ?complete=${this.processingComplete}
         .audioBuffer=${this.processedBuffer}
         @finish=${this.enterRackMode}>
      </processing-modal>

      <!-- Main Rack Mode -->
      <settings-modal 
        ?open=${this.settingsOpen}
        .currentTheme=${this.currentTheme}
        .currentKnobStyle=${this.currentKnobStyle}
        .wideMode=${this.wideMode}
        .midiEnabled=${this.showMidi}
        .midiInputIds=${this.midiInputIds}
        .activeMidiInputId=${this.activeMidiInputId}
        .learnMode=${this.learnMode}
        @close=${() => this.settingsOpen = false}
        @theme-change=${(e: CustomEvent) => this.currentTheme = e.detail}
        @knob-change=${(e: CustomEvent) => this.currentKnobStyle = e.detail}
        @wide-mode-change=${(e: CustomEvent) => this.wideMode = e.detail}
        @midi-enable-change=${(e: CustomEvent) => this.setShowMidi(e.detail)}
        @midi-input-change=${this.handleMidiInputChange}
        @learn-mode-toggle=${this.toggleGlobalLearn}>
      </settings-modal>
      
      <audio-editor-modal
        ?open=${this.editorOpen}
        .audioBuffer=${this.editorBuffer}
        .audioContext=${this.liveMusicHelper?.audioContext}
        @close=${() => this.editorOpen = false}>
      </audio-editor-modal>
      
      <download-modal
        ?open=${this.downloadModalOpen}
        @close=${() => this.downloadModalOpen = false}
        @confirm=${this.handleDownloadConfirm}>
      </download-modal>

      <div class="${wrapperClasses}" style="${this.appMode === 'processor' ? 'display:none' : ''}">
        <recorder-drawer 
            .liveMusicHelper=${this.liveMusicHelper}
            @open-editor=${this.openEditor}
            @request-download=${this.handleDownloadRequest}>
        </recorder-drawer>
        <eq-drawer .audioAnalyser=${this.audioAnalyser} .onEqChange=${this.onEqChange}></eq-drawer>
        <fx-drawer .liveMusicHelper=${this.liveMusicHelper}></fx-drawer>
        <genre-drawer 
            .currentRegion=${this.currentRegion} 
            @region-change=${this.handleRegionChange}>
        </genre-drawer>

        <div class="perspective-container">
            <div class="flipper ${this.mixerOpen ? 'flipped' : ''}">
            
              <!-- FRONT FACE: KNOBS -->
              <div id="rack-container" class="face">
                
                ${rows.map(row => html`
                  <div class="rack-unit">
                    ${row.map(prompt => html`
                      <prompt-controller
                        promptId=${prompt.promptId}
                        ?filtered=${this.filteredPrompts.has(prompt.text)}
                        cc=${prompt.cc}
                        text=${prompt.text}
                        weight=${prompt.weight}
                        color=${prompt.color}
                        ?muted=${prompt.muted || false}
                        pan=${0}
                        .midiDispatcher=${this.midiDispatcher}
                        .showCC=${this.showMidi}
                        audioLevel=${this.audioLevel}
                        .knobStyle=${this.currentKnobStyle}
                        @prompt-changed=${this.handlePromptChanged}>
                      </prompt-controller>
                    `)}
                  </div>
                `)}
                
                <div class="sticker-logo">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="12" y="4" width="4" height="8" rx="1" fill="white"></rect>
                        <rect x="24" y="4" width="4" height="8" rx="1" fill="white"></rect>
                        <rect x="10" y="12" width="20" height="16" rx="3" fill="white"></rect>
                        <circle cx="20" cy="20" r="2" fill="#7C4DFF" opacity="0.9"></circle>
                        <path d="M 20 28 Q 20 32, 18 34 Q 16 36, 20 36" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"></path>
                    </svg>
                </div>

                ${controlsBar}
              </div>

              <!-- BACK FACE: MIXER (4 Channels) -->
              <div id="mixer-container" class="face">
                 <div class="mixer-board">
                    <div class="mixer-channel">
                        <div class="channel-label">BUS</div>
                        <div style="flex-grow: 1; width: 100%; display: flex; justify-content: center;">
                            <vertical-fader .value=${this.busVol} @input=${this.handleBusMixer}></vertical-fader>
                        </div>
                    </div>
                    <div class="mixer-channel">
                        <div class="channel-label">FX MIX</div>
                        <div style="flex-grow: 1; width: 100%; display: flex; justify-content: center;">
                            <vertical-fader .value=${this.fxMix} .audioLevel=${this.fxLevel} @input=${this.handleFxMixer}></vertical-fader>
                        </div>
                    </div>
                    <div class="mixer-channel">
                        <div class="channel-label">LIMITER</div>
                        <div style="flex-grow: 1; width: 100%; display: flex; justify-content: center;">
                            <vertical-fader .value=${this.limiterThresh} @input=${this.handleLimiterMixer}></vertical-fader>
                        </div>
                    </div>
                    <div class="mixer-channel">
                        <div class="channel-label">MASTER</div>
                        <div style="flex-grow: 1; width: 100%; display: flex; justify-content: center;">
                            <vertical-fader .value=${this.masterVol} .audioLevel=${this.masterLevel} @input=${this.handleMasterMixer}></vertical-fader>
                        </div>
                    </div>
                 </div>
                 ${controlsBar}
              </div>
              
            </div>
        </div>
      </div>

      <mix-drawer 
        .learning=${this.learnMode} 
        .waitingFor=${this.waitingForMidi} 
        .audioLevel=${this.fxLevel}
        @fx-change=${this.handleFxChange} 
        @mapping-request=${this.handleMidiLearnRequest}>
      </mix-drawer>
      
      <master-drawer 
        .learning=${this.learnMode} 
        .waitingFor=${this.waitingForMidi} 
        .audioLevel=${this.masterLevel}
        @fx-change=${this.handleFxChange} 
        @mapping-request=${this.handleMidiLearnRequest}>
      </master-drawer>
    `;
  }
}
