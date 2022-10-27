import { Map, AnyLayer, AnySourceData } from "mapbox-gl";
import LayerGroup from './features/LayerGroup'
import { Dict } from './utils';

import MeasureControl from "./controls/MeasureControl";

export {
    MeasureControl
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
         * 替代setStyle，解决自动删除数据源和图层的问题
         * @param style mapbox 样式如：mapbox://styles/mapbox/dark-v10
         * @param preserveLayerIds 保留下来的layer
         * @param options 
         */
        changeStyle(style: string, preserveLayerIds: string[],
            options?: { diff?: boolean | undefined; localIdeographFontFamily?: string | undefined }): void
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