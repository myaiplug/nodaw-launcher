/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('theme-toggle')
export class ThemeToggle extends LitElement {
  @state() isLight = false;

  toggle() {
    this.isLight = !this.isLight;
    document.body.classList.toggle('light-mode', this.isLight);
  }

  static styles = css`
    :host {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 100;
    }
    button {
      background: var(--bg-rack-unit);
      border: 1px solid var(--border-main);
      border-radius: 8px;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-btn), var(--shadow-inset);
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    button:active {
      transform: translateY(1px);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .icon-container {
      position: relative;
      width: 24px;
      height: 24px;
    }

    svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      fill: var(--text-dim);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* Rotation and opacity for switch animation */
    .sun {
      transform: rotate(0deg) scale(1);
      opacity: 1;
    }
    .moon {
      transform: rotate(90deg) scale(0);
      opacity: 0;
    }

    /* Light Mode State */
    :host-context(body.light-mode) .sun {
      transform: rotate(-90deg) scale(0);
      opacity: 0;
    }
    :host-context(body.light-mode) .moon {
      transform: rotate(0deg) scale(1);
      opacity: 1;
    }

    /* Hover Glow Effects on ICON only */
    button:hover .sun {
      fill: #ffbd00;
      filter: drop-shadow(0 0 4px #ffbd00);
    }
    button:hover .moon {
      fill: #5e60ce;
      filter: drop-shadow(0 0 4px #5e60ce);
    }

    /* Fix for browsers where host-context is not supported, rely on JS class toggling on body if needed, 
       but Lit handles host-context well usually. 
       Fallback using a prop if host-context fails visually in some setups, but here we assume standard support.
    */
  `;

  render() {
    return html`
      <button @click=${this.toggle} title="Toggle Theme">
        <div class="icon-container">
            <!-- Sun Icon -->
            <svg class="sun" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <!-- Moon Icon -->
            <svg class="moon" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
        </div>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-toggle': ThemeToggle;
  }
}
