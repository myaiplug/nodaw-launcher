
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, svg, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

/** A knob for adjusting and visualizing prompt weight. */
@customElement('weight-knob')
export class WeightKnob extends LitElement {
  static styles = css`
    :host {
      cursor: grab;
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
    }
    :host(:active) {
      cursor: grabbing;
    }
    
    .knob-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    svg {
      width: 90%;
      height: 90%;
      overflow: visible;
      display: block;
      filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.4));
    }
    
    .knob-indicator {
        transition: filter 0.2s, opacity 0.2s;
    }
    
    :host(:hover) .knob-indicator {
        filter: drop-shadow(0 0 3px var(--knob-color)) drop-shadow(0 0 6px var(--knob-color));
        opacity: 1;
    }
  `;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 2;
  @property({ type: String }) color = '#000';
  @property({ type: Number }) audioLevel = 0;
  @property({ type: String }) knobStyle = 'metallic'; 

  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartValue = 0;
  private isInteracting = false;
  
  private _uniqueId = `k${Math.random().toString(36).substr(2, 9)}`;

  constructor() {
    super();
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  private handlePointerDown(e: PointerEvent) {
    e.preventDefault();
    this.setPointerCapture(e.pointerId);
    
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartValue = this.value;
    this.isInteracting = true;

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('interaction-start', { bubbles: true, composed: true }));
  }

  private handlePointerMove(e: PointerEvent) {
    if (!this.isInteracting) return;
    
    // Sensitivity adjustment for mobile and fine control
    // Vertical dragging is standard, Horizontal dragging added as requested
    const deltaX = e.clientX - this.dragStartX;
    const deltaY = this.dragStartY - e.clientY; // Invert Y
    
    // Use the dominant axis or a weighted sum for "natural" feel
    const totalDelta = deltaX + deltaY;
    
    const range = this.max - this.min;
    // Lower divisor means higher sensitivity
    const sensitivity = (range / 400); 
    
    const newValue = Math.max(this.min, Math.min(this.max, this.dragStartValue + totalDelta * sensitivity));
    
    if (newValue !== this.value) {
        this.value = newValue;
        (this as unknown as HTMLElement).dispatchEvent(new CustomEvent<number>('input', { 
            detail: this.value,
            bubbles: true,
            composed: true
        }));
    }
  }

  private handlePointerUp(e: PointerEvent) {
    this.isInteracting = false;
    try {
      this.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if capture was already lost
    }
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('interaction-end', { bubbles: true, composed: true }));
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY;
    const range = this.max - this.min;
    this.value = Math.max(this.min, Math.min(this.max, this.value + delta * -0.0005 * range));
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent<number>('input', { detail: this.value }));
  }

  render() {
    const minAngle = -135;
    const maxAngle = 135;
    const range = maxAngle - minAngle;
    const progress = (this.value - this.min) / (this.max - this.min);
    const angle = minAngle + progress * range;

    const rotationStyle = styleMap({
      transform: `rotate(${angle}deg)`,
      transformOrigin: '50% 50%',
      '--knob-color': this.color
    });

    const isActive = this.value > (this.min + (this.max - this.min) * 0.01) || this.isInteracting;
    
    return html`
      <div class="knob-container" 
           @pointerdown=${this.handlePointerDown} 
           @wheel=${this.handleWheel}>
        <svg viewBox="0 0 100 100">
            ${this.renderDefs()}
            <g style=${rotationStyle}>
                ${this.renderKnobBody()}
                ${this.renderIndicator(isActive)}
            </g>
        </svg>
      </div>
    `;
  }
  
  renderDefs() {
      const uid = this._uniqueId;
      return svg`
          <defs>
            <linearGradient id="knobCylinder-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#111" />
              <stop offset="50%" stop-color="#444" />
              <stop offset="100%" stop-color="#111" />
            </linearGradient>
            <radialGradient id="knobFace-${uid}" cx="50%" cy="50%" r="50%">
               <stop offset="0%" stop-color="#444" />
               <stop offset="90%" stop-color="#111" />
               <stop offset="100%" stop-color="#000" />
            </radialGradient>
            <radialGradient id="rubberBody-${uid}" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stop-color="#2a2a2a" />
                <stop offset="100%" stop-color="#050505" />
            </radialGradient>
            <filter id="glow-${uid}">
               <feGaussianBlur stdDeviation="1.5" result="blur"/>
               <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
      `;
  }

  renderKnobBody() {
      const style = this.knobStyle || 'metallic';
      const uid = this._uniqueId;
      const r = 45; 
      
      if (style === 'soft-touch') {
          return svg`
              <circle cx="50" cy="50" r="${r}" fill="url(#rubberBody-${uid})" stroke="#000" stroke-width="1.5"/>
              <circle cx="50" cy="50" r="${r-4}" fill="none" stroke="#111" stroke-width="2" stroke-dasharray="1 4"/>
          `;
      }

      return svg`
          <circle cx="50" cy="50" r="${r}" fill="url(#knobCylinder-${uid})" stroke="#000" stroke-width="0.5"/>
          <circle cx="50" cy="50" r="${r-5}" fill="url(#knobFace-${uid})" stroke="#000" stroke-width="0.5"/>
      `;
  }

  renderIndicator(isActive: boolean) {
      const color = isActive ? this.color : '#444';
      const opacity = isActive ? 1.0 : 0.4;
      const glow = isActive ? `url(#glow-${this._uniqueId})` : 'none';
      
      return svg`
        <path class="knob-indicator" d="M48 12 L52 12 L52 28 L48 28 Z" 
              fill="${color}" 
              filter="${glow}" 
              opacity="${opacity}"/>
      `;
  }
}
