
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import './WeightKnob';
import type { WeightKnob } from './WeightKnob';

import type { MidiDispatcher } from '../utils/MidiDispatcher';
import type { Prompt, ControlChange } from '../types';

/** A single prompt input associated with a MIDI CC. */
@customElement('prompt-controller')
export class PromptController extends LitElement {
  static styles = css`
    .prompt {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 0.8vmin;
      position: relative;
    }
    weight-knob {
      width: 100%;
      height: auto;
      aspect-ratio: 1;
      flex-shrink: 0;
      min-height: 10vmin; 
    }
    #midi {
      font-family: 'Roboto Mono', monospace;
      text-align: center;
      font-size: 1.2vmin;
      border: 1px solid var(--border-main);
      border-radius: 2px;
      padding: 1px 3px;
      color: var(--text-dim);
      background: var(--bg-rack);
      cursor: pointer;
      visibility: hidden;
      user-select: none;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 2;
      
      .learn-mode & {
        color: #ff9800;
        border-color: #ff9800;
      }
      .show-cc & {
        visibility: visible;
      }
    }

    #text {
      font-family: 'Roboto Condensed', sans-serif;
      font-weight: 600;
      font-size: 1.4vmin;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      
      max-width: 100%;
      min-width: 2vmin;
      padding: 0.3vmin 0.6vmin;
      
      border-radius: 2px;
      text-align: center;
      white-space: pre;
      overflow: hidden;
      border: none;
      outline: none;
      -webkit-font-smoothing: antialiased;
      
      /* Label Tape Style */
      background: var(--tab-bg);
      color: var(--tab-text);
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
      border-bottom: 1px solid rgba(0,0,0,0.2);
      
      &:not(:focus) {
        text-overflow: ellipsis;
      }
      &:focus {
        background: #fff;
        box-shadow: 0 0 0 2px #2196f3;
      }
    }

    .value-display {
      font-family: 'Roboto Mono', monospace;
      font-size: 1.1vmin;
      color: var(--text-dim);
      background: rgba(0,0,0,0.3);
      padding: 2px 5px;
      border-radius: 3px;
      cursor: ew-resize;
      user-select: none;
      margin-bottom: -5px;
      z-index: 3;
      min-width: 3em;
      text-align: center;
      outline: none;
      border: 1px solid transparent;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .value-display:hover {
      color: var(--text-highlight);
      border-color: rgba(255,255,255,0.2);
      background: rgba(0,0,0,0.5);
    }
    .value-display:focus {
      background: #fff;
      color: #000;
      cursor: text;
      user-select: text;
    }
    
    :host([filtered]) {
      weight-knob { 
        opacity: 0.5;
        filter: grayscale(1);
      }
      #text {
        background: #d32f2f;
        color: white;
      }
    }
  `;

  @property({ type: String }) promptId = '';
  @property({ type: String }) text = '';
  @property({ type: Number }) weight = 0;
  @property({ type: String }) color = '';
  @property({ type: Boolean, reflect: true }) filtered = false;

  @property({ type: Number }) cc = 0;
  @property({ type: Number }) channel = 0;

  @property({ type: Boolean }) learnMode = false;
  @property({ type: Boolean }) showCC = false;
  
  @property({ type: String }) knobStyle = 'metallic';

  @query('weight-knob') private weightInput!: WeightKnob;
  @query('#text') private textInput!: HTMLInputElement;
  @query('.value-display') private valueDisplay!: HTMLDivElement;

  @property({ type: Object })
  midiDispatcher: MidiDispatcher | null = null;

  @property({ type: Number }) audioLevel = 0;

  private lastValidText!: string;
  private scrubStartX = 0;
  private scrubStartVal = 0;

  connectedCallback() {
    super.connectedCallback();
    this.midiDispatcher?.addEventListener('cc-message', (e: Event) => {
      const customEvent = e as CustomEvent<ControlChange>;
      const { channel, cc, value } = customEvent.detail;
      if (this.learnMode) {
        this.cc = cc;
        this.channel = channel;
        this.learnMode = false;
        this.dispatchPromptChange();
      } else if (cc === this.cc) {
        this.weight = (value / 127) * 2;
        this.dispatchPromptChange();
      }
    });
  }

