import { Map, AnyLayer, AnySourceData } from "mapbox-gl";
import LayerGroup from './features/LayerGroup'
import { Dict } from './utils';

import MeasureControl, { MeasureControlOptions } from "./controls/MeasureControl";
import Measure4Mobile, { Measure4MobileOptions } from "./features/Measure/Measure4Mobile";
import Measure2Control,{ Measure2ControlOptions } from "./controls/Measure2Control";

import SwitchMapControl, { SwitchMapControlOptions, SwitchMapExtraInfo } from "./controls/SwitchMapControl";
import SwitchLayerControl, { SwitchLayerOptions } from "./controls/SwitchLayerControl";
import BackToOriginControl, { BackToOriginControlOptions } from "./controls/BackToOriginControl";
import DoodleControl, { DoodleControlOptions } from "./controls/DoodleControl";
import ExtendControl, { ExtendControlOptions } from "./controls/ExtendControl";

import SetStyleProxy from "./features/SetStyleProxy";
import SwitchGroupContainer from "./features/SwitchLayer/SwitchGroupContainer";
import { SwitchGroupLayers, SwitchLayerItem } from "./features/SwitchLayer/types";


export {
    LayerGroup,
    MeasureControl,
    Measure2Control,
    SwitchMapControl,
    SwitchLayerControl,
    BackToOriginControl,
    DoodleControl,
    ExtendControl,
    Measure4Mobile,
    SetStyleProxy,

    MeasureControlOptions,
    Measure4MobileOptions,
    Measure2ControlOptions,
    SwitchMapControlOptions,
    SwitchMapExtraInfo,
    SwitchLayerOptions,
    BackToOriginControlOptions,
    DoodleControlOptions,
    ExtendControlOptions,

    SwitchGroupContainer,
    SwitchGroupLayers,
    SwitchLayerItem,
}

declare module "mapbox-gl" {
    export interface Map {
        /**
         * 所有图层组，不要尝试自行使用
         */
        layerGroups: Dict<string, LayerGroup>

        /**
         * 所有图层组的图层id合集
         */
        getAllGroupLayerIds(): string[]

        /**
         * 创建图层组
         * @param id 图层组id
         */
        addLayerGroup(id: string): LayerGroup

        /**
         * 获取图层组
         * @param id 图层组id
         */
        getLayerGroup(id: string): LayerGroup | undefined

        /**
         * 删除图层组
         * @param id 图层id
         */
        removeLayerGroup(id: string): void

        /**
         * 
         * 替代setStyle，解决自动删除数据源和图层的问题
         * 
         * @deprecated 建议使用 {@link SetStyleProxy}
         * @param style mapbox 样式如：mapbox://styles/mapbox/dark-v10
         * @param preserveLayerIds 保留下来的layer
         * @param options 
         */
        changeStyle(style: string, preserveLayerIds: string[],
            options?: { diff?: boolean | undefined; localIdeographFontFamily?: string | undefined }): void

        /**
         * 加载多个图片
         * @param images 图片数据 eg : {'image-name1':'image-src1','image-name2':'image-src2'} 
         * @param loaded 所有数据加载完成回调
         */
        addImages(images: Record<string, string>, loaded: () => void): void

        /**
         * 销毁mapboxgl.Map实例(即使用map.remove())，并且删除所有图层组，在map document 卸载之前调用
         */
        destroy(): void
    }
}

Map.prototype.layerGroups = new Dict<string, LayerGroup>()

Map.prototype.getAllGroupLayerIds = function (this: Map) {
    let ids: string[] = [];
    this.layerGroups.forEach(group => {
        ids = ids.concat(group.layerIds);
    })

    return ids;
}

Map.prototype.addLayerGroup = function (this: Map, id: string) {
    return new LayerGroup(id, this);
}

Map.prototype.getLayerGroup = function (this: Map, id: string) {
    return this.layerGroups.get(id);
}

Map.prototype.removeLayerGroup = function (this: Map, id: string) {
    let group = this.layerGroups.get(id);
    if (group) {
        group.removeAll();
        this.layerGroups.delete(id);
    }
}

Map.prototype.changeStyle = function (this: Map, style: string, preserveLayerIds: string[],
    options?: { diff?: boolean | undefined; localIdeographFontFamily?: string | undefined }) {

    if (this.getStyle().sprite === style)
        return;

    const layers: AnyLayer[] = [];
    const sources = new Dict<string, AnySourceData>();

    this.getStyle().layers.forEach(layer => {
        if (preserveLayerIds.findIndex(x => x === layer.id) > -1) {
            layers.push(layer);
            const sourceId = (layer as any).source as string;

            if (!sources.get(sourceId))
                sources.set(sourceId, (this.getSource(sourceId) as any).serialize())
        }
    });

    const map = this;
    const onStyleLoadHandle = function () {
        sources.forEach((s, i) => map.addSource(i, s));
        layers.forEach(l => map.addLayer(l));

        map.off('style.load', onStyleLoadHandle);
    }
    map.on('style.load', onStyleLoadHandle);

    map.setStyle(style, options);
}

Map.prototype.addImages = function (this: Map, images: Record<string, string>, loaded: () => void) {
    Object.getOwnPropertyNames(images).reduce((pre, cur) => () => {
        this.loadImage(images[cur], (err, ret) => {
            if (err) throw err;
            if (!ret) throw new Error("image load error");

            this.addImage(cur, ret);
            pre();
        })
    }, loaded)();
}

Map.prototype.destroy = function (this: Map) {
    this.layerGroups.forEach((_, id) => {
        this.removeLayerGroup(id);
    })

    this.remove();
}