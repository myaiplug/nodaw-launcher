

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { REGION_PRESETS } from '../utils/presets';

@customElement('genre-drawer')
export class GenreDrawer extends LitElement {
  static styles = css`
    :host {
      display: block;
      /* Anchored to bottom right of rack container, moved up to clear Mix/Master */
      position: absolute;
      right: 0;
      bottom: 30%; 
      width: 0;
      height: 0;
      z-index: 5; /* Behind rack */
      overflow: visible;
    }

    #drawer-body {
      background: var(--bg-drawer);
      border: 1px solid var(--border-main);
      border-left: none; 
      border-radius: 0 8px 8px 0;
      padding: 1.5vmin;
      display: flex;
      flex-direction: column;
      gap: 1vmin;
      min-width: 25vmin;
      
      box-shadow: inset 0 0 20px rgba(0,0,0,0.1), 5px 5px 15px rgba(0,0,0,0.3);
      
      /* Position */
      position: absolute;
      right: 0;
      bottom: 0; 
      
      transform: translateX(0); /* Hidden behind rack */
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    :host([open]) #drawer-body {
      transform: translateX(100%); /* Slides OUT to the right */
    }

    #tab {
      position: absolute;
      left: 100%; 
      
      top: 2vmin;
      cursor: pointer;
      background: var(--tab-bg);
      color: var(--tab-text);
      padding: 1.5vmin 0.5vmin;
      border: 1px solid var(--border-main);
      border-left: none;
      border-radius: 0 4px 4px 0;
      writing-mode: vertical-lr; /* Vertical text facing right */
      text-orientation: mixed;
      font-family: 'Roboto Condensed', sans-serif;
      font-weight: 700;
      font-size: 1.2vmin;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      user-select: none;
      
      /* 3D Bevel */
      box-shadow: 
        inset 1px 1px 1px rgba(255,255,255,0.7),
        2px 0 5px rgba(0,0,0,0.2);
        
      margin-left: 2px;
      text-shadow: 0 1px 0 rgba(255,255,255,0.8);
    }
    
    #tab:hover {
      filter: brightness(1.1);
      box-shadow: 
        inset 1px 1px 1px rgba(255,255,255,0.9),
        2px 0 5px rgba(0,0,0,0.4);
    }

    .genre-list {
        display: flex;
        flex-wrap: wrap;
        gap: 1vmin;
        justify-content: center;
    }

    .genre-btn {
        background: var(--bg-rack-unit);
        border: 1px solid var(--border-main);
        border-radius: 4px;
        padding: 1vmin 2vmin;
        cursor: pointer;
        font-family: 'Roboto Condensed', sans-serif;
        font-size: 1.2vmin;
        text-transform: uppercase;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        flex: 1 1 40%;
        text-align: center;
        transition: all 0.2s;
        
        /* 3D Button shading */
        box-shadow: 
            inset 0 1px 0 rgba(255,255,255,0.2),
            0 2px 4px rgba(0,0,0,0.4);
            
        position: relative;
        overflow: hidden;
    }
    
    .genre-btn:hover {
        transform: translateY(-1px);
        box-shadow: 
            inset 0 1px 0 rgba(255,255,255,0.3),
            0 4px 8px rgba(0,0,0,0.6);
        filter: brightness(1.2);
    }
    
    .genre-btn:active {
        transform: translateY(1px);
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
    }
    
    .genre-btn.selected {
        border-color: #fff;
        box-shadow: 0 0 8px rgba(255,255,255,0.5), inset 0 0 10px rgba(0,0,0,0.5);
    }
    
    h3 {
        margin: 0;
        font-size: 1.2vmin;
        color: var(--text-dim);
        text-transform: uppercase;
        border-bottom: 1px solid var(--border-main);
        padding-bottom: 0.5vmin;
        text-align: center;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) currentRegion = 'Atlanta';
  
  private _inactivityTimer: number | null = null;

  connectedCallback() {
      super.connectedCallback();
      // Auto open on load
      setTimeout(() => this.open = true, 500);
      
      // Setup auto-close timer
      this.resetTimer();
      window.addEventListener('click', this.resetTimer.bind(this));
      window.addEventListener('mousemove', this.resetTimer.bind(this));
      window.addEventListener('touchstart', this.resetTimer.bind(this));
  }
  
  disconnectedCallback() {
      super.disconnectedCallback();
      window.removeEventListener('click', this.resetTimer.bind(this));
      window.removeEventListener('mousemove', this.resetTimer.bind(this));
      window.removeEventListener('touchstart', this.resetTimer.bind(this));
      if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
  }
  
  private resetTimer() {
      if (!this.open) return; 
      
      if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
      
      // Auto close after 10s of inactivity
      this._inactivityTimer = window.setTimeout(() => {
          this.open = false;
      }, 10000);
  }

  private toggleOpen() {
    this.open = !this.open;
    if (this.open) this.resetTimer();
  }

  private selectRegion(region: string) {
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('region-change', { detail: region }));
  }

  render() {
    const regions = Object.keys(REGION_PRESETS);
    
    return html`
      <div id="drawer-body">
        <div id="tab" @click=${this.toggleOpen}>GENRE</div>
        <h3>Select Region</h3>
        <div class="genre-list">
            ${regions.map(r => {
                const color = REGION_PRESETS[r].themeColor || '#444';
                return html`
                    <div class="genre-btn ${this.currentRegion === r ? 'selected' : ''}"
                         style="background: linear-gradient(135deg, ${color}, #111)"
                         @click=${() => this.selectRegion(r)}>
                         ${r}
                    </div>
                `;
            })}
        </div>
      </div>
    `;
  }
}
