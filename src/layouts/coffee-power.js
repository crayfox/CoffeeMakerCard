import { LitElement, html, css } from 'lit';
import styles from '../styles.css' with { type: 'css' };

export class CoffeePower extends LitElement {
    static styles = [
        styles,
        css`
            .loading-overlay {
                position: absoltute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
            }
                
            .spinner {
                width: 36px;
                height: 36px;
                border: 4px solid #ccc;
                border-top-color: var(--primary-color, #3f51b5);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .relative {
                position: relative;
            }                   
        `
    ];

    static properties = {
        ctx: { type: Object },
        _isLoading: { type: Boolean, state: true },
        hass: { type: Object }
    };
    
    render() {
        const ctx = this.ctx;
        if (!ctx) return html``;

        return html`
            <ha-card>
                <div class="card-content relative">
                    ${this._isLoading ? html`
                        <div class="loading-overlay">
                            <div class="spinner"></div>
                        </div>
                    ` : ''}
                    <div class="container">
                        <div class="box util">
                            <label><h1>${ctx.isOn ? "Shutdown?" : "Turn On?"}</h1></label>
                        </div>
                    </div>
                    <div style="padding: 10px;"></div>
                    <div class="button-spacing">
                        <button class="button" @click=${() => ctx._setLayout('frontpage')}>Cancel</button>
                        <button class="button" @click=${() => this._accept(ctx)} ?disabled=${this._isLoading}>Accept</button>
                    </div>
                </div>
            </ha-card>
        `;
    }

    async _accept(ctx) {
        if (!ctx) return;
        
        this._isLoading = true;
        await this.updateComplete;
        
        const [domain] = ctx.getEntityByKey('power').entity_id.split(".");
        const entityId = ctx.getEntityByKey('power').entity_id;
        const sensorState = ctx.getStateByKey('operation_state');

        ctx._hass.callService(domain, ctx.isOn ? "turn_off" : "turn_on" , {
            entity_id: entityId
        });

        const checkPower = () => {
            if (!ctx.isOn && sensorState === 'inactive') { // Turn On
                this._finish(ctx);
            } else if (ctx.isOn && sensorState === 'ready') { // Turn Off
                this._finish(ctx);
            } else {
                setTimeout(checkPower, 500);
            }
        };

        setTimeout(checkPower, 1000);

        setTimeout(() => {
            if (this._isLoading && (sensorState === 'inactive' || sensorState === 'unavailable')) {
                this._showHint("Cannot start device, please check.");
                ctx._setLayout('frontpage');
            }
        }, 7000);
    }

    _finish(ctx) {
        this._isLoading = false;
        ctx._setLayout('frontpage');
    }

    _showHint(message) {
        if (this.hass && this.hass.callService) {
            this.hass.callService("persistent_notification", "create", {
                message,
                title: "Notice"
            });
        }
    }
}

if (!customElements.get('coffee-power')) {
    customElements.define('coffee-power', CoffeePower);
}