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
        this.element.append(this.createHeader(name));

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

    private createHeader(name: string) {
        const header = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group-header');
        const title = createHtmlElement('div');
        title.innerText = name;
        header.append(title);

        if (this.options.mutex || !this.extraInfo.selectAndClearAll)
            return header;

        const controls = createHtmlElement('div', "jas-ctrl-switchmap-alert-container-group-header-controls");

        // 当没有互斥时可以添加全选控件
        if (this.options.layers.every(x => !x.mutex)) {
            const selectAll = createHtmlElement('div', "jas-ctrl-switchmap-alert-container-group-header-controls-item");
            selectAll.innerText = this.extraInfo.selectAllLabel!;
            selectAll.addEventListener('click', () => {
                this.layerBtns.forEach(btn => {
                    if (!btn.checked)
                        btn.changeChecked(true);
                })
            })
            controls.append(selectAll);
            const split = createHtmlElement('div', "jas-ctrl-switchmap-alert-container-group-header-controls-split");
            split.innerText = "|";
            controls.append(split);
        }

        const clearAll = createHtmlElement('div', "jas-ctrl-switchmap-alert-container-group-header-controls-item");
        clearAll.innerText = this.extraInfo.clearAllLabel!;
        clearAll.addEventListener('click', () => {
            this.layerBtns.forEach(btn => {
                if (btn.checked)
                    btn.changeChecked(false);
            })
        });
        controls.append(clearAll);

        header.append(controls);
        return header;
    }
}