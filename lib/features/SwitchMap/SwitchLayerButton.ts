import { Map } from "mapbox-gl";
import { SwitchButton } from "../../uis";
import SwitchLayerButtonBase from "./SwitchLayerButtonBase";
import { SwitchLayerItem } from "./types";

export default class SwitchLayerButton extends SwitchLayerButtonBase {

    /**
     *
     */
    constructor(map: Map, item: SwitchLayerItem) {
        super(map, item);
    }

    protected check(): void {
        this.element.setAttribute(this.token, this.token);
    }
    protected unCheck(): void {
        this.element.attributes.removeNamedItem(this.token);
    }
    protected createHtmlElement(): HTMLElement {
        return SwitchButton.create(this.item.name);
    }
}