import mapboxgl from "mapbox-gl";
import { createHtmlElement } from "../utils";
import ExtendControl, { UIPosition } from "./ExtendControl";
import { LayerGroupsType, SelectAndClearAllOptions, ShowToTopOptions, getLayerIds } from "../features/SwitchLayer/types";
import SwitchGroupContainer from "../features/SwitchLayer/SwitchGroupContainer";
import SvgBuilder from "../svg";

export interface SwitchLayerOptions extends SelectAndClearAllOptions, ShowToTopOptions {
    /**
     * 图标
     */
    icon?: string | SVGElement,

    /**
     * 名称 ：默认'图层'
     */
    name?: string,
    layerGroups: LayerGroupsType,

    /**
     * 组件位置
     */
    position?: UIPosition
}


export abstract class SwitchLayerBaseControl implements mapboxgl.IControl {
    protected groupContainers: Array<SwitchGroupContainer> = [];

    abstract onAdd(map: mapboxgl.Map): HTMLElement;

    onRemove(map: mapboxgl.Map): void {
        this.groupContainers.forEach(gc => {
            gc.layerBtns.forEach(lb => {
                getLayerIds(lb.options.layer).forEach(l=>{
                    map.removeLayer(l);
                });
            })
        });
    }

    changeLayerVisible(id: string, value?: boolean) {
        for (let i = 0; i < this.groupContainers.length; i++) {
            SwitchGroupContainer.setLayerVisible(this.groupContainers[i], id, value);
        }
    }
}

export default class SwitchLayerControl extends SwitchLayerBaseControl {
    declare extendControl: ExtendControl;

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

        this.extendControl = new ExtendControl({
            img1: this.options.icon || new SvgBuilder('layer').create(),
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
                    this.extendControl.open = false;
                })

                return container;
            }
        });

        return this.extendControl.onAdd(map);
    }

    onRemove(map: mapboxgl.Map): void {
        super.onRemove(map);
        this.extendControl.onRemove(map);
    }

    getDefaultPosition() { return this.options.position! };
}