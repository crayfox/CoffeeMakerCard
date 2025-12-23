import { html } from 'lit';
import { icons } from './assets/images.js';
import { formatProgramName } from './utils.js';

// simple cache per device+key to avoid recomputing options on every render
const sliderOptionsCache = new Map();

// renders the slider section
export const renderSlidersForSelectedCoffee = (ctx, quantityEntity, beanEntity, disabled = false) => {
    if (!quantityEntity) {
      quantityEntity = ctx.getEntityByKey('fill_quantity');
    }
    if (!beanEntity) {
      beanEntity = ctx.getEntityByKey('bean_amount');
    }

    const currentValue = Number.parseInt(quantityEntity.state);
    const { min, max, step } = quantityEntity.attributes;
    const midValue = Math.round(((min + max) / 2 - min) / step) * step + min;

    const value = currentValue >= min && currentValue <= max ? currentValue : midValue;

    const beanValue = beanEntity.state?.split("_").slice(8).join(" ");

    const savedBeanValue = ctx.values?.[formatProgramName(ctx.selectedProgram)]?.beans ?? beanValue;
    const savedAmountValue = ctx.values?.[formatProgramName(ctx.selectedProgram)]?.amount ?? value;

    const arranged = [];

    switch (formatProgramName(ctx.selectedProgram)) {
        case "Hot Water": {
            const hotWaterState = ctx.getEntityByKey('hot_water_temperature');
            if (hotWaterState) {
                const waterValue = Number.Number.parseInt(hotWaterState.state.split("_")[9]);
                arranged.push(renderSlider(ctx, "temperature", "hot_water", null, null, waterValue, 10, disabled));
            }
            break;
        }
        case "Warm Milk":
        case "Milk Froth":
            break;
        default:
            arranged.push(renderSlider(ctx, "beans", "beans", null, null, savedBeanValue, 1, disabled));
    }

    arranged.push(renderSlider(ctx, "quantity", "amount", min, max, savedAmountValue, step, disabled));
    return arranged;
};

export const computeSliderData = (ctx, key, value) => {
    const device = ctx?.match?.[0];
    const cacheKey = `${device}_${key}`;
    let cached = sliderOptionsCache.get(cacheKey);

    let unit = 'ml';
    let options = [];
    let baseConfig = { min: null, max: null, step: 1 };

    if (key === "beans") {
        const beanEntity = ctx.getAttributesByKey('bean_amount');
        options = (beanEntity?.options || []).map(opt => opt.split("_").slice(8).join(" "));
        const order = ['mild', 'normal', 'strong', 'very strong'];
        options = options.sort((a, b) => order.indexOf(a) - order.indexOf(b));
        unit = '';
        baseConfig = { min: 0, max: Math.max(0, options.length - 1), step: 1 };
    } else if (key === "hot_water") {
        const rawOptions = ctx.getAttributesByKey('hot_water_temperature').options || [];
        options = rawOptions.map(o => Number.parseInt(o.split("_").slice(9, 10)));
        const order = [70, 80, 90, 97];
        options = options.sort((a, b) => order.indexOf(a) - order.indexOf(b));
        unit = '°C';
        baseConfig = { min: 0, max: Math.max(0, options.length - 1), step: 1 };
    } else if (key === "amount") {
        const fillEntity = ctx.getAttributesByKey('fill_quantity');
        options = null;
        baseConfig = { min: fillEntity.min, max: fillEntity.max, step: fillEntity.step };
    }

    cached = { options, unit, baseConfig };
    sliderOptionsCache.set(cacheKey, cached);

    // compute sliderConfig.value per-call (depends on current value)
    let sliderConfig = { ...cached.baseConfig, value };
    if (cached.options?.length) {
        if (key === "hot_water") {
            sliderConfig.value = cached.options.indexOf(Number.parseInt(value));
        } else {
            sliderConfig.value = cached.options.indexOf(value);
        }
    }

    return { options: cached.options, unit: cached.unit, sliderConfig };
};

