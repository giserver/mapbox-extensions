import { Map } from "mapbox-gl";
import { SwitchMapExtraInfo } from "../../controls/SwitchMapControl";
import { createHtmlElement } from "../../utils";
import ImgTxtSwitchLayerButton from "./ImgTxtSwitchLayerButton";
import SwitchLayerButton from "./SwitchLayerButton";
import SwitchLayerButtonBase from "./SwitchLayerButtonBase";
import { SwitchGroupLayers } from "./types";

export default class SwitchGroupContainer {

    private layerBtns: Array<SwitchLayerButtonBase> = [];
    readonly element: HTMLElement;

    /**
     *
     */
    constructor(private map: Map, name: string, private options: SwitchGroupLayers, extraInfo: SwitchMapExtraInfo) {
        this.element = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group');
        const header = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group-header');
        header.innerHTML = `<span>${name}</span>`;
        this.element.append(header);

        const container = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group-container', options.uiType === "SwitchBtn" ? 'one-col' : 'mul-col');

        this.options.layers.forEach(layer => {
            const btn = options.uiType === "SwitchBtn" ?
                new SwitchLayerButton(map, layer, extraInfo) :
                new ImgTxtSwitchLayerButton(map, layer, extraInfo);

            this.layerBtns.push(btn);
            btn.element.addEventListener('click', e => {
                btn.changeChecked(undefined, true);

                if (btn.checked) {
                    this.layerBtns.forEach(oBtn => {
                        if (oBtn.id !== btn.id && (this.options.mutex || btn.options.mutex || oBtn.options.mutex))
                            oBtn.changeChecked(false);
                    })
                }
            });

            container.append(btn.element);
        });

        this.element.append(container);
    }
}