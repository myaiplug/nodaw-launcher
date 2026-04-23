

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './VerticalFader';

type EffectType = 'reverb' | 'delay' | 'width';

@customElement('mix-drawer')
export class MixDrawer extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      bottom: 0;
      /* Positioned to the left of the Master Drawer (10vmin width) + 1vmin gap */
      right: 11vmin; 
      width: 10vmin;
      min-width: 80px;
      left: auto;
      
      z-index: 1000; 
      display: flex;
      flex-direction: column;
      align-items: stretch;
      
      transform: translateY(100%); 
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    :host([open]) {
      transform: translateY(0);
    }

    #drawer-body {
      background: var(--bg-drawer);
      border: 1px solid var(--border-main);
      border-bottom: none;
      border-radius: 8px 8px 0 0; 
      padding: 1.5vmin;
      /* Reduced padding to make it touch the bottom */
      padding-bottom: 10px;
      display: flex;
      flex-direction: column;
      gap: 1.5vmin;
      box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
      height: 45vmin;
      align-items: center;
    }

    #tab {
      position: absolute;
      bottom: 100%;
      left: 0;
      width: 100%; /* Full Width */
      box-sizing: border-box;
      
      background: var(--tab-bg);
      color: var(--tab-text);
      
      border: 1px solid var(--border-main);
      border-bottom: none;
      border-radius: 6px 6px 0 0;
      
      padding: 0.8vmin 0;
      cursor: pointer;
      text-align: center;
      
      font-family: 'Roboto Condensed', sans-serif;
      font-weight: 700;
      font-size: 1.3vmin;
      line-height: 1;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      
      z-index: 2;
      
      /* 3D Bevel Match */
      box-shadow: 
        inset 1px 1px 1px rgba(255,255,255,0.7),
        inset -1px 0 1px rgba(0,0,0,0.1),
        0 -2px 4px rgba(0,0,0,0.2);
      text-shadow: 0 1px 0 rgba(255,255,255,0.8);
      
      /* Moved down slightly as requested */
      transform: translateY(9px);
    }
    #tab:hover {
      filter: brightness(1.1);
      box-shadow: 
        inset 1px 1px 1px rgba(255,255,255,0.9),
        0 -2px 5px rgba(0,0,0,0.3);
    }

    .fx-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      color: var(--text-main);
      font-family: 'Roboto Mono', monospace;
      font-size: 1.2vmin;
      margin-bottom: 0.5vmin;
    }

    .arrow-btn {
      background: none;
      border: none;
      color: var(--text-dim);
      cursor: pointer;
      font-size: 1.5vmin;
      padding: 0.2vmin;
    }
    .arrow-btn:hover { color: var(--text-highlight); }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) learning = false;
  @property({ type: String }) waitingFor: string | null = null;
  @property({ type: Number }) audioLevel = 0; // Receive real-time level

  @state() public selectedEffect: EffectType = 'reverb';
  @state() private reverbMix = 0;
  @state() private delayMix = 0;
  @state() private stereoWidth = 0.5;

  private effects: EffectType[] = ['reverb', 'delay', 'width'];

  private toggleOpen() {
    this.open = !this.open;
  }

  private prevEffect() {
    const idx = this.effects.indexOf(this.selectedEffect);
    const newIdx = (idx - 1 + this.effects.length) % this.effects.length;
    this.selectedEffect = this.effects[newIdx];
  }

  private nextEffect() {
    const idx = this.effects.indexOf(this.selectedEffect);
    const newIdx = (idx + 1) % this.effects.length;
    this.selectedEffect = this.effects[newIdx];
  }

  private get displayValue() {
    switch (this.selectedEffect) {
      case 'reverb': return this.reverbMix;
      case 'delay': return this.delayMix;
      case 'width': return this.stereoWidth;
    }
  }

  public handleMixChange(e: CustomEvent) {
    const val = e.detail;
    
    if (this.learning) {
        (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('mapping-request', { detail: this.selectedEffect }));
        return; 
    }

    switch (this.selectedEffect) {
      case 'reverb': this.reverbMix = val; break;
      case 'delay': this.delayMix = val; break;
      case 'width': this.stereoWidth = val; break;
    }
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('fx-change', {
      detail: { type: this.selectedEffect, value: val }
    }));
  }

  render() {
    return html`
      <div id="tab" @click=${this.toggleOpen}>MIX</div>
      <div id="drawer-body">
        <div style="height: 100%; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <vertical-fader 
            .value=${this.displayValue} 
            .audioLevel=${this.audioLevel}
            label=""
            .learning=${this.learning}
            .waiting=${this.learning && this.waitingFor === this.selectedEffect}
            @input=${this.handleMixChange}>
          </vertical-fader>
          
          <!-- Controls placed below fader effectively replacing the static label -->
          <div class="fx-header">
            <button class="arrow-btn" @click=${this.prevEffect}>◀</button>
            <span>${this.selectedEffect.substring(0,3).toUpperCase()}</span>
            <button class="arrow-btn" @click=${this.nextEffect}>▶</button>
          </div>
        </div>
      </div>
    `;
  }
}
