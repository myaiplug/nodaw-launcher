

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { AudioAnalyser } from '../utils/AudioAnalyser';
import { EQ_PRESETS } from '../utils/presets';
import './WeightKnob';

@customElement('eq-drawer')
export class EqDrawer extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: absolute;
      left: 0;
      top: calc(5% - 15px); 
      width: 0;
      height: 0;
      z-index: 5; 
      overflow: visible;
    }

    #drawer-body {
      background: var(--bg-drawer);
      border: 1px solid var(--border-main);
      border-right: none; 
      border-radius: 8px 0 0 8px;
      padding: 1vmin; 
      display: flex;
      flex-direction: column;
      gap: 0.8vmin; 
      min-width: 15vmin;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.1), -5px 5px 15px rgba(0,0,0,0.3);
      position: absolute;
      top: 0;
      left: 0; 
      transform: translateX(0);
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      padding-bottom: 2.5vmin;
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
      padding: 1.5vmin 0.5vmin;
      border: 1px solid var(--border-main);
      border-right: none;
      border-radius: 4px 0 0 4px; 
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-family: 'Roboto Condensed', sans-serif;
      font-weight: 700;
      font-size: 1.2vmin;
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

    /* Knobs Layout */
    .knobs-container {
      display: flex;
      gap: 1vmin;
      justify-content: space-between;
    }
    
    .knob-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5vmin;
      width: 4vmin;
    }

    .label {
      font-family: 'Roboto Mono', monospace;
      font-size: 0.9vmin;
      color: var(--text-dim);
      text-transform: uppercase;
    }

    weight-knob {
      width: 100%;
    }

    /* Advanced Button */
    #advanced-btn {
      background: radial-gradient(circle at 30% 30%, #a00, #500);
      color: #ffcccc;
      border: 1px solid #300;
      border-radius: 50%;
      width: 1.5vmin;
      height: 1.5vmin;
      font-size: 0;
      cursor: pointer;
      box-shadow: 
        0 2px 4px rgba(0,0,0,0.4),
        inset 1px 1px 2px rgba(255,255,255,0.3);
      transition: all 0.2s;
      position: absolute;
      bottom: 0.5vmin;
      right: 0.5vmin; 
    }
    #advanced-btn:hover {
      background: radial-gradient(circle at 30% 30%, #c00, #700);
      box-shadow: 0 0 5px #ff0000;
    }
    #advanced-btn.active {
      background: #ff0000;
      box-shadow: inset 0 0 5px rgba(0,0,0,0.5), 0 0 8px #ff0000;
    }

    /* Waveform/Spectrum Canvas */
    canvas {
      width: 100%;
      height: 5vmin;
      background: #000;
      border: 1px solid var(--border-dark);
      border-radius: 4px;
      margin-bottom: 0.5vmin;
      display: none;
      box-shadow: inset 0 0 5px rgba(0,0,0,0.8);
    }
    :host([advanced]) canvas {
      display: block;
    }
    
    :host([advanced]) #drawer-body {
      min-width: 35vmin;
    }
    :host([advanced]) .knob-wrapper {
      width: 4.5vmin;
    }

    /* Preset Select */
    .preset-select {
      width: 100%;
      background: var(--bg-rack);
      color: var(--text-main);
      border: 1px solid var(--border-main);
      padding: 2px;
      font-size: 10px;
      margin-bottom: 2px;
      border-radius: 4px;
      outline: none;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true }) advanced = false;
  @property({ attribute: false }) audioAnalyser?: AudioAnalyser;
  @property({ attribute: false }) onEqChange?: (gains: number[]) => void;

  @state() private bands: number[] = [0, 0, 0, 0, 0, 0, 0];
  @state() private low = 1; 
  @state() private mid = 1;
  @state() private high = 1;

  @query('canvas') private canvas?: HTMLCanvasElement;
  private canvasCtx?: CanvasRenderingContext2D;
  private drawRafId = 0;

  connectedCallback() {
    super.connectedCallback();
    this.startDrawLoop();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this.drawRafId);
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('advanced') && this.advanced && this.canvas) {
        this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
        this.canvasCtx = this.canvas.getContext('2d')!;
    }
  }

  private startDrawLoop() {
    const loop = () => {
      this.drawRafId = requestAnimationFrame(loop);
      this.draw();
    };
    loop();
  }

  private draw() {
    if (!this.open || !this.advanced || !this.canvasCtx || !this.audioAnalyser) return;
    
    const ctx = this.canvasCtx;
    const w = this.canvas!.width;
    const h = this.canvas!.height;
    const data = new Uint8Array(this.audioAnalyser.node.frequencyBinCount);
    this.audioAnalyser.node.getByteFrequencyData(data);

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);

    const barCount = 40; 
    const barWidth = w / barCount;
    
    for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * (data.length / barCount) * 0.8); 
        const value = data[dataIndex];
        const percent = value / 255;
        const height = percent * h;
        
        const hue = 0 + (i / barCount) * 60;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(i * barWidth, h - height, barWidth - 1, height);
    }
  }

  private toggleOpen() {
    this.open = !this.open;
  }

  private toggleAdvanced() {
    this.advanced = !this.advanced;
  }

  private handleSimpleInput(e: CustomEvent, band: 'low'|'mid'|'high') {
    const val = e.detail; 
    if (band === 'low') this.low = val;
    if (band === 'mid') this.mid = val;
    if (band === 'high') this.high = val;

    const db = (v: number) => (v - 1) * 12;

    const newBands = [...this.bands];
    if (band === 'low') {
       newBands[0] = db(val);
       newBands[1] = db(val);
    }
    if (band === 'mid') {
       newBands[2] = db(val);
       newBands[3] = db(val);
       newBands[4] = db(val);
    }
    if (band === 'high') {
       newBands[5] = db(val);
       newBands[6] = db(val);
    }
    
    this.bands = newBands;
    this.emitChange();
  }

  private handleAdvancedInput(e: CustomEvent, index: number) {
    const val = e.detail; 
    const db = (val - 1) * 12;
    this.bands[index] = db;
    (this as any).requestUpdate();
    this.emitChange();
  }

  private emitChange() {
    if (this.onEqChange) this.onEqChange(this.bands);
  }

  private getKnobValue(index: number) {
     return (this.bands[index] / 12) + 1;
  }

  private handlePresetChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const presetName = select.value;
    const preset = EQ_PRESETS.find(p => p.name === presetName);
    
    if (preset) {
        this.bands = [...preset.gains];
        this.low = (this.bands[0] / 12) + 1;
        this.mid = (this.bands[3] / 12) + 1;
        this.high = (this.bands[6] / 12) + 1;
        this.emitChange();
        (this as any).requestUpdate();
    }
  }

  render() {
    return html`
      <div id="drawer-body">
        <div id="tab" @click=${this.toggleOpen}>EQ</div>

        <select class="preset-select" @change=${this.handlePresetChange}>
            ${EQ_PRESETS.map(p => html`<option value="${p.name}">${p.name}</option>`)}
        </select>

        ${this.advanced ? html`<canvas></canvas>` : ''}
        
        <div class="knobs-container">
          ${this.advanced ? this.renderAdvancedKnobs() : this.renderSimpleKnobs()}
        </div>

        <button id="advanced-btn" 
                class=${this.advanced ? 'active' : ''} 
                @click=${this.toggleAdvanced}
                title="Advanced EQ"></button>
      </div>
    `;
  }

  renderSimpleKnobs() {
    return html`
      <div class="knob-wrapper">
        <weight-knob .value=${this.low} color="#ff0000" @input=${(e: CustomEvent) => this.handleSimpleInput(e, 'low')}></weight-knob>
        <span class="label">LOW</span>
      </div>
      <div class="knob-wrapper">
        <weight-knob .value=${this.mid} color="#ffff00" @input=${(e: CustomEvent) => this.handleSimpleInput(e, 'mid')}></weight-knob>
        <span class="label">MID</span>
      </div>
      <div class="knob-wrapper">
        <weight-knob .value=${this.high} color="#00ffff" @input=${(e: CustomEvent) => this.handleSimpleInput(e, 'high')}></weight-knob>
        <span class="label">HIGH</span>
      </div>
    `;
  }

  renderAdvancedKnobs() {
    const labels = ['60', '150', '400', '1k', '2.4k', '6k', '15k'];
    return this.bands.map((_, i) => html`
      <div class="knob-wrapper">
        <weight-knob 
            .value=${this.getKnobValue(i)} 
            color="#ff4400" 
            @input=${(e: CustomEvent) => this.handleAdvancedInput(e, i)}>
        </weight-knob>
        <span class="label">${labels[i]}</span>
      </div>
    `);
  }
}