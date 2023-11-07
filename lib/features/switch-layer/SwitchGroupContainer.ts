import { Map } from "mapbox-gl";
import { dom } from 'wheater';
import mitt, { Emitter } from "mitt";
import {
    SwitchLayerButtonBase,
    ImgTxtSwitchLayerButton,
    SwitchLayerButton,
    SwitchLayerGroupsType,
    SelectAndClearAllOptions,
    ShowToTopOptions,
    SwitchGroupLayers,
    SwitchLayerItem,
    getLayers
} from ".";

export type SwitchLayerEventType = {
    "layer-visible-changed": {
        btn: SwitchLayerButtonBase;
    };
};


export default class SwitchGroupContainer {

    readonly layerBtns: Array<SwitchLayerButtonBase> = [];
    readonly element: HTMLElement;

    /**
     * 创建图层组面板
     */
    constructor(map: Map,
        readonly name: string,
        readonly options: SwitchGroupLayers,
        readonly extraOptions: SelectAndClearAllOptions & ShowToTopOptions & { emitter: Emitter<SwitchLayerEventType> }) {

        const container = dom.createHtmlElement('div',
            ['jas-ctrl-switchlayer-group-container', options.uiType === "SwitchBtn" ? 'one-col' : 'mul-col'],
            this.options.layers.map(layer => {
                const btn = options.uiType === "SwitchBtn" ?
                    new SwitchLayerButton(map, layer, this) :
                    new ImgTxtSwitchLayerButton(map, layer, this);

                this.layerBtns.push(btn);
                return btn.element;
            })
        );

        const header = this.createHeader(name, () => {
            container.classList.toggle("jas-ctrl-switchlayer-group-container-hidden");
        });

        this.element = dom.createHtmlElement('div',
            ['jas-ctrl-switchlayer-group'],
            [header, container]
        );
    }

    private createHeader(name: string, onTitleClick?: () => void) {
        const header = dom.createHtmlElement('div', ['jas-ctrl-switchlayer-group-header']);
        const title = dom.createHtmlElement('div', ['jas-ctrl-switchlayer-group-header-title', 'jas-flex-center']);
        const label = dom.createHtmlElement('div', [], [name]);

        //#region  折叠、标题

        // 添加折叠按钮
        if (this.options.collapse) {
            const collapseElement = dom.createHtmlElement('div',
                ["jas-collapse-arrow", "jas-collapse-active", "jas-ctrl-switchlayer-group-header-title-collapse"]);

            title.addEventListener('click', e => {
                onTitleClick?.call(undefined);
                collapseElement.classList.toggle("jas-collapse-active");
            });
            title.append(collapseElement);
            if (this.options.defaultCollapsed)
                collapseElement.click();
        }

        // 添加标题
        title.append(label)
        header.append(title);

        if (this.options.mutex || !this.extraOptions.selectAndClearAll)
            return header;

        //#endregion

        //#region 清空 全选
        const suffixControls = dom.createHtmlElement('div', ["jas-ctrl-switchlayer-group-header-controls"]);

        // 添加全选组件
        // 当没有互斥时可以添加全选控件
        if (this.options.layers.every(x => !x.mutex)) {
            const selectAll = dom.createHtmlElement('div', ["jas-ctrl-switchlayer-group-header-controls-item"]);
            selectAll.innerText = this.extraOptions.selectAllLabel!;
            selectAll.addEventListener('click', () => {
                this.layerBtns.forEach(btn => {
                    if (!btn.checked)
                        btn.changeChecked(true);
                })
            })
            suffixControls.append(selectAll);
            const split = dom.createHtmlElement('div', ["jas-ctrl-switchlayer-group-header-controls-split"]);
            split.innerText = "|";
            suffixControls.append(split);
        }

        // 添加清除组件
        suffixControls.append(dom.createHtmlElement('div',
            ["jas-ctrl-switchlayer-group-header-controls-item"],
            [this.extraOptions.clearAllLabel!],
            {
                onClick: () => {
                    this.layerBtns.forEach(btn => {
                        if (btn.checked)
                            btn.changeChecked(false);
                    })
                }
            }
        ));

        header.append(suffixControls);
        return header;
        //#endregion
    }

    static appendLayerGroups(
        map: mapboxgl.Map,
        container: HTMLElement,
        layerGroups: SwitchLayerGroupsType,
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

        allLayers
            .sort((a, b) => a.zoom! - b.zoom!)
            .forEach(l => {
                getLayers(l.layer).forEach(l => {
                    map.addLayer(l);
                });
            });

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