
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('audio-editor-modal')
export class AudioEditorModal extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2500;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(4px);
    }
    :host([open]) {
      pointer-events: auto;
      opacity: 1;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
    }

    .modal-content {
      position: relative;
      width: min(700px, 90vw);
      background: linear-gradient(180deg, #2b2b2b 0%, #1a1a1a 100%);
      border: 1px solid #444;
      border-radius: 6px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1);
      padding: 2px; /* Inner bezel */
      display: flex;
      flex-direction: column;
      transform: scale(0.95);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    :host([open]) .modal-content {
      transform: scale(1);
    }

    .header-bar {
      background: #111;
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #333;
      border-radius: 4px 4px 0 0;
    }
    
    .brand {
      font-family: 'Roboto Condensed', sans-serif;
      font-weight: 700;
      font-size: 16px;
      color: #ccc;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand span { color: var(--accent-glow, #ffbd00); }
    
    .close-btn {
      background: none;
      border: none;
      color: #666;
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
    }
    .close-btn:hover { color: #fff; }

    .main-display {
      background: #000;
      height: 200px;
      position: relative;
      border-bottom: 1px solid #333;
      margin: 10px;
      border: 1px solid #333;
      border-radius: 2px;
    }
    
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: text;
    }

    .toolbar {
      padding: 15px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #222;
      border-radius: 0 0 4px 4px;
    }

    .section-title {
      font-family: 'Roboto Mono', monospace;
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: block;
    }

    .btn-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    button.tool-btn {
      background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
      border: 1px solid #111;
      border-top: 1px solid #444;
      color: #aaa;
      padding: 6px 12px;
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 11px;
      text-transform: uppercase;
      border-radius: 3px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
      flex-grow: 1;
    }

    button.tool-btn:active {
      background: #222;
      transform: translateY(1px);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }
    
    button.tool-btn.active {
      color: var(--accent-glow, #ffbd00);
      border-color: var(--accent-glow, #ffbd00);
      background: #222;
      box-shadow: inset 0 0 5px rgba(255,189,0,0.2);
    }

    button.process-btn {
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      width: 100%;
      padding: 10px;
      margin-top: 10px;
      color: #fff;
      font-weight: bold;
      border: 1px solid #000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.5);
    }
    
    button.process-btn:hover {
      filter: brightness(1.2);
    }

    .transport-controls {
      position: absolute;
      bottom: 10px;
      left: 10px;
      display: flex;
      gap: 5px;
    }
    
    .time-code {
      position: absolute;
      top: 5px;
      right: 5px;
      font-family: 'Roboto Mono', monospace;
      font-size: 10px;
      color: var(--accent-glow, #ffbd00);
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ attribute: false }) audioBuffer: AudioBuffer | null = null;
  @property({ attribute: false }) audioContext: AudioContext | null = null;

  @query('canvas') private canvas?: HTMLCanvasElement;
  private canvasCtx?: CanvasRenderingContext2D;

  @state() private selectionStart = 0; // 0-1
  @state() private selectionEnd = 1;   // 0-1
  @state() private isPlaying = false;
  @state() private activeStems = new Set<string>();
  
  private playbackSource: AudioBufferSourceNode | null = null;
  private isDragging = false;

  updated(changed: Map<string, unknown>) {
    if (changed.has('open') && this.open) {
      setTimeout(() => this.resizeCanvas(), 50);
    }
    if (changed.has('audioBuffer') && this.audioBuffer) {
      this.drawWaveform();
    }
  }

  private resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
      this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
      this.canvasCtx = this.canvas.getContext('2d')!;
      this.drawWaveform();
    }
  }

  private close() {
    this.stopPlayback();
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('close'));
  }

  private drawWaveform() {
    if (!this.canvasCtx || !this.canvas || !this.audioBuffer) return;
    const ctx = this.canvasCtx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const data = this.audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / w);

    // Background Grid
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    for(let i=0; i<w; i+=50) { ctx.moveTo(i,0); ctx.lineTo(i,h); }
    ctx.stroke();

    // Waveform
    ctx.strokeStyle = '#00ffaa'; // Cyber green
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Draw center line
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);

    for (let i = 0; i < w; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const idx = (i * step) + j;
        if (idx < data.length) {
            const datum = data[idx];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
      }
      // Simple visualization
      const yMin = (1 + min) * h / 2;
      const yMax = (1 + max) * h / 2;
      ctx.moveTo(i, yMin);
      ctx.lineTo(i, yMax);
    }
    ctx.stroke();

    // Selection Overlay
    const sX = this.selectionStart * w;
    const eX = this.selectionEnd * w;
    const selW = eX - sX;
    
    ctx.fillStyle = 'rgba(255, 189, 0, 0.2)'; // Accent color alpha
    ctx.fillRect(sX, 0, selW, h);
    
    ctx.strokeStyle = '#ffbd00';
    ctx.lineWidth = 2;
    ctx.strokeRect(sX, 0, selW, h);
    
    // Time markers
    ctx.fillStyle = '#ffbd00';
    ctx.font = '10px monospace';
    if (this.audioBuffer) {
        const dur = this.audioBuffer.duration;
        ctx.fillText((this.selectionStart * dur).toFixed(2) + 's', sX + 2, 12);
        if (selW > 40) ctx.fillText((this.selectionEnd * dur).toFixed(2) + 's', eX - 35, h - 5);
    }
  }

  private handleCanvasDown(e: PointerEvent) {
    if (!this.audioBuffer) return;
    this.isDragging = true;
    const rect = this.canvas!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    this.selectionStart = Math.max(0, Math.min(1, x));
    this.selectionEnd = this.selectionStart;
    this.drawWaveform();
  }

  private handleCanvasMove(e: PointerEvent) {
    if (!this.isDragging || !this.audioBuffer) return;
    const rect = this.canvas!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    this.selectionEnd = Math.max(0, Math.min(1, x));
    this.drawWaveform();
  }

  private handleCanvasUp() {
    this.isDragging = false;
    if (this.selectionStart > this.selectionEnd) {
      const temp = this.selectionStart;
      this.selectionStart = this.selectionEnd;
      this.selectionEnd = temp;
    }
    this.drawWaveform();
    // Auto preview on select?
    // this.playSelection(); 
  }

  private toggleStem(stem: string) {
      if (this.activeStems.has(stem)) this.activeStems.delete(stem);
      else this.activeStems.add(stem);
      (this as any).requestUpdate();
      // In a real app, this would route channels or process audio
  }
  
  private playSelection() {
      if (!this.audioContext || !this.audioBuffer) return;
      this.stopPlayback();
      
      const start = this.selectionStart * this.audioBuffer.duration;
      const end = this.selectionEnd * this.audioBuffer.duration;
      
      this.playbackSource = this.audioContext.createBufferSource();
      this.playbackSource.buffer = this.audioBuffer;
      this.playbackSource.connect(this.audioContext.destination);
      this.playbackSource.start(0, start, end - start);
      this.playbackSource.onended = () => {
          this.isPlaying = false;
          (this as any).requestUpdate();
      };
      this.isPlaying = true;
  }
  
  private stopPlayback() {
      if (this.playbackSource) {
          this.playbackSource.stop();
          this.playbackSource = null;
      }
      this.isPlaying = false;
  }

  render() {
    return html`
      <div class="overlay" @click=${this.close}></div>
      <div class="modal-content">
        <div class="header-bar">
          <div class="brand">NoDAW <span>ENGINE</span></div>
          <button class="close-btn" @click=${this.close}>×</button>
        </div>

        <div class="main-display">
           <canvas 
              @pointerdown=${this.handleCanvasDown}
              @pointermove=${this.handleCanvasMove}
              @pointerup=${this.handleCanvasUp}>
           </canvas>
           <div class="time-code">
               ${this.isPlaying ? 'PLAYING' : 'READY'}
           </div>
           <div class="transport-controls">
               <button class="tool-btn ${this.isPlaying ? 'active' : ''}" @click=${this.isPlaying ? this.stopPlayback : this.playSelection}>
                 ${this.isPlaying ? 'STOP' : 'PLAY'}
               </button>
           </div>
        </div>

        <div class="toolbar">
           <div class="tool-group">
               <span class="section-title">Stem Splitter</span>
               <div class="btn-group">
                  ${['BASS', 'DRUMS', 'MELODY', 'VOCAL'].map(s => html`
                    <button class="tool-btn ${this.activeStems.has(s) ? 'active' : ''}" 
                            @click=${() => this.toggleStem(s)}>
                      ${s}
                    </button>
                  `)}
               </div>
           </div>
           
           <div class="tool-group">
               <span class="section-title">Mastering</span>
               <button class="process-btn">
                   ONE-CLICK MIX & MASTER
               </button>
           </div>
        </div>
      </div>
    `;
  }
}

declare global {
    interface HTMLElementTagNameMap {
        'audio-editor-modal': AudioEditorModal;
    }
}
