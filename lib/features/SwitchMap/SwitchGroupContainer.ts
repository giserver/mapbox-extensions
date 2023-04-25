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

    private collapsed: boolean = false;
    private containerDefaultDisplay: string;

    /**
     *
     */
    constructor(private map: Map, name: string, readonly options: SwitchGroupLayers, readonly extraInfo: SwitchMapExtraInfo) {
        this.element = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group');

        const container = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group-container', options.uiType === "SwitchBtn" ? 'one-col' : 'mul-col');

        this.options.layers.forEach(layer => {
            const btn = options.uiType === "SwitchBtn" ?
                new SwitchLayerButton(map, layer, this) :
                new ImgTxtSwitchLayerButton(map, layer, this);

            this.layerBtns.push(btn);
            container.append(btn.element);
        });

        this.containerDefaultDisplay = container.style.display;

        this.element.append(this.createHeader(name, container));
        this.element.append(container);
    }

    private createHeader(name: string, container: HTMLElement) {
        const header = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group-header');
        const title = createHtmlElement('div', 'jas-ctrl-switchmap-alert-container-group-header-title', 'jas-flex-center');
        const label = createHtmlElement('div');
        label.innerText = name;
        if (this.options.collapse)
            title.append(this.createCollapseController(container));
        title.append(label)
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

    private createCollapseController(container: HTMLElement) {
        const element = createHtmlElement('div', "jas-collapse-arrow", "jas-collapse-active", "jas-ctrl-switchmap-alert-container-group-header-title-collapse");

        element.addEventListener('click', e => {
            container.style.display = this.collapsed ? this.containerDefaultDisplay : 'none';
            this.collapsed = !this.collapsed;
            element.classList.toggle("jas-collapse-active");
        });

        return element;
    }
}