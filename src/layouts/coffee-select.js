import { LitElement, html, css } from 'lit';
import styles from '../styles.css' with { type: 'css' };
import { updateThemeVars } from '../theme-utils.js';
import { drinkImages, icons } from '../assets/images.js';
import { formatProgramName } from '../utils.js';

export class CoffeeSelect extends LitElement {
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
    ctx: { type: Object },
    tempSelection: { type: String },
    selectedCoffee: { type: String }
  };

  constructor() {
    super();
    this.tempSelection = null;
  }

  updated(changedProps) {
    if (changedProps.has('ctx') && this.ctx) {
      this.tempSelection = this.ctx.selectedCoffee ?? null;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    updateThemeVars();
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return html``;

    const coffeeOptions = ctx.options.map(opt => ({
      raw: opt,
      label: formatProgramName(opt)
    }));

    return html`
      <ha-card>
        <div class="card-content">
          <div class="header">
            <span>
              <input
                type="image" src="${icons.power}" alt="Power"
                class="icon ${ctx.isOn ? 'on' : 'off'}" 
                @click=${() => ctx._setLayout('power')} />
              <div style="text-align: center;">${ctx.isOn ? 'ON' : 'OFF'}</div>
            </span>
            <span>
              <h1>Coffeemenu</h1>
            </span>
            <span>
            </span>
          </div>

          <div class="container" style="flex-direction: column;">
            <div class="box">
              <div class="selection">
                ${coffeeOptions.map(({raw, label}) => {
                  return this._coffeeItem(raw, label);
                })}
              </div>
            </div>

            <div style="padding:10px;"></div>

            <div class="button-spacing">
              <button class="button" @click=${() => ctx._setLayout('frontpage')}>
                Cancel
              </button>
              <button class="button" @click=${() => this._acceptSelection(ctx)}>
                Accept
              </button>
            </div>

            <div style="padding:10px;"></div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _coffeeItem(raw, label) {
    const isSelected = this.tempSelection === raw;
    let coffeeName = label.replace("X-L", "XL");
    label = label.replace("X L", "XL");


    return html`
      <div 
        class="image-container ${isSelected ? 'selected' : ''}" 
          style="border: 2px ridge black; cursor:pointer;"
          @click=${() => this._tempSelectCoffee(raw)}
      >
        <img src="${drinkImages[coffeeName]}" alt="${label}" draggable="false" />
        <span style="color: white; font-weight:${isSelected ? 'bold' : 'normal'};">${label}</span>
      </div>
    `;
  }

  _tempSelectCoffee(raw) {
    this.tempSelection = raw;
    this.requestUpdate();
  }

  _acceptSelection(ctx) {
    ctx.selectedCoffee = formatProgramName(this.tempSelection);
    ctx.selectedProgram = this.tempSelection;

    if (ctx.selectedProgram) {
      if (ctx.getStateByKey('operation_state') === 'ready') {
        ctx._hass.callService('home_connect', 'set_program_and_options', {
          device_id: ctx.deviceId,
          affects_to: 'selected_program',
          program: ctx.selectedProgram
        });
      }
    }

    localStorage.setItem('coffeeSelectedProgram', ctx.selectedProgram);
    ctx.requestUpdate();
    ctx._setLayout('frontpage');
  }
}

if (!customElements.get('coffee-select')) {
    customElements.define('coffee-select', CoffeeSelect);
}
