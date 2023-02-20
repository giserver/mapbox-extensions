import { Map } from "mapbox-gl";
import { SwitchMapExtraInfo } from "../../controls/SwitchMapControl";
import { SwitchButton } from "../../uis";
import SwitchLayerButtonBase from "./SwitchLayerButtonBase";
import { SwitchLayerItem } from "./types";

export default class SwitchLayerButton extends SwitchLayerButtonBase {
    private declare inputEle: HTMLInputElement;

    /**
     *
     */
    constructor(map: Map, options: SwitchLayerItem, extraInfo: SwitchMapExtraInfo) {
        super(map, options, extraInfo);
    }

    protected check(): void {
        this.inputEle.setAttribute(this.token, this.token);
    }
    protected unCheck(): void {
        this.inputEle.removeAttribute(this.token);
        this.inputEle.checked = false;
    }
    protected createHtmlElement(): HTMLElement {
        return SwitchButton.create(this.options.name, this.options.active, inputEle => {
            this.inputEle = inputEle;
        });
    }
}