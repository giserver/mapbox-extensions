import { Map } from "mapbox-gl";
import { createHtmlElement, orderBy } from "../../utils";
import ImgTxtSwitchLayerButton from "./ImgTxtSwitchLayerButton";
import SwitchLayerButton from "./SwitchLayerButton";
import SwitchLayerButtonBase from "./SwitchLayerButtonBase";
import { LayerGroupsType, SelectAndClearAllOptions, ShowToTopOptions, SwitchGroupLayers, SwitchLayerItem, getLayers } from "./types";
import mitt, { Emitter } from "mitt";
import { SwitchLayerEventType } from "../../events";

export default class SwitchGroupContainer {

    readonly layerBtns: Array<SwitchLayerButtonBase> = [];
    readonly element: HTMLElement;

    /**
     *
     */
    constructor(map: Map,
        readonly name: string,
        readonly options: SwitchGroupLayers,
        readonly extraOptions: SelectAndClearAllOptions & ShowToTopOptions & { emitter: Emitter<SwitchLayerEventType> }) {
        this.element = createHtmlElement('div', 'jas-ctrl-switchlayer-group');

        const container = createHtmlElement('div', 'jas-ctrl-switchlayer-group-container', options.uiType === "SwitchBtn" ? 'one-col' : 'mul-col');

        this.options.layers.forEach(layer => {
            const btn = options.uiType === "SwitchBtn" ?
                new SwitchLayerButton(map, layer, this) :
                new ImgTxtSwitchLayerButton(map, layer, this);

            this.layerBtns.push(btn);
            container.append(btn.element);
        });

        this.element.append(this.createHeader(name, container));
        this.element.append(container);
    }

    private createHeader(name: string, container: HTMLElement) {
        const header = createHtmlElement('div', 'jas-ctrl-switchlayer-group-header');
        const title = createHtmlElement('div', 'jas-ctrl-switchlayer-group-header-title', 'jas-flex-center');
        const label = createHtmlElement('div');
        label.innerText = name;
        if (this.options.collapse) {
            const collapseElement = this.createCollapseController(container);
            title.append(collapseElement);
            if (this.options.defaultCollapsed)
                collapseElement.click();
        }

        title.append(label)
        header.append(title);

        if (this.options.mutex || !this.extraOptions.selectAndClearAll)
            return header;

        const controls = createHtmlElement('div', "jas-ctrl-switchlayer-group-header-controls");

        // 当没有互斥时可以添加全选控件
        if (this.options.layers.every(x => !x.mutex)) {
            const selectAll = createHtmlElement('div', "jas-ctrl-switchlayer-group-header-controls-item");
            selectAll.innerText = this.extraOptions.selectAllLabel!;
            selectAll.addEventListener('click', () => {
                this.layerBtns.forEach(btn => {
                    if (!btn.checked)
                        btn.changeChecked(true);
                })
            })
            controls.append(selectAll);
            const split = createHtmlElement('div', "jas-ctrl-switchlayer-group-header-controls-split");
            split.innerText = "|";
            controls.append(split);
        }

        const clearAll = createHtmlElement('div', "jas-ctrl-switchlayer-group-header-controls-item");
        clearAll.innerText = this.extraOptions.clearAllLabel!;
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
        const element = createHtmlElement('div', "jas-collapse-arrow", "jas-collapse-active", "jas-ctrl-switchlayer-group-header-title-collapse");

        element.addEventListener('click', e => {
            container.classList.toggle("jas-ctrl-switchlayer-group-container-hidden");
            element.classList.toggle("jas-collapse-active");
        });

        return element;
    }

    static appendLayerGroups(
        map: mapboxgl.Map,
        container: HTMLElement,
        layerGroups: LayerGroupsType,
        options: SelectAndClearAllOptions & ShowToTopOptions = {}) {

        const allLayers = new Array<SwitchLayerItem>();
        const groupContainers = new Array<SwitchGroupContainer>();
        const emitter = mitt<SwitchLayerEventType>();

        for (let groupName in layerGroups) {
            const { layers, mutex } = layerGroups[groupName];
            let onceLayerActiveMutex = false;

            layers.forEach(item => {
                // 检查互斥active
                if (item.active && onceLayerActiveMutex)
                    throw new Error("exsit mutex layer active at same time!");
                if ((item.mutex || mutex) && item.active)
                    onceLayerActiveMutex = true;

                // 初始化默认值
                item.zoom ??= 0;
                allLayers.push(item);
            })
        }

        orderBy(allLayers, l => l.zoom!);
        allLayers.forEach(l => {
            getLayers(l.layer).forEach(l=>{
                map.addLayer(l);
            });
        })

        for (let groupName in layerGroups) {
            const groupContainer = new SwitchGroupContainer(map, groupName, layerGroups[groupName], { ...options, emitter });
            container.append(groupContainer.element);
            groupContainers.push(groupContainer);
        }

        emitter.on('layer-visible-changed', e => {

            // 判断互斥 改变与之互斥button checked为false
            if (e.btn.checked) {
                // 全局互斥标识
                if (e.btn.options.mutexIdentity) {
                    groupContainers.forEach(x => {
                        x.layerBtns.forEach(oBtn => {
                            if (oBtn === e.btn) return;

                            if (oBtn.options.mutexIdentity === e.btn.options.mutexIdentity)
                                oBtn.changeChecked(false);
                        })
                    })
                }
                // 仅仅组内互斥
                e.btn.container.layerBtns.forEach(oBtn => {
                    if (oBtn === e.btn) return;

                    if (e.btn.container.options.mutex ||
                        e.btn.options.mutex ||
                        oBtn.options.mutex) {
                        oBtn.changeChecked(false);
                    }
                });
            }
        })

        return groupContainers;
    }

    static setLayerVisible(gc: SwitchGroupContainer, id: string, value?: boolean) {
        for (let j = 0; j < gc.layerBtns.length; j++) {
            const lBtn = gc.layerBtns[j];

            if (lBtn.id === id) {
                lBtn.changeChecked(value, true);
                gc.extraOptions.emitter.emit('layer-visible-changed', { btn: lBtn });
            }
        }
    }
}