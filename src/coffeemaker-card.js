import { LitElement, html, } from 'lit';
import styles from './styles.css' with { type: 'css' };
import './layouts/coffee-frontpage.js';
//import './layouts/coffee-cleaning.js';
import './layouts/coffee-power.js';
import './layouts/coffee-start.js';
import './layouts/coffee-select.js';
import './layouts/coffee-stats.js';
import './theme-utils.js';
import { renderSlider } from './controls.js';
import { formatProgramName } from './utils.js';

class CoffeemakerCard extends LitElement {
    
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
      selectedCoffee: { type: String },
      selectedProgram: { type: String },
      isMobile: { type: Boolean, state: true },
    };
  }

  static styles = [styles];

  constructor() {
    super();
    this._config = {};
    this._selectedProgramFromStorage = localStorage.getItem('coffeeSelectedProgram');
    this._layout = "frontpage";
    
    this._mediaQuery = window.matchMedia("(max-width: 768px)");
    this.isMobile = this._mediaQuery.matches;
    this._boundMediaQueryListener = this._mediaQueryListener.bind(this);
    this._mediaQuery.addEventListener('change', this._boundMediaQueryListener);
  }

  getMetaByKey(key) {
    return this.machineMetaEntities.find(e => e.translation_key === key) || null;
  }

  getEntityByKey(key) {
    const meta = this.getMetaByKey(key);
    if (!meta) return null;
    return this._hass.states[meta.entity_id] || null;
  }

  getStateByKey(key) {
    const entity = this.getEntityByKey(key);
    return entity?.state ?? null;
  }

  getAttributesByKey(key) {
    const entity = this.getEntityByKey(key);
    return entity?.attributes ?? null;
  }

  setConfig(config) {
    this._config = config;
    if (!config.entity) {
      throw new Error("Please define an entity!");
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._hass) return;

    const configName = this._config.entity.toLowerCase().trim().replace(/\s+/g, "_");
    this.match = configName.match(/^(.*?)(?:_(\d+))?$/);
    const baseName = this.match[1];
    const deviceNum = this.match[2];

    const pattern = deviceNum
      ? new RegExp(`^${baseName}_${deviceNum}(_|$)`, "i")
      : new RegExp(`^${baseName}(?!_\\d+)(_|$)`, "i");

    this.machineMetaEntities = Object.values(hass.entities)
      .filter(e => pattern.test(e.entity_id.split(".")[1]));

    const firstMeta = this.machineMetaEntities[0];
    this.deviceId = firstMeta?.device_id || null;

    this.requestUpdate();
  }

  getGridOptions() {
    if (this.isMobile) {
      return {
        columns: 12
      };
    } else {
      return {
        columns: 9
      };
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._mediaQuery && this._boundMediaQueryListener) {
      this._mediaQuery.removeEventListener('change', this._boundMediaQueryListener);
    }
  }

  firstUpdated() {
    if (this._hass) {
      this.options = this.getAttributesByKey('selected_program').options || [];
    }
    this._selectedProgramFromStorage = localStorage.getItem('coffeeSelectedProgram');
  }

  render() {
    /* Shows the currently selected coffee at startup;
        Takes "consumer_products_coffee_maker_program_beverage_espresso" and turns it into "Espresso" */
    this.selectedCoffee = formatProgramName(this.getStateByKey('selected_program'));

    this.isOn = this.getStateByKey('power') === "on";

    switch(this._layout) {
      case 'power':
        return html`<coffee-power .ctx=${this} .hass=${this._hass}></coffee-power>`;
      case 'cleaning':
        return html`<coffee-cleaning .ctx=${this}></coffee-cleaning>`;
      case 'start':
        return html`<coffee-start .ctx=${this}></coffee-start>`;
      case 'select':
        return html`<coffee-select .ctx=${this}></coffee-select>`;
      case 'stats':
        return html`<coffee-stats .ctx=${this}></coffee-stats>`;
      case 'frontpage':
      default:
        return html`<coffee-frontpage .ctx=${this} 
                                      .hass=${this._hass}
                                      .selectedProgram=${this.selectedProgram}
                                      .selectedCoffee=${this.selectedCoffee}
                    ></coffee-frontpage>`;
    }
  }

  _setLayout(layout) {
    this._layout = layout; 
    this.requestUpdate();
  }

  _mediaQueryListener(e) {
    this.isMobile = e.matches;
  }
}

if (!customElements.get('coffeemaker-card')) {
    customElements.define('coffeemaker-card', CoffeemakerCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: "coffeemaker-card",
    name: "Coffeemaker Card",
    description: "User friendly UI verson of the Home Connect integration"
});