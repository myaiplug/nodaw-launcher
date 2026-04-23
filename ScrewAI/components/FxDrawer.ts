



/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LiveMusicHelper } from '../utils/LiveMusicHelper';
import './WeightKnob';

@customElement('fx-drawer')
export class FxDrawer extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: absolute;
      left: 0;
      top: calc(40% - 45px); 
      width: 0;
      height: 0;
      z-index: 4; 
      overflow: visible;
    }

    #drawer-body {
      background: var(--bg-drawer);
      border: 1px solid var(--border-main);
      border-right: none; 
      border-radius: 8px 0 0 8px;
      padding: 1.5vmin; 
      display: flex;
      flex-direction: column;
      gap: 1.5vmin; 
      min-width: calc(28vmin + 50px);
      box-shadow: inset 0 0 20px rgba(0,0,0,0.1), -5px 5px 15px rgba(0,0,0,0.3);
      position: absolute;
      top: 0;
      left: 0; 
      transform: translateX(0);
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    :host([open]) #drawer-body {
      transform: translateX(-100%);
    }

    #tab {
      position: absolute;
      right: 100%;
      top: 2vmin;
      cursor: pointer;
      background: var(--tab-bg);
      color: var(--tab-text);
      padding: 1.5vmin 0.6vmin;
      border: 1px solid var(--border-main);
      border-right: none;
      border-radius: 4px 0 0 4px;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-family: 'Roboto Condensed', sans-serif;
      font-weight: 700;
      font-size: 1.4vmin;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      user-select: none;
      
      /* 3D Bevel Edge */
      box-shadow: 
        inset 1px 1px 1px rgba(255,255,255,0.7),
        inset -1px -1px 2px rgba(0,0,0,0.1),
        -2px 0 5px rgba(0,0,0,0.3);
      
      margin-right: 2px;
      text-shadow: 0 1px 0 rgba(255,255,255,0.8);
    }
    
    #tab:hover {
      filter: brightness(1.1);
      box-shadow: 
        inset 1px 1px 1px rgba(255,255,255,0.9),
        -2px 0 5px rgba(0,0,0,0.4);
    }

    .fx-section {
        border-bottom: 1px solid var(--border-dark);
        padding-bottom: 1vmin;
    }
    .fx-section:last-child { border-bottom: none; padding-bottom: 0; }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1vmin;
    }

    .section-title {
        font-family: 'Roboto Condensed', sans-serif;
        font-size: 1.6vmin;
        font-weight: 600;
        color: var(--text-main); 
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .knob-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1vmin;
    }
    
    .knob-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5vmin;
    }
    
    .label {
        font-family: 'Roboto Mono', monospace;
        font-size: 1vmin;
        color: var(--text-dim);
        white-space: nowrap;
    }
    
    .btn-group {
        display: flex;
        gap: 0.5vmin;
        margin-bottom: 1vmin;
    }
    
    button {
        background: linear-gradient(180deg, var(--bg-rack-unit) 0%, #222 100%);
        border: 1px solid var(--border-main);
        color: var(--text-dim);
        font-size: 1.1vmin;
        font-weight: 600;
        padding: 0.6vmin 0.4vmin;
        border-radius: 3px;
        cursor: pointer;
        flex: 1;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    button:hover {
        color: var(--text-highlight);
        border-color: var(--text-dim);
        filter: brightness(1.2);
    }
    button.active {
        background: var(--text-highlight);
        color: #000;
        border-color: #fff;
        box-shadow: 0 0 5px rgba(255,255,255,0.3);
    }
    
    .inline-knob {
        width: 5vmin;
        display: flex;
        align-items: center;
        gap: 1vmin;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ attribute: false }) liveMusicHelper?: LiveMusicHelper;

  @state() private reverbType = 'Hall';
  @state() private delayNote = '1/4';
  
  // Reverb Params
  @state() private rvSize = 1.0; 
  @state() private rvWet = 0;
  @state() private rvLpf = 2.0; 
  @state() private rvHpf = 0; 
  @state() private rvInt = 1.0; 

  // Delay Params
  @state() private dlFeed = 0.8;
  @state() private dlAmt = 2.0;
  @state() private dlLpf = 2.0;
  @state() private dlHpf = 0;
  @state() private dlMix = 0;

  @state() private widthVal = 1.0; 

  private toggleOpen() {
    this.open = !this.open;
  }
  
  /* REVERB HANDLERS */
  private setReverbType(type: string) {
      this.reverbType = type;
      this.liveMusicHelper?.setReverbType(type);
  }
  
  private updateRvSize(e: CustomEvent) {
      this.rvSize = e.detail;
      this.liveMusicHelper?.setReverbSize(e.detail / 2); // 0-1
  }
  private updateRvInt(e: CustomEvent) {
      this.rvInt = e.detail;
      this.liveMusicHelper?.setReverbIntensity(e.detail / 2);
  }
  private updateRvLpf(e: CustomEvent) {
      this.rvLpf = e.detail;
      this.liveMusicHelper?.setReverbFilters(this.rvLpf / 2, this.rvHpf / 2);
  }
  private updateRvHpf(e: CustomEvent) {
      this.rvHpf = e.detail;
      this.liveMusicHelper?.setReverbFilters(this.rvLpf / 2, this.rvHpf / 2);
  }
  private updateRvWet(e: CustomEvent) {
      this.rvWet = e.detail;
      this.liveMusicHelper?.setReverbMix(e.detail / 2);
  }

  /* DELAY HANDLERS */
  private setDelayNote(note: string) {
      this.delayNote = note;
      this.liveMusicHelper?.setDelayNote(note);
  }
  private updateDlFeed(e: CustomEvent) {
      this.dlFeed = e.detail;
      this.liveMusicHelper?.setDelayFeedback(e.detail / 2);
  }
  private updateDlAmt(e: CustomEvent) {
      this.dlAmt = e.detail;
      this.liveMusicHelper?.setDelayAmount(e.detail / 2);
  }
  private updateDlLpf(e: CustomEvent) {
      this.dlLpf = e.detail;
      this.liveMusicHelper?.setDelayFilters(this.dlLpf / 2, this.dlHpf / 2);
  }
  private updateDlHpf(e: CustomEvent) {
      this.dlHpf = e.detail;
      this.liveMusicHelper?.setDelayFilters(this.dlLpf / 2, this.dlHpf / 2);
  }
  private updateDlMix(e: CustomEvent) {
      this.dlMix = e.detail;
      this.liveMusicHelper?.setDelayMix(e.detail / 2);
  }
  
  private updateWidth(e: CustomEvent) {
      this.widthVal = e.detail;
      this.liveMusicHelper?.setStereoWidth(e.detail / 2);
  }

  render() {
    return html`
      <div id="drawer-body">
        <div id="tab" @click=${this.toggleOpen}>FX</div>
        
        <!-- Reverb -->
        <div class="fx-section">
            <div class="section-header">
                <span class="section-title">Reverb</span>
                <div class="btn-group">
                    ${['Room', 'Hall', 'Plate'].map(t => html`
                        <button class="${this.reverbType === t ? 'active' : ''}" 
                                @click=${() => this.setReverbType(t)}>${t}</button>
                    `)}
                </div>
            </div>
            
            <div class="knob-grid">
                <div class="knob-wrap">
                    <weight-knob .value=${this.rvSize} color="#00e5ff" @input=${this.updateRvSize}></weight-knob>
                    <span class="label">SIZE</span>
                </div>
                <div class="knob-wrap">
                    <weight-knob .value=${this.rvWet} color="#00e5ff" @input=${this.updateRvWet}></weight-knob>
                    <span class="label">WET</span>
                </div>
                <div class="knob-wrap">
                    <weight-knob .value=${this.rvLpf} color="#00e5ff" @input=${this.updateRvLpf}></weight-knob>
                    <span class="label">LPF</span>
                </div>
                <div class="knob-wrap">
                    <weight-knob .value=${this.rvHpf} color="#00e5ff" @input=${this.updateRvHpf}></weight-knob>
                    <span class="label">HPF</span>
                </div>
                <div class="knob-wrap">
                    <weight-knob .value=${this.rvInt} color="#00e5ff" @input=${this.updateRvInt}></weight-knob>
                    <span class="label">INTENS</span>
                </div>
            </div>
        </div>

        <!-- Delay -->
        <div class="fx-section">
            <div class="section-header">
                <span class="section-title">Delay</span>
                <div class="btn-group">
                    ${['1/2', '1/4', '1/8', '1/16'].map(t => html`
                        <button class="${this.delayNote === t ? 'active' : ''}" 
                                @click=${() => this.setDelayNote(t)}>${t}</button>
                    `)}
                </div>
            </div>

            <div class="knob-grid">
                 <div class="knob-wrap">
                    <weight-knob .value=${this.dlFeed} color="#ff00ff" @input=${this.updateDlFeed}></weight-knob>
                    <span class="label">FDBK</span>
                 </div>
                 <div class="knob-wrap">
                    <weight-knob .value=${this.dlAmt} color="#ff00ff" @input=${this.updateDlAmt}></weight-knob>
                    <span class="label">AMT</span>
                 </div>
                 <div class="knob-wrap">
                    <weight-knob .value=${this.dlLpf} color="#ff00ff" @input=${this.updateDlLpf}></weight-knob>
                    <span class="label">LPF</span>
                 </div>
                 <div class="knob-wrap">
                    <weight-knob .value=${this.dlHpf} color="#ff00ff" @input=${this.updateDlHpf}></weight-knob>
                    <span class="label">HPF</span>
                 </div>
                 <div class="knob-wrap">
                    <weight-knob .value=${this.dlMix} color="#ff00ff" @input=${this.updateDlMix}></weight-knob>
                    <span class="label">MIX</span>
                 </div>
            </div>
        </div>
        
        <!-- Stereo Width -->
        <div class="fx-section" style="border: none; padding-bottom: 0;">
            <div class="section-header" style="margin-bottom: 0;">
                <span class="section-title">Stereo Width</span>
                <div class="inline-knob" style="width: 5vmin;">
                    <weight-knob .value=${this.widthVal} color="#ffff00" @input=${this.updateWidth}></weight-knob>
                </div>
            </div>
        </div>
        
      </div>
    `;
  }
}
