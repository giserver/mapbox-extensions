import mapboxgl from "mapbox-gl";
import { createHtmlElement } from "../utils";
import ExtendControl, { UIPostion } from "./ExtendControl";
import { LayerGroupsType, SelectAndClearAllOptions, ShowToTopOptions } from "../features/SwitchLayer/types";
import SwitchGroupContainer from "../features/SwitchLayer/SwitchGroupContainer";
import SvgBuilder from "../svg";

export interface SwitchLayerOptions extends SelectAndClearAllOptions, ShowToTopOptions {
    /**
     * 名称 ：默认'图层'
     */
    name?: string,
    layerGroups: LayerGroupsType,

    /**
     * 组件位置
     */
    position?: UIPostion
}


export abstract class SwitchLayerBaseControl implements mapboxgl.IControl {
    protected groupContainers: Array<SwitchGroupContainer> = [];

    abstract onAdd(map: mapboxgl.Map): HTMLElement;

    onRemove(map: mapboxgl.Map): void {
        this.groupContainers.forEach(gc => {
            gc.layerBtns.forEach(lb => {
                const layer = lb.options.layer;

                if (layer instanceof Array) {
                    layer.forEach(l => map.removeLayer(l.id));
                } else {
                    map.removeLayer(layer.id);
                }
            })
        });
    }

    changeLayerVisible(id: string, value?: boolean) {
        for (let i = 0; i < this.groupContainers.length; i++) {
            const gc = this.groupContainers[i];
            for (let j = 0; j < gc.layerBtns.length; j++) {
                const lBtn = gc.layerBtns[j];

                if (lBtn.id === id)
                    lBtn.changeChecked(value, true);
            }
        }
    }
}

export default class SwitchLayerControl extends SwitchLayerBaseControl {

    /**
     *
     */
    constructor(private options: SwitchLayerOptions) {
        options.name ??= "图层";
        options.position ??= 'top-right';

        options.selectAndClearAll = true;
        options.selectAllLabel ??= "全选";
        options.clearAllLabel ??= "清空";

        super();
    }

    onAdd(map: mapboxgl.Map): HTMLElement {

        const extend = new ExtendControl({
            img1: new SvgBuilder('layer').create(),
            position: this.options.position,
            content: map => {
                const container = createHtmlElement('div', "jas-ctrl-switchlayer-container");

                const header = createHtmlElement('div', "jas-ctrl-switchlayer-container-header");
                const label = createHtmlElement('div', "jas-ctrl-switchlayer-container-header-label");
                label.innerText = this.options.name!;
                const close = createHtmlElement('div', "jas-ctrl-switchlayer-container-header-close");
                close.innerHTML = new SvgBuilder('X').create();
                header.append(label, close);

                const groups = createHtmlElement('div', 'jas-ctrl-switchlayer-container-groups', 'jas-ctrl-custom-scrollbar');
                container.append(header, groups);

                this.groupContainers = SwitchGroupContainer.appendLayerGroups(map, groups, this.options.layerGroups, this.options);

                close.addEventListener('click', () => {
                    extend.close();
                })

                return container;
            }
        });

        return extend.onAdd(map);
    }

    getDefaultPosition() { return this.options.position! };
}