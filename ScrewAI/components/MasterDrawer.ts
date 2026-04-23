

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './VerticalFader';

@customElement('master-drawer')
export class MasterDrawer extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 10vmin; /* Tighter width */
      min-width: 80px;
      
      z-index: 1000; 
      display: flex;
      flex-direction: column;
      align-items: stretch;
      
      /* Hidden below screen */
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
      border-right: none; 
      border-radius: 8px 0 0 0; 
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
      bottom: 100%; /* Sits on top of the drawer body */
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
      
      /* Moved down slightly as requested in previous prompts */
      transform: translateY(9px);
    }
    
    #tab:hover {
      filter: brightness(1.1);
      box-shadow: 
        inset 1px 1px 1px rgba(255,255,255,0.9),
        0 -2px 5px rgba(0,0,0,0.3);
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) learning = false;
  @property({ type: String }) waitingFor: string | null = null;
  
  @property({ type: Number }) audioLevel = 0; // Receive real-time level
  
  @state() public masterVol = 0.8;

  private toggleOpen() {
    this.open = !this.open;
  }

  private handleMasterChange(e: CustomEvent) {
    if (this.learning) {
        (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('mapping-request', { detail: 'master' }));
        return;
    }
    this.masterVol = e.detail;
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('fx-change', {
      detail: { type: 'master', value: this.masterVol }
    }));
  }

  render() {
    return html`
      <div id="tab" @click=${this.toggleOpen}>MASTER</div>
      <div id="drawer-body">
        <div style="height: 100%; width: 100%; display: flex; justify-content: center;">
          <vertical-fader 
            .value=${this.masterVol} 
            .audioLevel=${this.audioLevel}
            label="LEVEL"
            .learning=${this.learning}
            .waiting=${this.learning && this.waitingFor === 'master'}
            @input=${this.handleMasterChange}>
          </vertical-fader>
        </div>
      </div>
    `;
  }
}
