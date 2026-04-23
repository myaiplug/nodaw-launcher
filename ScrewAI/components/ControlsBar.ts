






/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { PlaybackState } from '../types';

@customElement('controls-bar')
export class ControlsBar extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: var(--bg-controls);
      border-top: 1px solid var(--border-light); /* Highlight at top */
      border-bottom: 1px solid var(--border-dark);
      /* Rounded BOTTOM corners */
      border-radius: 0 0 4px 4px; 
      padding: 1vmin 2vmin;
      box-sizing: border-box;
      box-shadow: 
        var(--shadow-inset),
        0 1px 0 rgba(255,255,255,0.05); 
      gap: 2vmin;
      margin-bottom: 0 !important; /* Override layout margin */
      margin-top: 0; /* Tighten spacing to MyAiPlug logo */
    }

    .transport {
      display: flex;
      gap: 1vmin; 
      align-items: center;
    }
    
    .right-controls {
      display: flex;
      gap: 1vmin;
      align-items: center;
    }

    button {
      /* Base Metallic/Plastic Gradient */
      background: linear-gradient(180deg, var(--bg-rack-unit) 0%, #222 100%);
      border: 1px solid var(--border-dark);
      border-top: 1px solid var(--border-light);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      
      width: 26px; 
      height: 26px;
      
      padding: 0;
      
      /* 3D Bevel Shadow */
      box-shadow: 
        0 2px 4px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.1);
        
      transition: all 0.1s;
      position: relative;
    }

    button:active {
      transform: translateY(1px);
      /* Pressed in look */
      box-shadow: 
        inset 0 2px 4px rgba(0,0,0,0.6),
        0 0 1px rgba(255,255,255,0.1);
      background: linear-gradient(180deg, #1a1a1a 0%, #222 100%);
      border-top: 1px solid var(--border-dark);
    }

    button svg {
      width: 65%;
      height: 65%;
      fill: var(--text-dim);
      filter: drop-shadow(0 1px 1px rgba(255,255,255,0.1)) drop-shadow(0 -1px 1px rgba(0,0,0,0.8));
      transition: fill 0.2s;
    }
    
    button:hover {
        background: linear-gradient(180deg, #444 0%, #2a2a2a 100%);
    }
    
    button:hover svg {
      fill: var(--text-main);
    }
    
    /* Color Specific Hovers on Icons */
    button.play-btn:hover svg { fill: #00ff00; filter: drop-shadow(0 0 5px rgba(0,255,0,0.6)); }
    button.stop-btn:hover svg { fill: #ff0000; filter: drop-shadow(0 0 5px rgba(255,0,0,0.6)); }
    
    #btn-loop:hover svg {
      fill: #00ff00;
      filter: drop-shadow(0 0 5px #00ff00);
    }
    
    /* Mapping States */
    button.mappable {
      border-color: #ff9800; 
    }
    button.waiting {
      background: #ff9800;
      animation: pulse 1s infinite;
      box-shadow: 0 0 10px #ff9800;
    }
    button.waiting svg { fill: #000; }

    /* Record Button */
    #btn-record:hover svg circle {
      fill: #ff0000;
      filter: drop-shadow(0 0 6px #f00);
    }
    #btn-record.recording svg circle {
      fill: #ff0000;
      filter: drop-shadow(0 0 8px #f00);
      animation: pulse-red 2s infinite;
    }
    @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    
    #btn-loop.active svg {
      fill: var(--accent-glow);
      filter: drop-shadow(0 0 5px var(--accent-glow));
    }

    /* Mixer Button */
    #btn-mixer.active {
      background: linear-gradient(180deg, #111 0%, #222 100%);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
      border-color: var(--text-highlight);
    }
    #btn-mixer.active svg {
      fill: var(--text-highlight);
      filter: drop-shadow(0 0 4px rgba(255,255,255,0.5));
    }
    
    #btn-mixer svg {
        transform: rotate(90deg);
    }
    
    /* Bottle Icon Button */
    .bottle-icon svg path.liquid-fill {
        fill: #7C4DFF !important;
        opacity: 0.8;
    }
    .bottle-icon:hover svg path.liquid-fill {
        fill: #9966FF !important;
        filter: drop-shadow(0 0 4px #7C4DFF);
    }

    /* BPM Container */
    .bpm-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #000;
      border: 1px solid var(--border-dark);
      border-bottom: 1px solid var(--border-light); /* Highlight at bottom for recessed look */
      border-radius: 4px;
      padding: 4px 6px; 
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.8);
      cursor: ns-resize;
      user-select: none;
      min-width: 50px;
      position: relative;
    }
    
    .bpm-label {
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 9px;
      color: #666;
      letter-spacing: 0.1em;
      line-height: 1;
      margin-bottom: 2px;
    }
    
    .bpm-value {
      font-family: 'Roboto Mono', monospace;
      font-size: 12px; 
      color: #ff0000; /* LED Red */
      text-shadow: 0 0 5px rgba(255,0,0,0.6);
      line-height: 1.2;
      margin-bottom: 2px;
    }
    
    :host-context(body.light-mode) .bpm-value {
        color: #00aa00; 
        text-shadow: 0 0 5px rgba(0,255,0,0.4);
    }
    
    /* LEDs */
    .led-row {
        display: flex;
        gap: 4px;
        margin-top: 2px;
    }
    .led {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #333;
        box-shadow: inset 0 0 1px rgba(0,0,0,0.8);
    }
    .led.green { background: #004400; }
    .led.yellow { background: #444400; }
    .led.red { background: #440000; }
    
    /* Animate LEDs based on playback state (simple visual) */
    .playing .led.green { background: #00ff00; box-shadow: 0 0 4px #00ff00; }
    .playing .led.yellow { background: #ffff00; box-shadow: 0 0 4px #ffff00; }
    .playing .led.red { background: #ff0000; box-shadow: 0 0 4px #ff0000; }

    /* Settings Sprocket */
    .settings-btn {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        overflow: visible;
        margin-right: -0.5vmin; /* Pull closer to BPM */
    }
    
    .settings-btn svg {
        width: 70%;
        height: 70%;
        transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.3s;
    }
    
    .settings-btn:hover svg {
        transform: rotate(360deg);
        fill: var(--accent-glow);
        filter: drop-shadow(0 0 5px var(--accent-glow));
    }
    
    .settings-btn:active svg {
        transition: transform 0.1s;
        transform: rotate(370deg) scale(0.9);
    }
    
    /* Brand Logo Styles (Ported) */
    .brand-link {
        display: flex;
        align-items: center;
        gap: 0.8vmin;
        text-decoration: none;
        justify-content: center;
    }
    
    .logo-container {
        position: relative;
    }
    
    .icon-box {
        width: 2vmin;
        height: 2vmin;
        min-width: 20px;
        min-height: 20px;
        border-radius: 6px;
        background: linear-gradient(135deg, #7C4DFF, #00FFFF);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }
    
    .icon-glow {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: 6px;
        background: linear-gradient(135deg, #7C4DFF, #00FFFF);
        opacity: 0.5;
        filter: blur(4px);
        transition: opacity 0.3s;
        z-index: -1;
    }
    
    .brand-link:hover .icon-glow {
        opacity: 0.8;
    }
    
    .logo-text {
        font-family: 'Google Sans', sans-serif;
        font-size: 1.2vmin;
        font-weight: 700;
        color: var(--text-main);
    }
    
    .text-accent {
        color: #00FFFF;
    }

  `;

  @property({ type: String }) playbackState: PlaybackState = 'stopped';
  @property({ type: Boolean }) learning = false;
  @property({ type: String }) waitingFor: string | null = null;
  @property({ type: Boolean }) mixerOpen = false;
  @property({ type: String }) appMode = 'rack';
  
  @property({ type: Number }) bpm = 120;
  
  @state() private recording = false;
  @state() private looping = false;
  
  private dragStartY = 0;
  private startBpm = 0;

  constructor() {
    super();
    this.handleBpmDown = this.handleBpmDown.bind(this);
    this.handleBpmMove = this.handleBpmMove.bind(this);
    this.handleBpmUp = this.handleBpmUp.bind(this);
  }

  private togglePlay() {
    if (this.learning) return this.emitMappingRequest('play');
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('play-pause'));
  }

  private stop() {
    if (this.learning) return this.emitMappingRequest('stop');
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('stop'));
  }

  public toggleRecord() {
    if (this.learning) return this.emitMappingRequest('record');
    this.recording = !this.recording;
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('record-toggle'));
  }
  
  public clickLoop() {
    this.toggleLoop();
  }

  private toggleLoop() {
    if (this.learning) return this.emitMappingRequest('loop');
    this.looping = !this.looping;
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('loop-toggle', { detail: this.looping }));
  }
  
  private toggleMixer() {
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('mixer-toggle', { detail: !this.mixerOpen }));
  }
  
  private openSettings() {
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('open-settings'));
  }
  
  private switchView() {
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('switch-view'));
  }
  
  private emitMappingRequest(action: string) {
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('mapping-request', { detail: action }));
  }

  private handleBpmDown(e: PointerEvent) {
    e.preventDefault();
    this.dragStartY = e.clientY;
    this.startBpm = this.bpm;
    window.addEventListener('pointermove', this.handleBpmMove);
    window.addEventListener('pointerup', this.handleBpmUp);
    document.body.style.cursor = 'ns-resize';
  }

  private handleBpmMove(e: PointerEvent) {
    const delta = this.dragStartY - e.clientY;
    const change = Math.floor(delta * 0.5);
    this.bpm = Math.max(60, Math.min(200, this.startBpm + change));
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('bpm-change', { detail: this.bpm }));
  }

  private handleBpmUp() {
    window.removeEventListener('pointermove', this.handleBpmMove);
    window.removeEventListener('pointerup', this.handleBpmUp);
    document.body.style.cursor = '';
  }

  render() {
    const isPlaying = this.playbackState === 'playing';
    const btnClass = (action: string) => classMap({
        'mappable': this.learning,
        'waiting': this.learning && this.waitingFor === action
    });
    
    return html`
      <div class="transport">
        <button 
            @click=${this.togglePlay} 
            class="${btnClass('play')} play-btn"
            title=${isPlaying ? "Pause" : "Play"}>
           ${isPlaying 
             ? html`<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>` 
             : html`<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>`}
        </button>
        
        <button 
            @click=${this.stop} 
            class="${btnClass('stop')} stop-btn"
            title="Stop">
          <svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
        </button>
        
        <button id="btn-record" 
                class=${classMap({ recording: this.recording, ...btnClass('record') })} 
                @click=${this.toggleRecord} 
                title="Record">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>
        </button>
        
        <button id="btn-loop"
                class=${classMap({ active: this.looping, ...btnClass('loop') })}
                @click=${this.toggleLoop}
                title="Loop 8 Bars">
           <svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
        </button>
        
        <!-- Only show in rack mode -->
        ${this.appMode === 'rack' ? html`
            <button class="bottle-icon" @click=${this.switchView} title="Back to Processor">
                <svg viewBox="0 0 24 24">
                    <path d="M7 2h10v3H7z" />
                    <path d="M17 5v2c0 2.21-1.79 4-4 4h-2c-2.21 0-4-1.79-4-4V5H5v2c0 3.31 2.69 6 6 6v7h2v-7c3.31 0 6-2.69 6-6V5h-2z" style="display:none"/>
                    <path d="M6 6 L6 20 Q6 22 8 22 L16 22 Q18 22 18 20 L18 6 Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <path class="liquid-fill" d="M6.5 14 L17.5 14 L17.5 20 Q17.5 21.5 16 21.5 L8 21.5 Q6.5 21.5 6.5 20 Z" />
                </svg>
            </button>
        ` : ''}
      </div>

      <!-- CENTER BRANDING -->
      <a class="brand-link" href="#">
         <div class="logo-container">
             <div class="icon-box">
                <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="12" y="4" width="4" height="8" rx="1" fill="white"></rect>
                    <rect x="24" y="4" width="4" height="8" rx="1" fill="white"></rect>
                    <rect x="10" y="12" width="20" height="16" rx="3" fill="white"></rect>
                    <circle cx="20" cy="20" r="2" fill="#7C4DFF" opacity="0.9"></circle>
                    <path d="M 20 28 Q 20 32, 18 34 Q 16 36, 20 36" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"></path>
                </svg>
             </div>
             <div class="icon-glow"></div>
         </div>
         <span class="logo-text">MyAiPlug<span class="text-accent">™</span></span>
      </a>

      <div class="right-controls">
          <button id="btn-mixer"
                  class=${classMap({ active: this.mixerOpen })}
                  @click=${this.toggleMixer}
                  title="Toggle Mixer View">
              <svg viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3M3 5v2h10V5H3m10 16v-2h8v-2h-8v-2h-2v6h2M7 9v2H3v2h4v2h2V9H7m14 4v-2H11v2h10m-6-4h2V7h4V5h-4V3h-2v6z"/></svg>
          </button>
    
          <!-- Settings Sprocket -->
          <button class="settings-btn" @click=${this.openSettings} title="Settings">
             <svg viewBox="0 0 24 24">
               <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
             </svg>
          </button>
    
          <div class="bpm-container ${isPlaying ? 'playing' : ''}" @pointerdown=${this.handleBpmDown}>
            <div class="bpm-label">BPM</div>
            <div class="bpm-value">${this.bpm}</div>
            <div class="led-row">
                <div class="led green"></div>
                <div class="led yellow"></div>
                <div class="led red"></div>
            </div>
          </div>
      </div>
    `;
  }
}
