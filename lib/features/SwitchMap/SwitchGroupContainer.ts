import { Map } from "mapbox-gl";
import { SwitchMapExtraInfo } from "../../controls/SwitchMapControl";
import { createHtmlElement } from "../../utils";
import ImgTxtSwitchLayerButton from "./ImgTxtSwitchLayerButton";
import SwitchLayerButton from "./SwitchLayerButton";
import SwitchLayerButtonBase from "./SwitchLayerButtonBase";
import { SwitchGroupLayers } from "./types";

export default class SwitchGroupContainer {

    readonly layerBtns: Array<SwitchLayerButtonBase> = [];
    readonly element: HTMLElement;

    /**
     *
     */
    constructor(private map: Map, name: string, readonly options: SwitchGroupLayers, readonly extraInfo: SwitchMapExtraInfo) {
        this.element = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group');
        const header = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group-header');
        header.innerHTML = `<span>${name}</span>`;
        this.element.append(header);

        const container = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group-container', options.uiType === "SwitchBtn" ? 'one-col' : 'mul-col');

        this.options.layers.forEach(layer => {
            const btn = options.uiType === "SwitchBtn" ?
                new SwitchLayerButton(map, layer, this) :
                new ImgTxtSwitchLayerButton(map, layer, this);

            this.layerBtns.push(btn);
            container.append(btn.element);
        });

        this.element.append(container);
    }
}