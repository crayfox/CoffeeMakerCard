import { LitElement, html, css } from 'lit';
import styles from '../styles.css' with { type: 'css' };
import { formatProgramName } from '../utils.js';
import { updateThemeVars } from '../theme-utils.js';
import { drinkImages, icons } from '../assets/images.js';
import { renderSlidersForSelectedCoffee } from '../controls.js';

export class CoffeeStart extends LitElement {
    static styles = [
        styles,
        css`
            .icon.on {
                filter: invert(26%) sepia(89%) saturate(1583%) hue-rotate(95deg) brightness(96%) contrast(106%);
            }

            .icon.off {
                filter: invert(16%) sepia(99%) saturate(7404%) hue-rotate(4deg) brightness(95%) contrast(118%);
            }

            .progress-container {
                width: 100%;
                max-width: 250px;
                height: 10px;
                background-color: #e0e0e0;
                border-radius: 5px;
                overflow: hidden;
                margin: 12px auto;
            }
            
            .progress-bar {
                height: 100%;
                background: linear-gradient(
                    120deg, 
                    #4caf50,
                    #66bb6a, 
                    #81c784,
                    #4caf50
                );
                background-size: 300% 100%;
                animation:
                    gradientFlow 1.8s linear infinite,
                    pulseGlow 2.2s ease-in-out infinite;
                box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
            }

            .progress-bar.done {
                background: linear-gradient(90deg, #4caf50, #81c784);
                background-size: 100% 100%;
                animation: none;
                box-shadow: 0 0 8px rgba(76, 175, 80, 0.2);
            }

            @keyframes gradientFlow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes pulseGlow {
                0%, 100% { box-shadow: 0 0 8px rgba(76, 175, 80, 0.3); }
                50% { box-shadow: 0 0 16px rgba(76, 175, 80, 0.6); }
            }

            .progress-label {
                text-align: center;
                fonz-size: 0.9rem;
                margin-top: 6px;
                color: #ffffffff;
            }

            .done {
                color: #2e7d32;
                font-weight: bold;
                animation: fadeIn 0.4s ease forwards;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `
    ];

    static properties = {
        ctx: { type: Object },
        progress: { type: Number, state: true },
        isDone: { type: Boolean, state: true }
    };

    connectedCallback() {
        super.connectedCallback();
        updateThemeVars();
        this.progress = 0;
        this.isDone = false;
        this._onSettingsChanged = () => this.requestUpdate();
        this.ctx?.addEventListener("coffee-settings-changed", this._onSettingsChanged);
        
        this._subscribeToEntityUpdates();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.ctx?.removeEventListener("coffee-settings-changed", this._onSettingsChanged);
        if (this._unsubscribe) this._unsubscribe();
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return html``;

        const allSliders = renderSlidersForSelectedCoffee(ctx, null, null, true);

        // reads the slider array and cuts them into half/half for desktop view
        const bean_temperatureSlider = allSliders[0];
        const quantitySlider = allSliders[1];

        // Sets the currently selected coffee as the headline        
        const rawName = formatProgramName(ctx.options?.[this.currentIndex]);
        const coffeeName = rawName.replace("World ", "").replace("X L", "XL").replace('ae', 'ä').replaceAll("-", " ");
        const label = coffeeName.replaceAll(" ", "-").replace("ä", "ae");

        return html`
            <ha-card>
                <div class="card-content">
                    <div class="header">
                        <span>
                            <input type="image" src="${icons.power}" alt="Power"
                            class="icon ${ctx.isOn ? 'on' : 'off'}" 
                            @click=${() => ctx._setLayout('power')} />
                            <div style="text-align: center;">${ctx.isOn ? 'ON' : 'OFF'}</div>
                        </span>
                        <span>
                            <h2>${coffeeName}</h2>
                        </span>
                        <span>
                        </span>
                    </div>

                    <div class="container">
                        <div class="box">
                            <div class="container" style="justify-content:center; width:190px;">
                                <img src="${drinkImages[label]}" class="coffee-img" draggable="false" />
                            </div>
                            <div>
                                <label><h2 style="margin:auto;">${this.isDone ? "Done" : "In progress... Please Wait!"}</h2></label>
                            </div>

                            <div class="progress-container">
                                <div class="progress-bar ${this.isDone ? 'done' : ''}" style="width:${this.progress}%;"></div>
                            </div>
                            <div class="progress-label ${this.isDone ? 'done' : ''}">
                                ${this.isDone ? "Ready" : Math.floor(this.progress) + "%"}
                            </div>

                            <div id="slider-box" style="opacity:0.7; margin-top:auto;">
                                ${!ctx.isMobile ? html`
                                    <div class="controls-grid">
                                        <div class="column">${bean_temperatureSlider}</div>
                                        
                                        <div class="triangle-container" ></div>

                                        <div class="column">${quantitySlider}</div>                                    
                                    </div>` 
                                : html`
                                    <div class="column">${allSliders.map(c => c)}</div>
                                `}
                            </div>
                        </div>
                    </div>
                    <div style="padding:10px;"></div>
                    <div class="container">
                        <div id="error-box"></div>
                        <button class="start" @click=${() => this._stopCoffee(ctx)}>Abort</button>
                    </div>
                </div>
            </ha-card>
        `;
    }

    async _subscribeToEntityUpdates() {
        const ctx = this.ctx;
        if (!ctx || !ctx._hass?.connection) return;

        const progressEntityId = ctx.getEntityByKey('program_progress').entity_id;

        const conn = ctx._hass.connection;

        this._unsubscribe = await conn.subscribeMessage((msg) => {
            const entityId = msg.data?.entity_id;
            const newState = msg.data?.new_state.state;

            if (entityId === progressEntityId) {
                const val = parseFloat(newState);
                if (!isNaN(val)) this.progress = Math.min(100, Math.max(0, val));
            }
            if (this.progress >= 100 || newState === 'finished') {
                this.isDone = true;
                if (this._unsubscribe) this._unsubscribe();
                setTimeout(() => ctx._setLayout('frontpage'), 2000);
            }

            this.requestUpdate();
        }, {
            type: "subscribe_events",
            event_type: "state_changed"
        });
    }

    _stopCoffee(ctx) {
        if (ctx.getStateByKey('operation_state') === 'run') {
            const stopEntity = ctx.getEntity('button', 'stop_program');
            ctx._hass.callService("button", "press", {
                entity_id: stopEntity,
            });
        }
        ctx._setLayout('frontpage');
    }
}
if (!customElements.get('coffee-start')) {
    customElements.define('coffee-start', CoffeeStart);
}