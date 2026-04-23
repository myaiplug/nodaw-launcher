

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('vertical-fader')
export class VerticalFader extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      min-height: 150px;
      width: 100%; /* Fill container */
      touch-action: none;
      user-select: none;
      position: relative;
    }
    
    .clip-led {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #300;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.8);
        margin-bottom: 5px;
        position: absolute;
        top: -10px;
        right: 10px;
        transition: background 0.1s;
    }
    .clip-led.clipping {
        background: #f00;
        box-shadow: 0 0 5px #f00;
    }
    
    .fader-body {
      position: relative;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      width: 100%;
    }
    
    .track-container {
      position: relative;
      width: 8px; 
      height: 100%;
      background: #0a0a0a;
      border-radius: 4px;
      /* Deep recessed groove look */
      box-shadow: 
        inset 2px 2px 5px rgba(0,0,0,0.9), 
        inset -1px -1px 2px rgba(255,255,255,0.05),
        0 1px 0 rgba(255,255,255,0.1);
      border: 1px solid rgba(0,0,0,0.8);
      cursor: ns-resize;
      overflow: hidden; /* For meter bar clipping */
      z-index: 1;
    }
    
    /* VU Meter Bar inside track */
    .meter-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, #00ff00 0%, #ffff00 70%, #ff0000 100%);
        opacity: 0.6;
        pointer-events: none;
        transition: height 0.05s linear;
    }
    
    /* MIDI Learn visual for track */
    :host([learning]) .track-container {
        border: 1px solid #ff9800;
        cursor: pointer;
    }
    :host([waiting]) .track-container {
        background: rgba(255, 152, 0, 0.2);
        animation: pulse 1s infinite;
    }

    .ticks {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
      height: 100%;
    }
    
    .ticks.left {
      right: 50%;
      margin-right: 12px; /* Distance from track center */
      align-items: flex-end;
    }
    
    .ticks.right {
      left: 50%;
      margin-left: 12px; /* Distance from track center */
      align-items: flex-start;
    }

    .tick-row {
      display: flex;
      align-items: center;
      height: 1px;
    }
    .tick-mark {
      width: 4px;
      height: 1px;
      background: var(--border-light);
      opacity: 0.3;
      box-shadow: 0 1px 0 rgba(0,0,0,0.5);
    }
    .tick-row.major .tick-mark {
      width: 8px;
      background: var(--text-dim);
      opacity: 0.8;
    }
    
    /* The Fader Cap */
    .fader-cap {
      position: absolute;
      left: 50%;
      transform: translate(-50%, 50%);
      
      /* Rectangle shape: Wider than tall */
      width: 44px; 
      height: 24px;
      
      /* Rich 3D Gradient */
      background: linear-gradient(180deg, 
        var(--knob-rim-start) 0%, 
        var(--knob-face-start) 5%, 
        var(--knob-face-end) 45%, 
        var(--knob-face-end) 55%, 
        var(--knob-face-start) 95%, 
        var(--knob-rim-end) 100%);
        
      border-radius: 3px;
      border-top: 1px solid rgba(255,255,255,0.4);
      border-bottom: 1px solid rgba(0,0,0,0.8);
      border-left: 1px solid rgba(0,0,0,0.5);
      border-right: 1px solid rgba(0,0,0,0.5);
      
      /* Strong Drop Shadow for lift */
      box-shadow: 
        0 6px 12px rgba(0,0,0,0.7),
        0 2px 4px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.3),
        inset 0 0 5px rgba(0,0,0,0.2);
        
      cursor: grab;
      z-index: 2;
      transition: border-color 0.2s;
    }
    
    /* Ridges / Grip Texture on Cap */
    .fader-cap::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: repeating-linear-gradient(
        90deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.1) 3px,
        rgba(0,0,0,0.1) 4px
      );
      opacity: 0.5;
      border-radius: 2px;
    }
    
    /* Center Line */
    .fader-cap::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 15%;
      right: 15%;
      height: 2px;
      background: #000;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      transform: translateY(-50%);
      border-radius: 1px;
      transition: all 0.2s ease;
      z-index: 2;
    }

    /* Hover/Active Glow on the LINE only */
    .fader-cap:hover::after,
    .fader-cap.interacting::after {
      background: var(--accent-glow);
      box-shadow: 
        0 0 5px var(--accent-glow), 
        0 0 10px var(--accent-glow);
      border-bottom: none;
    }
    
    /* MIDI Mapping Visuals */
    :host([learning]) .fader-cap {
        border-color: #ff9800;
    }
    :host([waiting]) .fader-cap {
        background: #ff9800;
    }

    .fader-cap:active {
      cursor: grabbing;
    }
    
    /* Floating Tooltip */
    .tooltip {
      position: absolute;
      right: 115%; /* Left side of cap */
      top: 50%;
      transform: translateY(-50%);
      background: rgba(10, 10, 10, 0.9);
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Roboto Mono', monospace;
      font-size: 11px;
      font-weight: bold;
      pointer-events: none;
      white-space: nowrap;
      
      opacity: 0;
      transition: opacity 0.2s ease;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    
    .fader-cap.interacting .tooltip {
      opacity: 1;
    }
    
    .label {
      margin-top: 10px;
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 10px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
      opacity: 0.8;
      text-align: center;
      width: 100%;
    }
    
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
  `;

  @property({ type: Number }) value = 0; 
  @property({ type: Number }) audioLevel = 0; 
  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) learning = false;
  @property({ type: Boolean, reflect: true }) waiting = false;
  
  @state() private isInteracting = false;
  
  private dragStartY = 0;
  private dragStartValue = 0;

  constructor() {
    super();
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  private handlePointerDown(e: PointerEvent) {
    e.preventDefault();
    this.isInteracting = true;
    this.dragStartY = e.clientY;
    this.dragStartValue = this.value;
    
    const target = e.target as HTMLElement;
    if (target.classList.contains('track-container')) {
        const rect = target.getBoundingClientRect();
        const effectiveHeight = rect.height; 
        const offset = e.clientY - rect.top;
        const percent = 1 - (offset / effectiveHeight);
        
        this.updateValue(percent);
        this.dragStartValue = this.value; 
    }

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
  }

  private handlePointerMove(e: PointerEvent) {
    const deltaY = this.dragStartY - e.clientY;
    const trackHeight = (this as unknown as HTMLElement).shadowRoot?.querySelector('.track-container')?.clientHeight || 150;
    const deltaPercent = deltaY / trackHeight;
    this.updateValue(this.dragStartValue + deltaPercent);
  }

  private updateValue(val: number) {
      const clamped = Math.max(0, Math.min(1, val));
      this.value = clamped;
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('input', { detail: this.value }));
  }

  private handlePointerUp() {
    this.isInteracting = false;
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
  }
  
  render() {
    const percent = this.value * 100;
    const capStyle = styleMap({
        bottom: `${percent}%`
    });

    const displayValue = Math.round(this.value * 100);
    const isClipping = this.audioLevel > 0.95;
    const meterHeight = Math.min(100, this.audioLevel * 100);

    return html`
      <div class="clip-led ${isClipping ? 'clipping' : ''}"></div>
      
      <div class="fader-body">
          <!-- Left Ticks -->
          <div class="ticks left">
              ${[...Array(11)].map((_, i) => html`
                  <div class="tick-row ${i % 2 === 0 ? 'major' : ''}">
                    <div class="tick-mark"></div>
                  </div>`
              )}
          </div>
          
          <!-- Track -->
          <div class="track-container" 
               @pointerdown=${this.handlePointerDown}
               @pointerenter=${() => this.isInteracting = true}
               @pointerleave=${() => { if ((this as unknown as HTMLElement).shadowRoot?.activeElement === null && !this.dragStartY) this.isInteracting = false; }}>
               
            <div class="meter-bar" style="height: ${meterHeight}%"></div>
            
            <div class="fader-cap ${classMap({ interacting: this.isInteracting })}" style=${capStyle}>
                <div class="tooltip">${displayValue}</div>
            </div>
          </div>
          
          <!-- Right Ticks -->
          <div class="ticks right">
              ${[...Array(11)].map((_, i) => html`
                  <div class="tick-row ${i % 2 === 0 ? 'major' : ''}">
                    <div class="tick-mark"></div>
                  </div>`
              )}
          </div>
      </div>
      
      ${this.label ? html`<div class="label">${this.label}</div>` : ''}
    `;
  }
}
