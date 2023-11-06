import mapboxgl from "mapbox-gl";
import { dom } from 'wheater';
import { UIPosition } from "../common/types";
import SvgBuilder from "../common/svg";
import ExtendControl from "./ExtendControl";
import { LayerGroupsType, SelectAndClearAllOptions, ShowToTopOptions, getLayerIds } from "../features/SwitchLayer/types";
import SwitchGroupContainer from "../features/SwitchLayer/SwitchGroupContainer";

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
                getLayerIds(lb.options.layer).forEach(l => {
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
            title: this.options.name,
            closeable: true,
            content: map => {
                const groups = dom.createHtmlElement('div', ['jas-ctrl-switchlayer-container-groups', 'jas-ctrl-custom-scrollbar']);
                this.groupContainers = SwitchGroupContainer.appendLayerGroups(map, groups, this.options.layerGroups, this.options);
                return dom.createHtmlElement('div', ["jas-ctrl-switchlayer-container"], [groups]);
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