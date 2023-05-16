import { Map } from "mapbox-gl";
import SwitchGroupContainer from "./SwitchGroupContainer";
import SwitchLayerButtonBase from "./SwitchLayerButtonBase";
import { SwitchLayerItem } from "./types";

export default class SwitchLayerButton extends SwitchLayerButtonBase {
    private declare inputEle: HTMLInputElement;

    /**
     *
     */
    constructor(map: Map, options: SwitchLayerItem, container: SwitchGroupContainer) {
        super(map, options, container);
    }

    protected check(): void {
        this.inputEle.classList.add(this.token);
    }
    protected unCheck(): void {
        this.inputEle.classList.remove(this.token);
    }
    protected createHtmlElement() {
        const switchButton = document.createElement('div');
        switchButton.style.display = 'flex';
        switchButton.style.justifyContent = 'space-between';
        switchButton.style.alignItems = 'center';

        const inputEle = document.createElement('input');
        inputEle.classList.add("jas-switch", "jas-switch-anim");
        inputEle.setAttribute("type", "checkbox");

        const txtEle = document.createElement('div');
        txtEle.innerText = this.options.name;

        switchButton.append(txtEle, inputEle);

        this.inputEle = inputEle;
        return { container: switchButton, button: inputEle };
    }
}