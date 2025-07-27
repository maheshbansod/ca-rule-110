//@ts-check

/**
 *
 * ig i'm creating like a switch web component
 * let's call it light-switch
 *
 *
 * Usage:
 *
 * <light-switch name="mySwitch">
 *    <switch-state data-switch-state="m1">1</switch-state>
 *    <switch-state data-switch-state="m2">2</switch-state>
 * </light-switch>
 *
 * Then I can ig use this with CSS classes - to apply/unapply classes automatically all over the HTML?
 * Like so,
 *
 * <span data-switch-check-for="mySwitch.m1">ONly visible when mySwitch m1 is on</span>
 *
 *
 * */
const SWITCH_TEMPLATE_ID = "template-light-component-switch";
const SWITCH_STATE_TEMPLATE_ID = "template-light-component-switch-state";

const switch_template = html`
<template id="${SWITCH_TEMPLATE_ID}">
  <style>
  .light-switch {
    padding: 0.5rem;
  }
  .light-switch > slot {
    display: flex;
    gap: 20px;

  }
  .light-switch  {
    > ::slotted(light-switch-state) {
      transition: all ease 0.3s;
      padding: 0.2rem 0.5rem;
    }
    > ::slotted(light-switch-state[data-active]) {
        scale: 1.3;
        background: #ddd;
    }
    ::slotted(light-switch-state:not([data-active])) {
      cursor: pointer;
    }
    ::slotted(light-switch-state:not([data-active]):hover) {
      scale: 1.3;
    }
  }
  </style>
  <div class="light-switch">
    <slot></slot>
  </div>
</template>
`;
const switch_state_template = html`
<template id="${SWITCH_STATE_TEMPLATE_ID}">
  <div class="light-switch-state">
    <slot></slot>
  </div>
</template>
`;
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('beforeend', switch_template);
  onLoad()
});

function onLoad() {
  class LightSwitch extends HTMLElement {

    /**
     * @type {Function[]}
     * */
    destructors
    /**
     * @type {Array<LightSwitchState>}
     */
    switchStates
    constructor() {
      super();
      const template = /** @type HTMLTemplateElement */(document.getElementById(
        SWITCH_TEMPLATE_ID,
      )).content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(template.cloneNode(true));

      this.destructors = [];
    }
    connectedCallback() {

      const switchStates = /** @type NodeListOf<LightSwitchState> */ (this.querySelectorAll(':scope > light-switch-state'));

      /**
       * @param {MouseEvent} e
       **/
      const onStateClick = (e) => {
        switchStates.forEach(state => {
          if (state === e.target) {
            state.dataset.active = "";
          } else if (this.#isActiveSwitch(state)) {
            delete state.dataset.active;
          }
        });
      };
      this.switchStates = [...switchStates];
      switchStates.forEach(state => {
        state.addEventListener('click', onStateClick);

      });
      this.destructors.push(() => {
        switchStates.forEach(state => {
          state.removeEventListener('click', onStateClick);
        });
      });

      const activeSwitch = this.#getActiveSwitch();
      this.#setHiddenClassBasedOnSwitch(activeSwitch);

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes" && mutation.attributeName === "data-active") {
            const target = mutation.target;
            if (target instanceof LightSwitchState) {

              if (this.#isActiveSwitch(target)) {
                this.#setHiddenClassBasedOnSwitch(target);
              }
            }
          }
        }
      });
      switchStates.forEach(state => {
        observer.observe(state, { attributeFilter: ["data-active"] })
      })
    }

    disconnectedCallback() {
      this.destructors.forEach(d => d());
    }

    get #switchName() {
      return this.dataset.switchName;
    }

    /**
     * @param {LightSwitchState} switchElem
     * @param {string} switchSelector
     */
    #shouldShowContentWithSwitchSelector(switchElem, switchSelector) {
      const parts = switchSelector.split('.');
      if (parts[0] !== this.#switchName) {
        // this is some other switch  so ignore
        return true;
      }
      const switchParts = switchElem.dataset.switchState?.split('.');
      if (!switchParts) {
        return true;
      }
      return switchParts[0] === parts[1];
    }

    #getActiveSwitch() {
      return this.switchStates.find(s => s.dataset.active !== undefined);
    }

    /**
     * @param {LightSwitchState|undefined} activeSwitch 
     */
    #setHiddenClassBasedOnSwitch(activeSwitch) {
      document.body.querySelectorAll('[data-light-switch-show-if]').forEach(el => {
        if (!activeSwitch) {
          return;
        }
        if (!(el instanceof HTMLElement)) {
          return;
        }
        const switchSelector = el.dataset.lightSwitchShowIf;
        if (!switchSelector) {
          return;
        }
        const hiddenClass = 'light-switch-element-hidden';
        if (!this.#shouldShowContentWithSwitchSelector(activeSwitch, switchSelector)) {
          el.classList.add(hiddenClass);
        } else {
          el.classList.remove(hiddenClass);
        }
      });
    }

    /**
     * @param {LightSwitchState} state
     */
    #isActiveSwitch(state) {
      return state.dataset.active !== undefined
    }
  }
  customElements.define(
    "light-switch",
    LightSwitch
  );

  class LightSwitchState extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {

    }
  }
  customElements.define(
    "light-switch-state",
    LightSwitchState
  );

}

/**
 * @param {TemplateStringsArray} strings
 * @param {string[]} values
 */
function html(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}