export const renderSlider = (ctx, label, key, min, max, value, step = 1, disabled = false) => {
    // use cached/computed slider data
    const { options, unit, sliderConfig } = computeSliderData(ctx, key, value);

    const sliderAriaLabel = `${label} slider`;
    const numberInputAriaLabel = `${label} value`;

    return html`
        <div class="control">
            <div class="label-number">
                <img src="${icons[label]}" draggable="false">
                <input class="readonly-display" style="width: ${key === 'beans' ? '70' : '25'}px;" 
                    .id=${key} 
                    .value=${options ? (options[sliderConfig.value] || value) : value} 
                    ?disabled=${disabled ? disabled : !ctx.isOn}
                    aria-label="${numberInputAriaLabel}"
                    @input=${(e) => syncSliderWithHomeConnect(ctx, key, e, options)} 
                    readonly />
                ${unit ? html`<div>${unit}</div>` : ''}

                <input type="range" 
                    .id="${key}_slider" 
                    .min=${sliderConfig.min ?? min} 
                    .max=${sliderConfig.max ?? max} 
                    .value=${sliderConfig.value} 
                    .step=${sliderConfig.step ?? step} 
                    ?disabled=${disabled ? disabled : !ctx.isOn}
                    aria-label="${sliderAriaLabel}"
                    @input=${(e) => syncSliderWithHomeConnect(ctx, key, e, options)} />
            </div>
        </div>
    `;
};

// Function to connect slider and field, so they update simultaneously
// Also connects to Home Connect and updates the Coffeemaker display
export const syncSliderWithHomeConnect = (ctx, key, e, options = null) => {
    let value = e.target.value;

    if (options) {
        if (e.target.type === "range") {
            value = options[Number.parseInt(e.target.value, 10)];
        } else if (e.target.type === "text") {
            if (!options.includes(value)) return;
        }
    }

    const coffee = ctx.selectedCoffee;
    if (!coffee) return;

    const root = e.target.getRootNode();
    const slider = root.querySelector(`#${key}_slider`);
    const numberInput = root.querySelector(`#${key}`);
    
    if (options) {
        if (slider) slider.value = options.indexOf(value);
        if (numberInput) numberInput.value = value;
    } else {
        if (slider) slider.value = value;
        if (numberInput) numberInput.value = value;
    }

    if (!ctx.values) ctx.values = {};
    if (!ctx.values[coffee]) ctx.values[coffee] = {};
    ctx.values[coffee][key] = value;

    if (ctx.dispatchEvent) {
        ctx.dispatchEvent(
            new CustomEvent("coffee-settings-changed", {
                detail: { coffee, key, value },
                bubbles: true,
                composed: true,
            })
        );
    }

    ctx.requestUpdate()?.();

    let optionValue = 0;

    if (ctx.getStateByKey('operation_state') === 'ready') {
        if (key === "beans") {
            optionValue = "consumer_products_coffee_maker_enum_type_bean_amount_" + value.replaceAll(/\s+/g, "_");
            ctx._hass.callService("home_connect", "set_program_and_options", {
                device_id: ctx.deviceId,
                affects_to: 'selected_program',
                consumer_products_coffee_maker_option_bean_amount: optionValue,
            });
        } else if (key === "amount") {
            optionValue = Number(value);
            ctx._hass.callService("home_connect", "set_program_and_options", {
                device_id: ctx.deviceId,
                affects_to: 'selected_program',
                consumer_products_coffee_maker_option_fill_quantity: optionValue,
            });
        } else if (key === "hot_water") {
            optionValue = "consumer_products_coffee_maker_enum_type_hot_water_temperature_" + value + "_c";
            ctx._hass.callService("home_connect", "set_program_and_options", {
                device_id: ctx.deviceId,
                affects_to: 'selected_program',
                consumer_products_coffee_maker_option_hot_water_temperature: optionValue,
            });
        }
    }
};