

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('settings-modal')
export class SettingsModal extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2000;
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
      background: rgba(0,0,0,0.6);
    }

    /* Skeuomorphic High-Tech Device Container */
    .device-casing {
      position: relative;
      width: min(600px, 95vw);
      background: linear-gradient(135deg, #2a2a2a 0%, #111 100%);
      border-radius: 12px;
      padding: 12px;
      box-shadow: 
        0 30px 60px rgba(0,0,0,0.8),
        inset 0 1px 0 rgba(255,255,255,0.1),
        0 0 0 1px #000;
      transform: scale(0.9);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    :host([open]) .device-casing {
      transform: scale(1);
    }
    
    /* Screws */
    .screw {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: radial-gradient(circle, #555, #222);
      border: 1px solid #111;
      box-shadow: inset 1px 1px 1px rgba(255,255,255,0.2);
      z-index: 2;
    }
    .screw::after {
      content: '';
      position: absolute;
      top: 50%; left: 10%; right: 10%; height: 1px;
      background: #111;
      transform: translateY(-50%) rotate(45deg);
    }
    .screw.tl { top: 6px; left: 6px; }
    .screw.tr { top: 6px; right: 6px; }
    .screw.bl { bottom: 6px; left: 6px; }
    .screw.br { bottom: 6px; right: 6px; }

    /* The "Screen" area */
    .interface-panel {
      background: #0f0f0f;
      border: 2px solid #333;
      border-radius: 4px;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
      padding: 20px;
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: 80vh;
      overflow-y: auto;
    }

    h2 {
      margin: 0;
      font-family: 'Roboto Condensed', sans-serif;
      text-transform: uppercase;
      font-size: 20px;
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-highlight);
      text-shadow: 0 0 5px rgba(255,255,255,0.1);
    }

    .close-btn {
      background: #333;
      border: 1px solid #555;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      width: 24px; 
      height: 24px;
      display: flex; 
      align-items: center; 
      justify-content: center;
      border-radius: 3px;
    }
    .close-btn:hover { background: #d32f2f; border-color: #f00; }

    .section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(255,255,255,0.02);
      padding: 10px;
      border: 1px solid #222;
      border-radius: 4px;
    }
    .section-title {
      font-size: 11px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: 'Roboto Mono', monospace;
      border-left: 2px solid var(--accent-glow);
      padding-left: 6px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
    }

    .option-btn {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 3px;
      padding: 8px 4px;
      text-align: center;
      cursor: pointer;
      font-size: 11px;
      color: #888;
      transition: all 0.2s;
      font-family: 'Roboto Condensed', sans-serif;
      text-transform: uppercase;
    }
    .option-btn:hover {
      border-color: #555;
      color: #ccc;
    }
    .option-btn.selected {
      border-color: var(--accent-glow);
      color: var(--accent-glow);
      background: rgba(0,0,0,0.3);
      box-shadow: 0 0 8px rgba(var(--accent-glow), 0.2);
    }

    /* MIDI Specific */
    .midi-controls {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    
    select {
        flex-grow: 1;
        background: #000;
        color: var(--accent-glow);
        border: 1px solid #333;
        padding: 6px;
        font-family: 'Roboto Mono', monospace;
        font-size: 11px;
        outline: none;
    }
    
    button.action-btn {
        background: #222;
        border: 1px solid #444;
        color: #ccc;
        padding: 6px 12px;
        font-family: 'Roboto Condensed', sans-serif;
        font-size: 11px;
        text-transform: uppercase;
        cursor: pointer;
    }
    button.action-btn:hover { border-color: var(--accent-glow); color: var(--accent-glow); }
    button.action-btn.active {
        background: var(--accent-glow);
        color: #000;
        box-shadow: 0 0 10px var(--accent-glow);
    }
    
    .size-toggle {
        display: flex;
        gap: 1px;
        background: #333;
        padding: 1px;
        border-radius: 4px;
    }
    .size-opt {
        flex: 1;
        padding: 8px;
        text-align: center;
        cursor: pointer;
        font-size: 11px;
        color: #888;
        background: #111;
    }
    .size-opt:first-child { border-radius: 3px 0 0 3px; }
    .size-opt:last-child { border-radius: 0 3px 3px 0; }
    
    .size-opt.selected {
        background: #2a2a2a;
        color: #fff;
        font-weight: bold;
    }

  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) currentTheme = '';
  @property({ type: String }) currentKnobStyle = 'metallic';
  @property({ type: Boolean }) wideMode = false;
  
  // MIDI Props
  @property({ type: Array }) midiInputIds: string[] = [];
  @property({ type: String }) activeMidiInputId: string | null = null;
  @property({ type: Boolean }) midiEnabled = false;
  @property({ type: Boolean }) learnMode = false;

  private close() {
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('close'));
  }

  private selectTheme(theme: string) {
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
  }

  private selectKnob(style: string) {
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('knob-change', { detail: style }));
  }
  
  private toggleWideMode(wide: boolean) {
      if (this.wideMode !== wide) {
          (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('wide-mode-change', { detail: wide }));
      }
  }
  
  private toggleMidi(e: Event) {
      const target = e.target as HTMLInputElement;
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('midi-enable-change', { detail: target.checked }));
  }
  
  private changeMidiInput(e: Event) {
      const target = e.target as HTMLSelectElement;
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('midi-input-change', { detail: target.value }));
  }
  
  private toggleLearnMode() {
      (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('learn-mode-toggle'));
  }

  render() {
    const themes = [
      { id: '', label: 'Carbon' },
      { id: 'theme-wood', label: 'Wood' },
      { id: 'theme-plastic', label: 'Plastic' },
      { id: 'theme-blue', label: 'Blue' },
      { id: 'theme-green', label: 'Green' },
      { id: 'theme-purple', label: 'Purple' },
      { id: 'theme-red', label: 'Red' },
    ];

    const knobStyles = [
      { id: 'metallic', label: 'Metallic' },
      { id: 'analog', label: 'Analog' },
      { id: 'rubber', label: 'Rubber' },
      { id: 'tech', label: 'Tech' },
      { id: 'vintage', label: 'Vintage' },
      { id: 'chrome', label: 'Chrome' },
      { id: 'modern', label: 'Modern' },
      { id: 'soft-touch', label: 'Soft' },
    ];

    return html`
      <div class="overlay" @click=${this.close}></div>
      
      <div class="device-casing">
        <div class="screw tl"></div><div class="screw tr"></div>
        <div class="screw bl"></div><div class="screw br"></div>
        
        <div class="interface-panel">
            <h2>
              SYSTEM CONFIG
              <button class="close-btn" @click=${this.close}>×</button>
            </h2>

            <div class="section">
               <div class="section-title">INTERFACE SIZE</div>
               <div class="size-toggle">
                   <div class="size-opt ${!this.wideMode ? 'selected' : ''}" 
                        @click=${() => this.toggleWideMode(false)}>STANDARD</div>
                   <div class="size-opt ${this.wideMode ? 'selected' : ''}" 
                        @click=${() => this.toggleWideMode(true)}>WIDE / LARGE</div>
               </div>
            </div>

            <div class="section">
              <div class="section-title">MIDI CONTROLLER</div>
              
              <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                 <label style="font-size: 11px; color: #888;">ENABLE MIDI</label>
                 <input type="checkbox" ?checked=${this.midiEnabled} @change=${this.toggleMidi}>
              </div>
              
              ${this.midiEnabled ? html`
                  <div class="midi-controls">
                      <select @change=${this.changeMidiInput} .value=${this.activeMidiInputId || ''}>
                          ${this.midiInputIds.length === 0 ? html`<option>No Devices Found</option>` : ''}
                          ${this.midiInputIds.map(id => html`<option value=${id}>Device ${id.substring(0,4)}...</option>`)}
                      </select>
                      <button class="action-btn ${this.learnMode ? 'active' : ''}" 
                              @click=${this.toggleLearnMode}>
                          ${this.learnMode ? 'LEARNING' : 'MAP MIDI'}
                      </button>
                  </div>
                  <div style="font-size: 10px; color: #555; margin-top: 4px;">
                      ${this.learnMode ? 'Click any knob or fader then move MIDI control.' : 'Select a device to begin.'}
                  </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">SKIN THEME</div>
              <div class="grid">
                ${themes.map(t => html`
                  <div class="option-btn ${classMap({ selected: this.currentTheme === t.id })}"
                       @click=${() => this.selectTheme(t.id)}>
                    ${t.label}
                  </div>
                `)}
              </div>
            </div>

            <div class="section">
              <div class="section-title">KNOB STYLE</div>
              <div class="grid">
                ${knobStyles.map(k => html`
                  <div class="option-btn ${classMap({ selected: this.currentKnobStyle === k.id })}"
                       @click=${() => this.selectKnob(k.id)}>
                    ${k.label}
                  </div>
                `)}
              </div>
            </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-modal': SettingsModal;
  }
}