






/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { LiveMusicHelper } from '../utils/LiveMusicHelper';
import { audioBufferToWav } from '../utils/audio';

@customElement('recorder-drawer')
export class RecorderDrawer extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: absolute;
      bottom: 100%; 
      left: 0;
      width: 100%;
      height: 0; 
      pointer-events: none; 
      display: flex;
      justify-content: center;
    }
    
    :host([visible]) {
        pointer-events: auto;
    }
    
    #drawer-wrapper {
      position: absolute;
      bottom: 0; 
      width: min(600px, 90%);
      
      background: #0a0a0a; /* Off-Black Background */
      border: 1px solid var(--border-main);
      border-bottom: none;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
      
      transform: translateY(100%); 
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      pointer-events: auto;
      
      display: flex;
      flex-direction: column;
      overflow: visible;
    }

    :host([visible]) #drawer-wrapper {
        transform: translateY(0); 
    }

    /* Pull Tab */
    #tab {
        position: absolute;
        bottom: 100%; /* Sits on top of the wrapper */
        left: 0;
        
        background: var(--tab-bg);
        color: var(--tab-text);
        border: 1px solid var(--border-main);
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        
        /* Match EQ/FX Size/Font */
        padding: 0.6vmin 2vmin;
        font-family: 'Roboto Condensed', sans-serif;
        font-weight: 700;
        font-size: 1.2vmin;
        letter-spacing: 0.1em;
        line-height: 1;
        
        cursor: pointer;
        z-index: 1;
        
        /* 3D Bevel */
        box-shadow: 
            inset 1px 1px 1px rgba(255,255,255,0.7),
            inset -1px 0 1px rgba(0,0,0,0.1),
            0 -2px 4px rgba(0,0,0,0.2);
        text-shadow: 0 1px 0 rgba(255,255,255,0.8);
    }
    #tab:hover { 
        filter: brightness(1.1);
        box-shadow: 
            inset 1px 1px 1px rgba(255,255,255,0.9),
            0 -2px 5px rgba(0,0,0,0.3);
    }

    /* Waveform Container */
    .wave-container {
        position: relative;
        width: 100%;
        height: 8vmin; 
        min-height: 60px;
        background: #050505; /* Deep black for waveform contrast */
        border-radius: 6px 6px 0 0;
        overflow: hidden;
        box-sizing: border-box;
        border-bottom: 1px solid var(--border-dark);
        padding: 5px 0; 
    }

    canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
    }
    
    /* Footer/Controls */
    .footer {
        position: absolute;
        bottom: 5px;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
        box-sizing: border-box;
        pointer-events: none; 
    }

    .status {
        font-family: 'Roboto Mono', monospace;
        color: #f00;
        font-size: 9px;
        background: rgba(0,0,0,0.6);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255,0,0,0.3);
    }
    
    .controls {
        display: flex;
        gap: 6px;
        pointer-events: auto; 
    }
    
    .icon-btn {
        width: 18px; 
        height: 18px;
        border-radius: 50%;
        border: 1px solid var(--border-light);
        background: radial-gradient(circle at 30% 30%, #444, #222);
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 
            0 1px 2px rgba(0,0,0,0.6),
            inset 1px 1px 1px rgba(255,255,255,0.2);
        padding: 3px;
    }
    .icon-btn:hover {
        transform: translateY(-1px);
        filter: brightness(1.2);
        background: radial-gradient(circle at 30% 30%, #555, #333);
    }
    
    /* Specific Colors */
    .icon-btn[title*="Play"]:hover {
        border-color: #0f0;
        color: #0f0;
        box-shadow: 0 0 5px #0f0;
    }
    .icon-btn[title*="Stop"]:hover, .icon-btn.record-stop {
        border-color: #f00;
        color: #f00;
    }
    .icon-btn.record-stop {
        background: radial-gradient(circle, #500, #300);
        animation: pulse-red 2s infinite;
    }
    .icon-btn.record-stop:hover {
         box-shadow: 0 0 8px #f00;
    }
    .icon-btn[title*="Download"]:hover, .icon-btn[title*="Edit"]:hover {
        border-color: #00e5ff;
        color: #00e5ff;
        box-shadow: 0 0 5px #00e5ff;
    }
    .icon-btn[title*="Close"]:hover {
        border-color: #aaa;
        color: #fff;
    }

    .icon-btn svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
    }
    
    @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
  `;

  @property({ type: Boolean, reflect: true }) visible = false;
  @property({ type: Boolean, reflect: true }) recording = false;
  @property({ attribute: false }) liveMusicHelper?: LiveMusicHelper;

  @state() private audioBuffer: AudioBuffer | null = null;
  @state() private playbackSource: AudioBufferSourceNode | null = null;
  @state() private isPlaying = false;
  
  @query('canvas') private canvas?: HTMLCanvasElement;
  private canvasCtx?: CanvasRenderingContext2D;
  private rafId = 0;
  
  private currentAmplitude = 0;
  private wavePoints: number[] = [];
  
  private selectionStart = 0;
  private selectionEnd = 1;
  private isDragging = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }
  
  disconnectedCallback() {
      super.disconnectedCallback();
      cancelAnimationFrame(this.rafId);
  }

  updated(changed: Map<string, unknown>) {
      if (changed.has('visible') && this.visible) {
          this.resizeCanvas();
          if (!this.rafId) this.drawLoop();
      }
      
      if (changed.has('liveMusicHelper') && this.liveMusicHelper) {
          this.liveMusicHelper.addEventListener('recording-data', (e: any) => {
              this.currentAmplitude = e.detail;
              this.wavePoints.push(this.currentAmplitude);
              if (this.wavePoints.length > 800) this.wavePoints.shift();
          });
          
          this.liveMusicHelper.addEventListener('recording-finished', (e: any) => {
             this.recording = false;
             this.audioBuffer = e.detail;
             this.wavePoints = [];
             this.drawStatic();
             this.visible = true; // Auto-show drawer when recording finishes
          });
      }
  }
  
  public startRecording() {
      // Don't auto-show visible = true here
      this.recording = true;
      this.audioBuffer = null;
      this.selectionStart = 0;
      this.selectionEnd = 1;
      this.wavePoints = [];
      if (this.liveMusicHelper) this.liveMusicHelper.startRecording();
  }
  
  public stopRecording() {
      if (this.liveMusicHelper) this.liveMusicHelper.stopRecording();
  }

  private resizeCanvas() {
      if (this.canvas) {
          this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
          this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
          this.canvasCtx = this.canvas.getContext('2d')!;
      }
  }
  
  private drawLoop() {
      this.rafId = requestAnimationFrame(this.drawLoop.bind(this));
      if (this.recording) this.drawLive();
      else if (this.audioBuffer) this.drawStatic();
  }
  
  private getGradient(ctx: CanvasRenderingContext2D, h: number) {
      // MyAiPlug Purple (#bd00ff) to Cyan (#00ffff)
      const grad = ctx.createLinearGradient(0, 0, this.canvas!.width, 0);
      grad.addColorStop(0, '#bd00ff');
      grad.addColorStop(1, '#00ffff');
      return grad;
  }
  
  private drawLive() {
      if (!this.canvasCtx || !this.canvas) return;
      const ctx = this.canvasCtx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      
      ctx.clearRect(0, 0, w, h);
      
      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      for(let x=0; x<w; x+=40) { ctx.moveTo(x,0); ctx.lineTo(x,h); }
      ctx.stroke();
      
      ctx.strokeStyle = this.getGradient(ctx, h);
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const step = w / this.wavePoints.length;
      for(let i=0; i<this.wavePoints.length; i++) {
          const val = this.wavePoints[i];
          const x = i * step;
          const y = h/2 + (val * h * 0.8) * (i % 2 === 0 ? 1 : -1);
          if (i===0) ctx.moveTo(x, h/2);
          ctx.lineTo(x, y);
      }
      ctx.stroke();
  }
  
  private drawStatic() {
      if (!this.canvasCtx || !this.canvas || !this.audioBuffer) return;
      const ctx = this.canvasCtx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const data = this.audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / w);
      
      ctx.clearRect(0, 0, w, h);
      
      // Selection Background
      const sX = this.selectionStart * w;
      const eX = this.selectionEnd * w;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(sX, 0, eX - sX, h);
      
      // Gradient Waveform
      ctx.strokeStyle = this.getGradient(ctx, h);
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let i = 0; i < w; i++) {
          let min = 1.0;
          let max = -1.0;
          for (let j = 0; j < step; j++) {
              const datum = data[(i * step) + j];
              if (datum < min) min = datum;
              if (datum > max) max = datum;
          }
          const yMin = (1 + min) * h / 2;
          const yMax = (1 + max) * h / 2;
          ctx.moveTo(i, yMin);
          ctx.lineTo(i, yMax);
      }
      ctx.stroke();
      
      // Loop Markers
      ctx.strokeStyle = 'var(--text-main)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sX, 0); ctx.lineTo(sX, h);
      ctx.moveTo(eX, 0); ctx.lineTo(eX, h);
      ctx.stroke();
  }
  
  private handleCanvasDown(e: PointerEvent) {
      if (this.recording || !this.audioBuffer) return;
      this.isDragging = true;
      const rect = this.canvas!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      this.selectionStart = Math.max(0, Math.min(1, x));
      this.selectionEnd = this.selectionStart;
  }
  
  private handleCanvasMove(e: PointerEvent) {
      if (!this.isDragging || this.recording) return;
      const rect = this.canvas!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      this.selectionEnd = Math.max(0, Math.min(1, x));
  }
  
  private handleCanvasUp() {
      this.isDragging = false;
      if (this.selectionStart > this.selectionEnd) {
          const temp = this.selectionStart;
          this.selectionStart = this.selectionEnd;
          this.selectionEnd = temp;
      }
      this.playSnippet();
  }
  
  private playSnippet() {
      if (!this.audioBuffer || !this.liveMusicHelper) return;
      this.stopPlayback();
      
      const start = this.selectionStart * this.audioBuffer.duration;
      const end = this.selectionEnd * this.audioBuffer.duration;
      const duration = end - start;
      if (duration < 0.1) return;
      
      this.playbackSource = this.liveMusicHelper.audioContext.createBufferSource();
      this.playbackSource.buffer = this.audioBuffer;
      this.playbackSource.loop = true;
      this.playbackSource.loopStart = start;
      this.playbackSource.loopEnd = end;
      this.playbackSource.connect(this.liveMusicHelper.audioContext.destination);
      this.playbackSource.start(0, start);
      this.isPlaying = true;
      (this as any).requestUpdate();
  }
  
  private stopPlayback() {
      if (this.playbackSource) {
          try {
            this.playbackSource.stop();
            this.playbackSource.disconnect();
          } catch(e) { /* ignore */ }
          this.playbackSource = null;
      }
      this.isPlaying = false;
      (this as any).requestUpdate();
  }
  
  private download() {
      if (!this.audioBuffer) return;
      
      const arr = audioBufferToWav(this.audioBuffer);
      const blob = new Blob([arr], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('request-download', { 
          detail: { url },
          bubbles: true,
          composed: true 
      }));
  }
  
  private openEditor() {
      if (!this.audioBuffer) return;
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('open-editor', { detail: this.audioBuffer }));
  }
  
  private toggleVisible() {
      this.visible = !this.visible;
  }

  render() {
    return html`
      <div id="drawer-wrapper">
         <div id="tab" @click=${this.toggleVisible}>REC</div>
         
         <div class="wave-container">
             <canvas 
                @pointerdown=${this.handleCanvasDown}
                @pointermove=${this.handleCanvasMove}
                @pointerup=${this.handleCanvasUp}>
             </canvas>
             
             <!-- Footer overlaid on waveform -->
             <div class="footer">
                 ${this.recording 
                    ? html`<div class="status">● RECORDING</div>` 
                    : html`<div class="status" style="color: #0f0">READY</div>`
                 }
                 
                 <div class="controls">
                    ${this.recording 
                       ? html`
                           <button class="icon-btn record-stop" @click=${this.stopRecording} title="Stop Recording">
                               <svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                           </button>`
                       : html`
                           <button class="icon-btn" @click=${this.isPlaying ? this.stopPlayback : this.playSnippet} title="${this.isPlaying ? 'Stop' : 'Play Selection'}">
                               ${this.isPlaying 
                                  ? html`<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>` 
                                  : html`<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`}
                           </button>
                           
                           <button class="icon-btn" @click=${this.openEditor} title="Open NoDAW Editor">
                               <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                           </button>
                           
                           <button class="icon-btn" @click=${this.download} title="Download WAV">
                               <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                           </button>
                           
                           <button class="icon-btn" @click=${() => this.visible = false} title="Close Drawer">
                               <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 17.59 13.41 12z"/></svg>
                           </button>
                       `
                    }
                 </div>
             </div>
         </div>
      </div>
    `;
  }
}