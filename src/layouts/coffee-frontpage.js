import { LitElement, html, css } from 'lit';
import styles from '../styles.css' with { type: 'css' };
import { formatProgramName } from '../utils.js';
import { updateThemeVars } from '../theme-utils.js';
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import { drinkImages, icons } from '../assets/images.js';
import { renderSlidersForSelectedCoffee } from '../controls.js';

export class CoffeeFrontPage extends LitElement {
    static styles = [
        styles,
        css`
            .mySwiper.disabled {
                pointer-events: none;
                opacity: 0.5;
                cursor: not-allowed;
            }
        `
    ];
    
    static properties = {
        hass: { type: Object },
        selectedCoffee: { type: String },
        selectedProgram: { type: String },
        currentIndex: { type: Number },
        slidersDisabled: { type: Boolean },
        ctx: { type: Object },
    };

    constructor() {
        super();
        this.currentIndex = 0;
        this.slidersDisabled = false;
        this._pollTimer = null;
        this.sendTimer = null;
        this.currentCoffee = localStorage.getItem('coffeeSelectedProgram');
        this.selectedBeverage = '';
    }

    createRenderRoot() {
        return this; // use light DOM so styles apply
    }

    connectedCallback() {
        super.connectedCallback();
        updateThemeVars();

        if (this.ctx?.options && !isNaN(this.currentIndex)) {
            const saved = this.currentCoffee;
            if (saved) {
                const idx = this.ctx.options.indexOf(saved);
                if (idx >= 0) {
                    this.currentIndex = idx;
                    this.ctx.selectedProgram = saved;
                    this.ctx.selectedCoffee = formatProgramName(saved);
                }
            }
        }
    }