  firstUpdated() {
    this.textInput.setAttribute('contenteditable', 'plaintext-only');
    this.textInput.textContent = this.text;
    this.lastValidText = this.text;
    if (this.valueDisplay) {
      this.valueDisplay.textContent = this.weight.toFixed(2);
    }
  }

  update(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('showCC') && !this.showCC) {
      this.learnMode = false;
    }
    if (changedProperties.has('text') && this.textInput) {
      this.textInput.textContent = this.text;
    }
    if (changedProperties.has('weight') && this.valueDisplay && document.activeElement !== this.valueDisplay) {
      this.valueDisplay.textContent = this.weight.toFixed(2);
    }
    super.update(changedProperties);
  }

  private dispatchPromptChange() {
    (this as unknown as HTMLElement).dispatchEvent(
      new CustomEvent<Prompt>('prompt-changed', {
        detail: {
          promptId: this.promptId,
          text: this.text,
          weight: this.weight,
          cc: this.cc,
          color: this.color,
          muted: false,
          pan: 0
        },
      }),
    );
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (e.target === this.textInput) this.resetText();
      (e.target as HTMLElement).blur();
    }
  }

  private resetText() {
    this.text = this.lastValidText;
    this.textInput.textContent = this.lastValidText;
  }

  private async updateText() {
    const newText = this.textInput.textContent?.trim();
    if (!newText) {
      this.resetText();
    } else {
      this.text = newText;
      this.lastValidText = newText;
    }
    this.dispatchPromptChange();
    this.textInput.scrollLeft = 0;
  }

  private onFocus(e: FocusEvent) {
    const target = e.target as HTMLElement;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(target);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  private updateWeightFromKnob(e: CustomEvent) {
    this.weight = e.detail;
    this.dispatchPromptChange();
  }

  private handleValueBlur() {
    const val = parseFloat(this.valueDisplay.textContent || '0');
    if (!isNaN(val)) {
        this.weight = Math.max(0, Math.min(2, val));
    }
    this.valueDisplay.textContent = this.weight.toFixed(2);
    this.dispatchPromptChange();
  }

  private handleScrubDown(e: PointerEvent) {
    if (document.activeElement === this.valueDisplay) return;
    e.preventDefault();
    this.valueDisplay.setPointerCapture(e.pointerId);
    this.scrubStartX = e.clientX;
    this.scrubStartVal = this.weight;
    
    const move = (ev: PointerEvent) => {
        const delta = ev.clientX - this.scrubStartX;
        this.weight = Math.max(0, Math.min(2, this.scrubStartVal + delta * 0.01));
        this.dispatchPromptChange();
    };
    const up = (ev: PointerEvent) => {
        this.valueDisplay.releasePointerCapture(ev.pointerId);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
  
  private toggleLearnMode() {
    this.learnMode = !this.learnMode;
  }

  render() {
    const classes = classMap({
      'prompt': true,
      'learn-mode': this.learnMode,
      'show-cc': this.showCC,
    });
    return html`<div class=${classes}>
      <div id="midi" @click=${this.toggleLearnMode}>
        ${this.learnMode ? 'Lrn' : `${this.cc}`}
      </div>

      <div class="value-display" 
           contenteditable="true" 
           spellcheck="false"
           @focus=${this.onFocus}
           @keydown=${this.onKeyDown}
           @blur=${this.handleValueBlur}
           @pointerdown=${this.handleScrubDown}></div>

      <weight-knob
        id="weight"
        .value=${this.weight}
        .min=${0}
        .max=${2}
        .knobStyle=${this.knobStyle}
        color=${this.filtered ? '#888' : this.color}
        audioLevel=${this.filtered ? 0 : this.audioLevel}
        @input=${this.updateWeightFromKnob}></weight-knob>
        
      <span
        id="text"
        spellcheck="false"
        @focus=${this.onFocus}
        @keydown=${this.onKeyDown}
        @blur=${this.updateText}></span>
    </div>`;
  }
}
