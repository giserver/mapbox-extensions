import { Map, AnyLayer } from 'mapbox-gl'

/**
* 图层组
*/
class LayerGroupBase<T extends AnyLayer> {

    private _show = true;

    /**
     * 创建图层组
     * @param id 图层组id
     * @param map mapboxgl.Map
     */
    constructor(public id: string, protected map: Map, protected _layers = Array<T>()) {
        if (!id.trim())
            throw Error('layer-group id can not be empty or white');

        if (map.layerGroups.get(id))
            throw Error(`layer-group id : ${id} already existed`);

        map.layerGroups.set(id, this);
        _layers.forEach(layer => {
            if (!this.map.getLayer(layer.id)) {
                this.map.addLayer(layer);
            }
        })

        map.on('remove', e => {
            map.layerGroups.delete(id);
        });
    }

    /**
    * 是否显示整个组
    */
    get show() {
        return this._show;
    }

    set show(value: boolean) {
        const visibility = value ? "visible" : "none";
        this.layerIds.forEach(id => this.map.setLayoutProperty(id, "visibility", visibility));
        this._show = value;
    }

    /**
     * 所有的layer id
     */
    get layerIds() {
        return this._layers.map(l => l.id);
    }

    /**
     * 添加图层
     * @param layer mapbox 图层
     */
    add(layer: T) {

        // 如果不存在图层则创建图层
        if (!this.map.getLayer(layer.id)) {
            this.map.addLayer(layer);
        }

        this._layers.push(layer);
    }

    /**
     * 删除图层
     * @param id mapbox 图层id
     */
    remove(id: string) {
        this.map.removeLayer(id);
        this._layers = this._layers.filter(l => l.id !== id);
    }

    /**
     * 删除所有图层
     */
    removeAll() {
        this._layers.forEach(l => this.map.removeLayer(l.id));
        this._layers.length = 0;
    }

    /**
     * 图层组整体移动
     * @param beforeId 前面的图层 如果为空则图层组置顶
     */
    moveTo(beforeId?: string | undefined) {
        this.layerIds.forEach(id => {
            this.map.moveLayer(id, beforeId);
        });
    }
}

export default class LayerGroup extends LayerGroupBase<AnyLayer>{

}