    // Initializes the swiping function after the rendering is finished
    firstUpdated() {
        setTimeout(() => {
            if (this.ctx?.options && this.currentCoffee) {
                const savedIndex = this.ctx.options.indexOf(this.currentCoffee);
                if (savedIndex >= 0) {
                    this.currentIndex = savedIndex;
                    this.ctx.selectedProgram = this.currentCoffee;
                    this.ctx.selectedCoffee = formatProgramName(this.currentCoffee);
                }
            }

            const swiperEl = this.querySelector('.mySwiper');
            if (!swiperEl) return;

            this.swiper = new Swiper(swiperEl, {
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 3,
                spaceBetween: 30,
                initialSlide: this.currentIndex,
                lazy: true,
                coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
                },
                on: {
                    init: () => {
                        this._swiperInitialized = true;
                    },
                    touchStart: () => {
                        if (!this._swiperInitialized || !this.ctx.isOn) return;
                        this.slidersDisabled = true;
                        this.requestUpdate();
                    },
                    slideChangeTransitionStart: () => {
                        if (!this._swiperInitialized || !this.ctx.isOn) return;
                        if (this.swiper.activeIndex === this.currentIndex) return;
                        this.slidersDisabled = true;
                        this.requestUpdate();
                    },
                    slideChange: (swiper) => {
                        if (!this._swiperInitialized || !this.ctx.isOn) return;
                        this.currentIndex = swiper.activeIndex;

                        this.selectedBeverage = this.ctx.options[this.currentIndex];
                        this.ctx.selectedProgram = this.selectedBeverage;
                        this.ctx.selectedCoffee = formatProgramName(this.selectedBeverage);

                        if (this.ctx.getStateByKey('operation_state') === 'ready') {
                            clearTimeout(this.sendTimer);
                            this.sendTimer = setTimeout(() => {
                                this._sendToHomeConnect(this.selectedBeverage);
                                localStorage.setItem('coffeeSelectedProgram', this.selectedBeverage);

                                this.slidersDisabled = false;
                                this.requestUpdate();
                            }, 1000);
                        } else {
                            this.slidersDisabled = false;
                            this.requestUpdate();
                        }
                    },
                }
            });
            this._updateSwiperState();
        }, 150);
    }

    updated(changedProperties) {
        if (this.swiper && changedProperties.has('ctx')) {
            this._updateSwiperState();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this._pollTimer);
        clearTimeout(this.sendTimer);
    }

    /* Only update when coffee changes - according to min and max values
     */
    shouldUpdate(changedProperties) {
        if (changedProperties.has('hass')) {
            const oldHass = changedProperties.get('hass');
            const newHass = this.hass;
            if ((oldHass?.states[this.ctx.getMetaByKey('fill_quantity').entity_id].attributes.min
                && oldHass?.states[this.ctx.getMetaByKey('fill_quantity').entity_id].attributes.max) !== 
                (newHass?.states[this.ctx.getMetaByKey('fill_quantity').entity_id].attributes.min 
                && newHass?.states[this.ctx.getMetaByKey('fill_quantity').entity_id].attributes.max)) {
                this.quantityEntity = this.ctx.getEntityByKey('fill_quantity');
                this.beanEntity = this.ctx.getEntityByKey('bean_amount');
                return true;
            }
            if (newHass?.states[this.ctx.getMetaByKey('operation_state').entity_id].state === 'inactive') {
                return true;
            } else if (newHass?.states[this.ctx.getMetaByKey('operation_state').entity_id].state === 'ready') {
                return true;
            }
        }
        if (changedProperties.has('selectedProgram')) {
            return true;
        }
        if (changedProperties.has('ctx')) {
            return true;
        }
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return html``;

        // renders the slider and inputfields and puts them into an array
        // pass disabled flag so renderSlider / _renderSlidersForSelectedCoffee can render disabled inputs
        const allSliders = renderSlidersForSelectedCoffee(ctx, this.quantityEntity, this.beanEntity, this.slidersDisabled);

        // reads the slider array and cuts them into half/half for desktop view
        const bean_temperatureSlider = allSliders[0];
        const quantitySlider = allSliders[1];

        // Sets the currently selected coffee as the headline        
        const rawName = formatProgramName(ctx.options?.[this.currentIndex]);
        const coffeeName = rawName.replace("World ", "").replace("X L", "XL");
        const label = coffeeName;

        return html`
            <ha-card>
                <div class="card-content">
                    <div class="header">
                        <span>
                            <input type="image" src="${icons.power}" class="icon" alt="Power"
                                style="${ctx.isOn 
                                        ? 'filter: invert(26%) sepia(89%) saturate(1583%) hue-rotate(95deg) brightness(96%) contrast(106%)' 
                                        : 'filter: invert(16%) sepia(99%) saturate(7404%) hue-rotate(4deg) brightness(95%) contrast(118%)'};"
                                @click=${() => ctx._setLayout('power')} />
                            <div style="text-align: center;">${ctx.isOn ? 'ON' : 'OFF'}</div>
                        </span>
                        <span>
                            <h2>${coffeeName}</h2>
                        </span>
                        <span>
                            <input type="image" src="${icons.stats}" alt="Stats"
                                class="icon"
                                @click=${() => ctx._setLayout('stats')} />
                        </span>
                    </div>

                    <div class="container">
                        <div class="box">

                            ${ctx.isMobile ? html`
                                <div class="swiper mySwiper">
                                    <div class="swiper-wrapper">
                                        ${ctx.options.map((p, i) => {
                                            const name = formatProgramName(p)
                                                .replace(/^World /, '')
                                                .replaceAll(' ', '-')
                                                .replace('X-L', 'XL');
                                            return html`
                                                <div class="swiper-slide">
                                                    <img src="${drinkImages[name]}" 
                                                        class="swiper-lazy ${i === this.currentIndex ? 'active' : ''}"
                                                        loading="lazy" />
                                                    <div class="swiper-lazy-preloader"></div>
                                                </div>
                                            `;
                                        })}
                                    </div>
                                </div>
                                
                            ` : html`
                                <input type="image" src="${drinkImages[label]}" ?disabled="${!ctx.isOn}" alt="${label}"
                                    class="coffee-img" draggable="false" title="${!ctx.isOn ? 'Device is offline' : ''}"
                                    @click=${() => ctx._setLayout('select')} />
                            `}
                            
                            <div class="button-wrapper">
                                ${!ctx.isMobile ? html`
                                    <button class="button ${!ctx.isOn ? 'off' : ''}" 
                                            @click=${() => ctx._setLayout('select')} 
                                            ?disabled="${!ctx.isOn}"
                                            title="${!ctx.isOn ? 'Device is offline' : ''}">
                                        Select Coffee
                                    </button>
                                ` : ''}
                            </div>
                            
                            <div id="slider-box">
                                ${/* If not a mobile device render the slider and input fields horizontally;
                                    if mobile device render them vertically */''}
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
                        <div id="error-box">
                            
                        </div>
                        <button ?disabled="${!ctx.isOn}" 
                                class="start ${!ctx.isOn ? 'off' : ''}" 
                                @click=${() => this._startCoffee(ctx)}
                                title="${!ctx.isOn ? 'Device is offline' : ''}">
                            Start
                        </button>
                    </div>
                </div>
            </ha-card>
        `;
    }

    _updateSwiperState() {
        if (!this.swiper) return;
        
        const disabled = !this.ctx.isOn;
        this.swiper.allowSlideNext = !disabled;
        this.swiper.allowSlidePrev = !disabled;
        this.swiper.allowTouchMove = !disabled;

        const swiperEl = this.querySelector('.mySwiper');
        if (swiperEl) {
            swiperEl.classList.toggle('disabled', disabled);
        }
    }

    // Helperfunction to send data to home connect after swiping
    _sendToHomeConnect(program) {
        this.ctx._hass.callService('home_connect', 'set_program_and_options', {
            device_id: this.ctx.deviceId,
            affects_to: 'selected_program',
            program: program
        });
    }


    // when start button is clicked, send current program as active program to home connect,
    // which starts the program
    _startCoffee(ctx) {
        if (ctx.getStateByKey('operation_state') === 'ready') {
            ctx._hass.callService('home_connect', 'set_program_and_options', {
                device_id: ctx.deviceId,
                affects_to: 'active_program',
                program: ctx.selectedProgram
            });
        }
        ctx._setLayout('start');
    }
}

if (!customElements.get('coffee-frontpage')) {
    customElements.define('coffee-frontpage', CoffeeFrontPage);
}