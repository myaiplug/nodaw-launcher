
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

@customElement('processing-modal')
export class ProcessingModal extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      z-index: 5000;
      
      /* Default State: Hidden */
      display: none;
      opacity: 0;
      pointer-events: none;
      
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(5px);
      transition: opacity 0.3s ease;
    }
    
    :host([open]) {
        display: flex;
        opacity: 1;
        pointer-events: auto;
    }
    
    .modal-box {
        width: 400px;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        color: #fff;
    }

    h2 {
        margin: 0 0 20px 0;
        font-family: 'Roboto Condensed', sans-serif;
        text-transform: uppercase;
        color: var(--accent-glow, #00FFFF);
    }

    .progress-icons {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .step {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        transition: all 0.5s;
    }
    .step svg { width: 20px; height: 20px; fill: currentColor; }
    
    .step.active {
        background: var(--accent-glow, #7C4DFF);
        color: #fff;
        box-shadow: 0 0 15px var(--accent-glow, #7C4DFF);
    }

    .waveform-preview {
        width: 100%;
        height: 80px;
        background: #000;
        border: 1px solid #333;
        margin-bottom: 20px;
        display: none;
    }
    :host([complete]) .waveform-preview { display: block; }
    
    canvas { width: 100%; height: 100%; }

    .controls {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        display: none;
    }
    :host([complete]) .controls { display: flex; }

    button {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    button:hover { background: #444; }

    .action-btn {
        background: linear-gradient(135deg, #7C4DFF, #00FFFF);
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        color: #000;
        font-weight: bold;
        text-transform: uppercase;
        cursor: pointer;
        font-family: 'Roboto Condensed', sans-serif;
        display: none;
    }
    .action-btn:hover { filter: brightness(1.1); }
    :host([complete]) .action-btn { display: block; }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true }) complete = false;
  @property({ attribute: false }) audioBuffer: AudioBuffer | null = null;
  
  @state() private currentStep = 0;
  @query('canvas') private canvas?: HTMLCanvasElement;
  
  private processTimer: any;
  private isPlaying = false;
  private source: AudioBufferSourceNode | null = null;
  private ctx: AudioContext | null = null;

  updated(changed: Map<string, unknown>) {
      if (changed.has('open') && this.open && !this.complete) {
          this.startSimulation();
      }
      if (changed.has('complete') && this.complete) {
          setTimeout(() => this.drawWaveform(), 50);
      }
  }

  private startSimulation() {
      this.currentStep = 0;
      let step = 0;
      this.processTimer = setInterval(() => {
          step++;
          this.currentStep = step;
          if (step >= 4) {
              clearInterval(this.processTimer);
              this.complete = true;
          }
          (this as any).requestUpdate();
      }, 800); // Simulate processing time
  }

  private drawWaveform() {
      if (!this.canvas || !this.audioBuffer) return;
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      const ctx = this.canvas.getContext('2d')!;
      const data = this.audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / this.canvas.width);
      const h = this.canvas.height;
      
      ctx.fillStyle = '#000';
      ctx.fillRect(0,0,this.canvas.width, h);
      ctx.strokeStyle = '#00FFFF';
      ctx.beginPath();
      
      for(let i=0; i < this.canvas.width; i++) {
          let min = 1.0; let max = -1.0;
          for (let j=0; j<step; j++) {
              const datum = data[(i*step)+j];
              if (datum < min) min = datum;
              if (datum > max) max = datum;
          }
          ctx.moveTo(i, (1+min)*h/2);
          ctx.lineTo(i, (1+max)*h/2);
      }
      ctx.stroke();
  }
  
  private togglePlay() {
      if (!this.ctx) this.ctx = new AudioContext();
      
      if (this.isPlaying) {
          if (this.source) this.source.stop();
          this.isPlaying = false;
      } else {
          if (!this.audioBuffer) return;
          this.source = this.ctx.createBufferSource();
          this.source.buffer = this.audioBuffer;
          this.source.connect(this.ctx.destination);
          this.source.start();
          this.source.onended = () => { this.isPlaying = false; (this as any).requestUpdate(); };
          this.isPlaying = true;
      }
      (this as any).requestUpdate();
  }

  private finish() {
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('finish'));
  }

  render() {
      // Even if render returns null, :host styles apply. CSS handles display:none now.
      if (!this.open) return null;
      
      return html`
        <div class="modal-box">
            <h2>${this.complete ? 'Processing Complete' : 'Slowing Down...'}</h2>
            
            <div class="progress-icons">
                <div class="step ${this.currentStep >= 1 ? 'active' : ''}">
                   <svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg> <!-- Load -->
                </div>
                <div class="step ${this.currentStep >= 2 ? 'active' : ''}">
                   <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg> <!-- Pause/Process -->
                </div>
                <div class="step ${this.currentStep >= 3 ? 'active' : ''}">
                   <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> <!-- Edit -->
                </div>
                <div class="step ${this.currentStep >= 4 ? 'active' : ''}">
                   <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg> <!-- Check -->
                </div>
            </div>

            <div class="waveform-preview">
                <canvas></canvas>
            </div>

            <div class="controls">
                <button @click=${this.togglePlay}>${this.isPlaying ? 'STOP' : 'PLAY PREVIEW'}</button>
            </div>

            <button class="action-btn" @click=${this.finish}>
                EFFECTS > (Mix & Master)
            </button>
        </div>
      `;
  }
}
