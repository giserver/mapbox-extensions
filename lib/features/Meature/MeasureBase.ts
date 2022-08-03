import {GeoJSONSource, Map} from 'mapbox-gl'
import { createUUID } from '../utils';
import { MeasureType } from ".";

export default abstract class MeasureBase {
    protected readonly abstract type: MeasureType;
    protected geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        'type': 'FeatureCollection',
        'features': []
    };

    /**
     * 每一个测量模式的唯一id
     * 作为测量动态数据源的id
     * 可以在创建图层时作为图层id（或计算图层id）
     */
    readonly id: string

    /**
     * 测量初始化时调用
     */
    protected abstract onInit(): void;

    /**
     * 开始测量时调用
     */
    protected abstract onStart(): void;

    protected abstract onClear(): void;

    /**
     * 测量结束时调用
     */
    protected abstract onStop(): void;

    constructor(protected map: Map) {
        this.id = createUUID();
        this.map.on('load', () => {
            this.map.addSource(this.id, {
                type: 'geojson',
                data: this.geojson
            })

            this.onInit();
        })

    }

    protected updateGeometryDataSource() {
        const source = this.map.getSource(this.id) as GeoJSONSource;
        source.setData(this.geojson);
    }

    /**
     * 开始测量
     */
    start() {
        this.map.getCanvas().style.cursor = 'crosshair';
        this.onStart();
    }

    /**
     * 停止测量
     */
    stop() {
        this.map.getCanvas().style.cursor = 'grab';
        this.onStop();
    }

    /**
     * 清楚测量数据
     */
    clear() {
        this.geojson.features.length = 0;
        this.onClear();
        this.updateGeometryDataSource();
    }

    /**
     * 销毁
     * todo : 暂时没有想好怎么实现
     */
    destroy() {

    }
}