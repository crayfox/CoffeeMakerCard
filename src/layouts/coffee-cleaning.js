/* This file is from an earlier iteration from coffeemaker card
    It is currently not in use but I left it for code completeness
    Will be reused if the correct functions exist in the future :) */


import { LitElement, html, css } from 'lit';
import styles from '../styles.css' with { type: 'css' };
import { updateThemeVars } from '../theme-utils.js';

export class CoffeeCleaning extends LitElement {
    static styles = [
        styles,
        css`
            .icon.on {
                filter: invert(26%) sepia(89%) saturate(1583%) hue-rotate(95deg) brightness(96%) contrast(106%);
            }

            .icon.off {
                filter: invert(16%) sepia(99%) saturate(7404%) hue-rotate(4deg) brightness(95%) contrast(118%);
            }
        `
    ];

    static properties = {
        ctx: { type: Object }
    };

    connectedCallback() {
        super.connectedCallback();
        updateThemeVars();
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return html``;
        
        return html`
            <ha-card>
                <div class="card-content">
                    <div class="header">
                        <span>
                            <input
                            type="image"
                            src="/local/coffeemaker-card/icon/power-button.png"
                            class="icon ${ctx.isOn ? 'on' : 'off'}"
                            @click=${() => ctx._setLayout('power')}
                            />
                        </span>
                    </div>
                    <div class="container">
                        <div class="box util">
                            <label><h1>Start Cleaning Process?</h1></label>
                        </div>
                    </div>
                    <div style="padding: 10px;"></div>
                    <div class="button-spacing">
                        <button class="button" @click=${() => ctx._setLayout('frontpage')}>
                            Cancel
                        </button>
                        <button class="button">Accept</button>
                    </div>
                </div>
            </ha-card>
        `;
    }
}

if (!customElements.get('coffee-cleaning')) {
    customElements.define('coffee-cleaning', CoffeeCleaning);
}
