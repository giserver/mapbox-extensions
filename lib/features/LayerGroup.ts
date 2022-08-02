import { Map, AnyLayer } from 'mapbox-gl'

/**
* 图层组
*/
export default class LayerGroup {

    private _show = true;
    private _layerIds: string[] = [];

    /**
     * 创建图层组
     * @param id 图层组id
     * @param map mapboxgl.Map
     */
    constructor(id: string, private map: Map) {
        if (!id.trim())
            throw Error('layer-group id can not be empty or white');

        if (map.layerGroups.get(id))
            throw Error(`layer-group id : ${id} already existed`);

        map.layerGroups.set(id, this);
    }

    /**
    * 是否显示整个组
    */
    get show() {
        return this._show;
    }

    set show(value: boolean) {
        const visibility = value ? "visible" : "none";
        this._layerIds.forEach(id => this.map.setLayoutProperty(id, "visibility", visibility));
        this._show = value;
    }

    /**
     * 所有的layer id
     */
    get layerIds() {
        return this._layerIds;
    }

    /**
     * 添加图层
     * @param layer mapbox 图层
     */
    add(layer: AnyLayer) {
        if (this.map.getLayer(layer.id))
            throw Error(`layer id : ${layer.id} already existed`);

        const map = this.map;
        const onMapLoadHandle = function () {
            map.addLayer(layer);
            map.off('load', onMapLoadHandle);
        }

        this.map.on('load', onMapLoadHandle)
        this._layerIds.push(layer.id);
    }

    /**
     * 删除图层
     * @param id mapbox 图层id
     */
    remove(id: string) {
        this.map.removeLayer(id);
        this._layerIds = this._layerIds.filter(x => x !== id);
    }

    /**
     * 删除所有图层
     */
    removeAll() {
        this._layerIds.forEach(id => this.map.removeLayer(id));
        this._layerIds.length = 0;
    }
}
