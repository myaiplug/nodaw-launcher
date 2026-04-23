

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('download-modal')
export class DownloadModal extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 3000;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(4px);
      font-family: 'Roboto Condensed', sans-serif;
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
      background: rgba(0,0,0,0.8);
    }

    .modal-content {
      position: relative;
      width: min(450px, 90vw);
      background: linear-gradient(180deg, #2b2b2b 0%, #1a1a1a 100%);
      border: 1px solid #444;
      border-radius: 8px;
      box-shadow: 
        0 30px 60px rgba(0,0,0,0.9), 
        inset 0 1px 0 rgba(255,255,255,0.1),
        0 0 0 1px #000;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      transform: scale(0.95);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-align: center;
    }
    :host([open]) .modal-content {
      transform: scale(1);
    }

    h2 {
      margin: 0;
      color: #fff;
      font-size: 20px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #444;
      padding-bottom: 15px;
    }

    .message {
      color: #ccc;
      font-size: 16px;
      line-height: 1.4;
    }
    
    .sub-message {
      color: var(--text-dim, #888);
      font-size: 13px;
      margin-top: -10px;
      font-style: italic;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 10px;
    }

    button {
      padding: 14px 20px;
      border-radius: 4px;
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
      letter-spacing: 0.05em;
    }

    .btn-primary {
      background: linear-gradient(135deg, #7C4DFF, #00FFFF);
      border: none;
      color: #000;
      box-shadow: 0 4px 15px rgba(124, 77, 255, 0.4);
    }
    .btn-primary:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(124, 77, 255, 0.6);
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid #555;
      color: #aaa;
    }
    .btn-secondary:hover {
      border-color: #888;
      color: #fff;
      background: rgba(255,255,255,0.05);
    }

    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      color: #666;
      font-size: 20px;
      padding: 5px;
      width: auto;
      line-height: 1;
    }
    .close-btn:hover { color: #fff; }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  private close() {
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('close'));
  }

  private confirm(split: boolean) {
    (this as unknown as HTMLElement).dispatchEvent(new CustomEvent('confirm', { detail: split }));
  }

  render() {
    return html`
      <div class="overlay" @click=${this.close}></div>
      <div class="modal-content">
        <button class="close-btn" @click=${this.close}>×</button>
        <h2>Processing Options</h2>
        <div class="message">Would you like to split this instrumental into individual stems?</div>
        <div class="sub-message">(Bass, Drums, Melody, Vocals, etc.)</div>
        
        <div class="actions">
          <button class="btn-primary" @click=${() => this.confirm(true)}>
            Yes, Split Stems
          </button>
          <button class="btn-secondary" @click=${() => this.confirm(false)}>
            No, Just Download .WAV
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'download-modal': DownloadModal;
  }
}