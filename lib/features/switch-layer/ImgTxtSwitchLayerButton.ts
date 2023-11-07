import { Map } from "mapbox-gl";
import { dom } from 'wheater';
import {SwitchLayerButtonBase, SwitchLayerItem, SwitchGroupContainer } from ".";

export default class ImgTxtSwitchLayerButton extends SwitchLayerButtonBase {

    private declare imgDiv: HTMLDivElement;

    constructor(map: Map, options: SwitchLayerItem, container: SwitchGroupContainer) {
        super(map, options, container);
    }

    protected check(): void {
        this.element.classList.add(this.token);
        if (this.options.backgroundImageActive) {
            this.imgDiv.style.backgroundImage = `url('${this.options.backgroundImageActive}')`;
        }
    }
    protected unCheck(): void {
        this.element.classList.remove(this.token);
        if (this.options.backgroundImage && this.options.backgroundImageActive) {
            this.imgDiv.style.backgroundImage = `url('${this.options.backgroundImage}')`;
        }
    }

    protected createHtmlElement() {
        this.imgDiv = dom.createHtmlElement('div', ["jas-img-txt-switch-button-img"]);
        if (this.options.backgroundImage) {
            this.imgDiv.style.backgroundImage = `url('${this.options.backgroundImage}')`;
        }

        const imgTxtButton = dom.createHtmlElement('div',
            ["jas-img-txt-switch-button"],
            [this.imgDiv, dom.createHtmlElement('div', ["jas-img-txt-switch-button-txt"], [this.options.name])]
        );

        return { container: imgTxtButton, button: imgTxtButton };
    }
}