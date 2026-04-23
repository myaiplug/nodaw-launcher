
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { LiveMusicHelper } from '../utils/LiveMusicHelper';
import { AudioAnalyser } from '../utils/AudioAnalyser';
import './WeightKnob';

@customElement('codeine-processor')
export class CodeineProcessor extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      perspective: 1000px;
      overflow: hidden;
      background: #000;
    }

    /* Mixing Console Background */
    .mixing-desk {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
        z-index: 0;
        background-image: 
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 60px 100%, 100% 60px;
    }
    
    .mixing-desk::before {
        content: '';
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at 50% 50%, transparent 40%, #000 100%);
    }

    /* The Bottle */
    .bottle {
      position: relative;
      width: 340px;
      height: 540px;
      background: linear-gradient(135deg, rgba(255, 140, 0, 0.4) 0%, rgba(200, 100, 0, 0.6) 100%);
      border-radius: 20px;
      box-shadow: 
        0 50px 100px rgba(0,0,0,0.9),
        inset 5px 5px 15px rgba(255,255,255,0.1),
        inset -10px -10px 30px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      backdrop-filter: blur(2px);
      border: 1px solid rgba(255,165,0,0.2);
      z-index: 10;
      transform-style: preserve-3d;
    }
    
    .bottle-mask {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        border-radius: 20px;
        overflow: hidden;
    }

    /* The Liquid (Codeine Syrup) */
    .liquid {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 75%;
      background: linear-gradient(180deg, #7b1fa2 0%, #4a148c 100%);
      opacity: 0.95;
      box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
      transition: height 0.1s ease-out, filter 0.1s ease;
      will-change: height;
      overflow: hidden;
    }
    
    .liquid-surface {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 10px;
        background: rgba(255,255,255,0.2);
        transform: scaleY(0.5);
    }

    /* The Bottle Neck */
    .neck {
        position: absolute;
        top: -25px;
        width: 160px;
        height: 30px;
        background: rgba(200, 100, 0, 0.8);
        z-index: 1;
        border-radius: 5px 5px 0 0;
        left: 50%;
        transform: translateX(-50%);
    }

    /* Realistic Cap */
    .cap {
      position: absolute;
      top: -70px;
      width: 170px; 
      height: 60px;
      z-index: 10;
      left: 50%;
      transform: translateX(-50%);
    }
    
    .cap-top {
        position: absolute;
        top: 0;
        left: 2px;
        right: 2px;
        height: 15px;
        background: linear-gradient(to bottom, #fff, #ddd);
        border-radius: 50% 50% 0 0 / 10px 10px 0 0;
        box-shadow: inset 0 -2px 5px rgba(0,0,0,0.1);
    }
    
    .cap-side {
        position: absolute;
        top: 15px;
        left: 0;
        width: 100%;
        height: 45px;
        background: #fdfdfd;
        border-radius: 2px;
        box-shadow: 
            0 5px 15px rgba(0,0,0,0.4),
            inset 0 -5px 10px rgba(0,0,0,0.05);
        background-image: repeating-linear-gradient(90deg, 
            #e0e0e0, 
            #e0e0e0 2px, 
            #fff 3px, 
            #fff 6px
        );
    }

    /* The Label */
    .label {
      position: absolute;
      top: 15%;
      width: 92%;
      height: 80%;
      background: #fff;
      border-radius: 4px;
      box-shadow: 
        0 2px 10px rgba(0,0,0,0.3),
        inset 0 0 20px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      padding: 0;
      box-sizing: border-box;
      overflow: hidden;
      z-index: 2;
    }

    .label-header {
        background: linear-gradient(135deg, #FF8C00, #FFA500);
        height: 60px;
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-left: 20px;
    }
    
    .cassette-logo {
        width: 40px;
        height: 40px;
        background: #5D2C89;
        border-radius: 4px;
        position: relative;
        box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
    }
    .cassette-logo-inner {
        width: 24px; height: 12px;
        background: #fff;
        position: absolute;
        top: 8px; left: 8px;
        border-radius: 2px;
        display: flex; gap: 3px; justify-content: center; align-items: center;
    }
    .spool { width: 6px; height: 6px; background: #5D2C89; border-radius: 50%; }

    .label-body {
        padding: 10px 15px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
    
    .brand-title {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-weight: 900;
        font-size: 38px;
        color: #000;
        line-height: 0.9;
        letter-spacing: -1.5px;
    }
    .brand-subtitle {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        color: #000;
        margin-top: 2px;
        margin-bottom: 8px;
    }
    
    .purple-line {
        width: 100%;
        height: 4px;
        background: #5D2C89;
        margin-bottom: 12px;
    }

    /* Preset Selection Buttons */
    .preset-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;
    }
    .preset-btn {
        background: #f8f8f8;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 8px 12px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 12px;
        text-transform: uppercase;
        cursor: pointer;
        text-align: left;
        color: #333;
        transition: all 0.2s;
        box-shadow: inset 0 1px 0 #fff;
    }
    .preset-btn:hover {
        background: #fff;
        border-color: #5D2C89;
        transform: translateX(2px);
    }
    .preset-btn.active {
        background: #5D2C89;
        color: #fff;
        border-color: #4a148c;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
    }

    .rx-details {
        font-family: 'Arial Narrow', sans-serif;
        font-size: 10px;
        line-height: 1.3;
        color: #222;
        margin-bottom: 8px;
    }
    .detail-row {
        margin-bottom: 3px;
    }
    .strong {
        font-weight: bold;
        color: #000;
        text-transform: uppercase;
        margin-right: 3px;
    }
    
    .middle-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        margin-bottom: 10px;
    }
    
    .rx-only {
        font-family: 'Times New Roman', serif;
        font-weight: bold;
        font-size: 24px;
        color: #000;
    }
    
    .flavor-badge {
        display: flex;
    }
    .badge-left { background: #5D2C89; color: #fff; padding: 4px 6px; font-weight: bold; font-size: 12px; }
    .badge-right { background: #FF8C00; color: #fff; padding: 4px 6px; font-weight: bold; font-size: 12px; }
    
    .barcode-section {
        display: flex;
        gap: 10px;
        align-items: flex-end;
    }
    .barcode {
        height: 40px;
        width: 100%;
        background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px);
    }
    .ndc {
        font-family: monospace;
        font-size: 9px;
        font-weight: bold;
        color: #555;
    }
    
    .pint-info {
        display: flex;
        align-items: center;
        gap: 5px;
        font-weight: bold;
        font-size: 12px;
        margin-top: 5px;
        color: #000;
    }

    /* Hide label body parts when preview is active to clear space */
    :host([loaded]) .middle-section,
    :host([loaded]) .barcode-section,
    :host([loaded]) .pint-info,
    :host([loaded]) .preset-row,
    :host([loaded]) .rx-details {
        display: none;
    }

    /* PREVIEW INTERFACE */
    .interaction-overlay {
        position: absolute;
        top: 150px; 
        left: 0; width: 100%; bottom: 0;
        background: transparent;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 20px;
        box-sizing: border-box;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
    }
    :host([loaded]) .interaction-overlay {
        opacity: 1;
        pointer-events: auto;
    }
    
    .click-target {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        cursor: pointer;
        z-index: 5;
    }
    :host([loaded]) .click-target { display: none; }
    
    input[type="file"] { display: none; }
    
    .knobs-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    .knob-wrapper {
      width: 45%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .knob-label {
      font-family: 'Roboto Condensed', sans-serif;
      font-weight: 700;
      font-size: 11px;
      margin-top: 5px;
      color: #000;
      text-transform: uppercase;
    }
    .knob-value {
      font-family: 'Roboto Mono', monospace;
      font-size: 11px;
      color: #5D2C89;
      font-weight: bold;
      cursor: ew-resize;
      user-select: none;
      background: rgba(0,0,0,0.08);
      padding: 3px 8px;
      border-radius: 4px;
      min-width: 4em;
      text-align: center;
      outline: none;
      border: 1px solid transparent;
      transition: background 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .knob-value:hover { background: rgba(0,0,0,0.15); }
    .knob-value:focus {
      background: #fff;
      cursor: text;
      border-color: #5D2C89;
    }
    
    weight-knob { width: 70px; height: 70px; } 
    
    .transport-row {
        display: flex;
        width: 100%;
        gap: 8px;
        margin-bottom: 15px;
    }
    
    .actions-row {
        display: flex;
        width: 100%;
        gap: 10px;
        margin-top: auto;
        margin-bottom: 20px;
    }
    
    .action-btn {
        flex: 1;
        border: 1px solid #ddd;
        background: #f5f5f5;
        border-radius: 6px;
        padding: 8px;
        cursor: pointer;
        font-family: 'Roboto Condensed', sans-serif;
        font-weight: bold;
        font-size: 11px;
        color: #333;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: all 0.2s;
    }
    .action-btn:hover { background: #eee; border-color: #bbb; transform: translateY(-1px); }
    .action-btn:active { transform: translateY(0); }
    
    .action-btn svg { width: 14px; height: 14px; fill: currentColor; }
    
    .stop-btn { color: #d32f2f; border-color: rgba(211, 47, 47, 0.2); background: rgba(211, 47, 47, 0.05); }
    .stop-btn:hover { background: rgba(211, 47, 47, 0.1); border-color: #d32f2f; }
    
    .restart-btn { color: #1976d2; border-color: rgba(25, 118, 210, 0.2); background: rgba(25, 118, 210, 0.05); }
    .restart-btn:hover { background: rgba(25, 118, 210, 0.1); border-color: #1976d2; }

    .download-btn {
        border-color: #008888;
        color: #008888;
        background: rgba(0,255,255,0.05);
    }
    
    .effects-btn {
        border-color: #5D2C89;
        color: #5D2C89;
        background: rgba(93, 44, 137, 0.05);
    }
  `;

  @property({ type: Boolean, reflect: true }) loaded = false;
  @property({ attribute: false }) previewBuffer: AudioBuffer | null = null;
  @property({ attribute: false }) liveMusicHelper?: LiveMusicHelper;
  @property({ attribute: false }) audioAnalyser?: AudioAnalyser;
  
  @state() private timeStretch = 1.0; 
  @state() private pitchShift = 0; 
  @state() private fileName = '';
  @state() private isPreviewing = false;
  @state() private activePreset = '';
  
  @state() private liquidHeight = 75; 
  @state() private liquidHue = 0; 

  @query('input[type="file"]') private fileInput!: HTMLInputElement;
  @query('.time-value') private timeValueDisplay!: HTMLDivElement;
  @query('.pitch-value') private pitchValueDisplay!: HTMLDivElement;
  
  private rafId = 0;

  update(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('timeStretch') && this.timeValueDisplay && document.activeElement !== this.timeValueDisplay) {
      this.timeValueDisplay.textContent = `${Math.round(this.timeStretch * 100)}%`;
    }
    if (changedProperties.has('pitchShift') && this.pitchValueDisplay && document.activeElement !== this.pitchValueDisplay) {
      this.pitchValueDisplay.textContent = `${this.pitchShift > 0 ? '+' : ''}${this.pitchShift} ST`;
    }
    super.update(changedProperties);
  }

  firstUpdated() {
    if (this.timeValueDisplay) {
      this.timeValueDisplay.textContent = `${Math.round(this.timeStretch * 100)}%`;
    }
    if (this.pitchValueDisplay) {
      this.pitchValueDisplay.textContent = `${this.pitchShift > 0 ? '+' : ''}${this.pitchShift} ST`;
    }
  }

  connectedCallback() {
      super.connectedCallback();
      this.startLiquidLoop();
  }
  
  disconnectedCallback() {
      super.disconnectedCallback();
      cancelAnimationFrame(this.rafId);
  }
  
  private startLiquidLoop() {
      const loop = () => {
          this.rafId = requestAnimationFrame(loop);
          if (this.isPreviewing && this.audioAnalyser) {
              const level = this.audioAnalyser.getCurrentLevel();
              this.liquidHeight = 75 + (level * 15);
              this.liquidHue = level * 60; 
          } else {
              this.liquidHeight = this.liquidHeight * 0.95 + 75 * 0.05;
              this.liquidHue = this.liquidHue * 0.95;
          }
          (this as any).requestUpdate();
      };
      loop();
  }

  private handleFileSelect(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
        this.fileName = files[0].name;
        this.loaded = true;
        (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('file-loaded', { detail: files[0] }));
    }
  }

  private triggerUpload() {
    this.fileInput.click();
  }

  private applyPreset(type: string, e: Event) {
      e.stopPropagation();
      this.activePreset = type;
      
      if (type === 'baby') {
          this.timeStretch = 0.85;
          this.pitchShift = -1;
      } else if (type === 'og') {
          this.timeStretch = 0.7;
          this.pitchShift = -4;
      } else if (type === 'mane') {
          this.timeStretch = 0.55;
          this.pitchShift = -8;
      }

      this.loaded = true;
      this.ensurePlayback();
      this.updatePreview();
      (this as any).requestUpdate();
  }

  private ensurePlayback() {
      if (!this.isPreviewing && this.liveMusicHelper && this.previewBuffer) {
          this.liveMusicHelper.playBuffer(this.previewBuffer, this.timeStretch, this.pitchShift);
          this.isPreviewing = true;
          (this as any).requestUpdate();
      }
  }

  private handleTimeChange(e: CustomEvent) {
    this.timeStretch = 0.5 + (e.detail * 0.75); 
    this.activePreset = '';
    this.ensurePlayback();
    this.updatePreview();
    (this as any).requestUpdate();
  }

  private handlePitchChange(e: CustomEvent) {
    this.pitchShift = Math.round((e.detail - 1) * 12);
    this.activePreset = '';
    this.ensurePlayback();
    this.updatePreview();
    (this as any).requestUpdate();
  }

  private handleScrubValue(e: PointerEvent, type: 'time' | 'pitch') {
    const target = e.currentTarget as HTMLElement;
    if (document.activeElement === target) return;
    
    e.preventDefault();
    target.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startVal = type === 'time' ? this.timeStretch : this.pitchShift;
    
    const move = (ev: PointerEvent) => {
        const delta = (ev.clientX - startX);
        if (type === 'time') {
            this.timeStretch = Math.max(0.5, Math.min(1.25, startVal + delta * 0.005));
        } else {
            this.pitchShift = Math.max(-12, Math.min(12, Math.round(startVal + delta * 0.1)));
        }
        this.activePreset = '';
        this.ensurePlayback();
        this.updatePreview();
        (this as any).requestUpdate();
    };
    
    const up = (ev: PointerEvent) => {
        target.releasePointerCapture(ev.pointerId);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
    };
    
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private handleTextEdit(e: FocusEvent, type: 'time' | 'pitch') {
    const target = e.currentTarget as HTMLElement;
    const text = target.textContent || '';
    const val = parseFloat(text.replace(/[^0-9.-]/g, ''));
    
    if (!isNaN(val)) {
        if (type === 'time') {
            // Assume user might enter "75" for 75%
            const normalized = val > 10 ? val / 100 : val;
            this.timeStretch = Math.max(0.5, Math.min(1.25, normalized));
        } else {
            this.pitchShift = Math.max(-12, Math.min(12, Math.round(val)));
        }
    }
    
    this.activePreset = '';
    this.ensurePlayback();
    this.updatePreview();
    (this as any).requestUpdate();
  }
  
  private updatePreview() {
      if (this.isPreviewing && this.liveMusicHelper) {
          this.liveMusicHelper.updateFileParams(this.timeStretch, this.pitchShift);
      }
  }
  
  private stopPreview() {
      if (this.liveMusicHelper) {
          this.liveMusicHelper.stop();
          this.isPreviewing = false;
      }
  }

  private restartPreview() {
      if (this.liveMusicHelper && this.previewBuffer) {
          this.liveMusicHelper.stop();
          this.liveMusicHelper.playBuffer(this.previewBuffer, this.timeStretch, this.pitchShift);
          this.isPreviewing = true;
      }
  }

  private async downloadProcessed() {
      if (!this.liveMusicHelper || !this.previewBuffer) return;
      
      this.stopPreview();
      
      const wavBytes = await this.liveMusicHelper.renderOffline(this.previewBuffer, this.timeStretch, this.pitchShift);
      const blob = new Blob([wavBytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `screwed_${this.fileName || 'audio'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }
  
  private goToEffects() {
      this.stopPreview();
      
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('process-start', {
          detail: { 
              speed: this.timeStretch, 
              pitch: this.pitchShift,
              skipModal: true 
          }
      }));
      
      setTimeout(() => {
          (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('request-effects', { bubbles: true, composed: true }));
      }, 100);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }

  render() {
    const liquidStyle = styleMap({
        height: `${this.liquidHeight}%`,
        filter: `hue-rotate(${this.liquidHue}deg)`
    });

    return html`
      <div class="mixing-desk"></div>
      
      <div class="bottle">
        <div class="cap">
            <div class="cap-top"></div>
            <div class="cap-side"></div>
        </div>
        <div class="neck"></div>
        
        <div class="bottle-mask">
            <div class="liquid" style=${liquidStyle}>
                <div class="liquid-surface"></div>
            </div>
        </div>
        
        <div class="label">
           <div class="label-header">
               <div class="cassette-logo">
                   <div class="cassette-logo-inner">
                       <div class="spool"></div><div class="spool"></div>
                   </div>
               </div>
           </div>
           
           <div class="label-body">
               <div class="brand-title">ScrewAI™</div>
               <div class="brand-subtitle">Powered by InstaAI</div>
               <div class="purple-line"></div>
               
               <!-- Screw Presets (Initial State) -->
               <div class="preset-row">
                   <button class="preset-btn ${this.activePreset === 'baby' ? 'active' : ''}" @click=${(e: Event) => this.applyPreset('baby', e)}>Baby Screw</button>
                   <button class="preset-btn ${this.activePreset === 'og' ? 'active' : ''}" @click=${(e: Event) => this.applyPreset('og', e)}>OG Screw</button>
                   <button class="preset-btn ${this.activePreset === 'mane' ? 'active' : ''}" @click=${(e: Event) => this.applyPreset('mane', e)}>Mane, Hold Up!</button>
               </div>
               
               <div class="rx-details">
                   <div class="detail-row">
                       <span class="strong">Directions:</span> Mix well with lemon-lime soda. Sip slowly. Effects include slowed perception and deep vibrations.
                   </div>
                   <div class="detail-row">
                       <span class="strong">Dosage:</span> Take 1-2 lines per session or as needed for vibe enhancement. Warning: Highly habit forming.
                   </div>
               </div>
               
               <div class="middle-section">
                   <div class="rx-only">Rx only</div>
                   <div class="flavor-badge">
                       <div class="badge-left">GRAPE</div>
                       <div class="badge-right">APE</div>
                   </div>
               </div>
               
               <div class="barcode-section">
                   <div class="ndc">NDC 75432-16478</div>
                   <div class="barcode"></div>
               </div>
               
               <div class="pint-info">
                   <svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2C12 2 5 9 5 14C5 18 8 21 12 21C16 21 19 18 19 14C19 9 12 2 12 2Z" fill="black"/></svg>
                   One Pint (473 mL)
               </div>
           </div>
           
           <div class="click-target" @click=${this.triggerUpload} title="Tap to Upload Audio"></div>
           <input type="file" accept="audio/*" @change=${this.handleFileSelect} />
           
           <!-- PREVIEW CONTROLS -->
           <div class="interaction-overlay">
               <div class="knobs-row">
                 <div class="knob-wrapper">
                    <div class="knob-value time-value" 
                         contenteditable="true"
                         spellcheck="false"
                         @keydown=${this.onKeyDown}
                         @blur=${(e: FocusEvent) => this.handleTextEdit(e, 'time')}
                         @pointerdown=${(e: PointerEvent) => this.handleScrubValue(e, 'time')}>

                    </div>
                    <weight-knob 
                        .value=${(this.timeStretch - 0.5) / 0.75} 
                        .min=${0} .max=${1}
                        .knobStyle=${'soft-touch'} 
                        color="#7C4DFF"
                        @input=${this.handleTimeChange}>
                    </weight-knob>
                    <div class="knob-label">TIME STRETCH</div>
                 </div>

                 <div class="knob-wrapper">
                    <div class="knob-value pitch-value" 
                         contenteditable="true"
                         spellcheck="false"
                         @keydown=${this.onKeyDown}
                         @blur=${(e: FocusEvent) => this.handleTextEdit(e, 'pitch')}
                         @pointerdown=${(e: PointerEvent) => this.handleScrubValue(e, 'pitch')}>

                    </div>
                    <weight-knob 
                        .value=${(this.pitchShift / 12) + 1} 
                        .min=${0} .max=${2}
                        .knobStyle=${'soft-touch'} 
                        color="#00FFFF"
                        @input=${this.handlePitchChange}>
                    </weight-knob>
                    <div class="knob-label">PITCH BEND</div>
                 </div>
               </div>

               <div class="transport-row">
                    <button class="action-btn restart-btn" @click=${this.restartPreview}>
                        <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                        Restart
                    </button>
                    <button class="action-btn stop-btn" @click=${this.stopPreview}>
                        <svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                        Stop
                    </button>
               </div>
               
               <div class="actions-row">
                   <button class="action-btn download-btn" @click=${this.downloadProcessed}>
                       <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                       Save
                   </button>
                   <button class="action-btn effects-btn" @click=${this.goToEffects}>
                       FX Rack
                       <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                   </button>
               </div>
           </div>
        </div>
      </div>
    `;
  }
}
