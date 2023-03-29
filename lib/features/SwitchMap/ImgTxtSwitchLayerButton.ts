import { Map } from "mapbox-gl";
import { createHtmlElement } from '../../utils';
import SwitchLayerButtonBase from "./SwitchLayerButtonBase";
import { SwitchLayerItem } from "./types";
import SwitchGroupContainer from "./SwitchGroupContainer";

export default class ImgTxtSwitchLayerButton extends SwitchLayerButtonBase {

    constructor(map: Map, options: SwitchLayerItem, container: SwitchGroupContainer) {
        super(map, options, container);
    }

    protected check(): void {
        this.element.classList.add(this.token);
        if (this.options.backgroundImageActive) {
            const imgDiv = this.element.firstChild as HTMLDivElement;
            imgDiv.style.backgroundImage = `url('${this.options.backgroundImageActive}')`;
        }
    }
    protected unCheck(): void {
        this.element.classList.remove(this.token);
        if (this.options.backgroundImage && this.options.backgroundImageActive) {
            const imgDiv = this.element.firstChild as HTMLDivElement;
            imgDiv.style.backgroundImage = `url('${this.options.backgroundImage}')`;
        }
    }

    protected createHtmlElement() {
        const imgTxtButton = createHtmlElement('div', "jas-img-txt-switch-button");
        const imgDiv = createHtmlElement('div', "jas-img-txt-switch-button-img");
        const txtDiv = createHtmlElement('div', "jas-img-txt-switch-button-txt");
        txtDiv.innerText = this.options.name;

        imgTxtButton.append(imgDiv, txtDiv);

        return { container: imgTxtButton, button: imgTxtButton };
    }
}