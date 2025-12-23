import { LitElement, html, css } from 'lit';
import styles from '../styles.css' with { type: 'css' };
import { icons } from '../assets/images.js';

export class CoffeeStats extends LitElement {
  static styles = [
    styles,
    css`
      .icon.on {
        filter: invert(26%) sepia(89%) saturate(1583%) hue-rotate(95deg) brightness(96%) contrast(106%);
      }
      
      .icon.off {
        filter: invert(16%) sepia(99%) saturate(7404%) hue-rotate(4deg) brightness(95%) contrast(118%);
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .container {
        display: flex;
        justify-content: center;
      }

      .box {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
      }
    `
  ];
  
  static properties = {
    hass: { type: Object },
    ctx: { type: Object }
  };

  _getCoffeeStats(entity) {
    return html`
      <div>${this.ctx._hass.entities[entity.entity_id].name}: </div>
      <div>${entity.state} ${entity.attributes.unit_of_measurement}</div>
    `;
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return html``;

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
              <h2>Beverage Counter</h2>
            </span>
            <span></span>
          </div>
          
          <div class="container">
            <div class="box">
              ${['coffee_and_milk_counter', 'coffee_counter', 'hot_water_counter', 'hot_water_cups_counter', 'milk_counter']
                .map(stat => this._getCoffeeStats(this.ctx.getEntityByKey(stat)))
              }
            </div>
          </div>
          <div class="button-spacing">
            <button class="button" @click=${() => ctx._setLayout('frontpage')}>Back</button>
          </div>
        </div>
      </ha-card>
    `;
  }
}

if (!customElements.get('coffee-stats')) {
    customElements.define('coffee-stats', CoffeeStats);
}