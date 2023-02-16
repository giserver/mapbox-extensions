import { Map } from "mapbox-gl";
import { ImgTxtSwitchButton } from "../../uis";
import SwitchLayerButtonBase from "./SwitchLayerButtonBase";
import { SwitchLayerItem } from "./types";

export default class ImgTxtSwitchLayerButton extends SwitchLayerButtonBase {

    constructor(map: Map, options: SwitchLayerItem) {
        super(map, options);
    }

    protected check(): void {
        this.element.classList.add(this.token);
    }
    protected unCheck(): void {
        this.element.classList.remove(this.token);
    }

    protected createHtmlElement(): HTMLElement {
        return ImgTxtSwitchButton.create(this.options.name, this.options.backgroundImage);
    }
}