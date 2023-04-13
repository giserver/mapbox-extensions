import { GeoJSONSource, Map } from 'mapbox-gl'
import { createUUID } from '../../utils';
import LayerGroup from '../LayerGroup';

export type MeasureType = 'Point' | 'LineString' | 'Polygon'

export interface MeasureOptions<G extends GeoJSON.Geometry> {
    onDrawed?: (id: string, geometry: G) => void;
}

export default abstract class MeasureBase {
    readonly abstract type: MeasureType;
    readonly layerGroup: LayerGroup;

    protected geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        'type': 'FeatureCollection',
        'features': []
    };

    protected geojsonPoint: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        'type': 'FeatureCollection',
        'features': []
    };

    /**
     * 是否正在绘制图形
     */
    protected _isDrawing = false;

    /**
     * 每一个测量模式的唯一id
     * 作为测量动态数据源的id
     * 可以在创建图层时作为图层id（或计算图层id）
     */
    readonly id: string

    get isDrawing() {
        return this._isDrawing;
    }

    /**
     * 测量初始化时调用
     */
    protected abstract onInit(): void;

    /**
     * 开始测量时调用
     */
    protected abstract onStart(): void;

    /**
     * 在清理测量数据时调用
     */
    protected abstract onClear(): void;

    /**
     * 测量结束时调用
     */
    protected abstract onStop(): void;

    constructor(protected map: Map) {
        this.id = createUUID();
        this.layerGroup = new LayerGroup(this.id, map);

        const init = () => {
            this.map.addSource(this.id, {
                type: 'geojson',
                data: this.geojson
            })

            this.map.addSource(this.pointSourceId, {
                type: 'geojson',
                data: this.geojsonPoint
            })

            this.onInit();
        }

        let t = setInterval(() => {
            if (this.map.isStyleLoaded()) {
                init();
                clearInterval(t);
            }
        }, 50);
    }

    /**
     * 开始测量
     */
    start() {
        this.map.getCanvas().style.cursor = 'crosshair';
        this.map.doubleClickZoom.disable();
        this.layerGroup.moveTo();
        this.onStart();
    }

    /**
     * 停止测量
     */
    stop() {
        this._isDrawing = false;
        this.map.getCanvas().style.cursor = 'grab';
        this.map.doubleClickZoom.enable();
        this.onStop();
    }

    /**
     * 清楚测量数据
     */
    clear() {
        this._isDrawing = false;
        this.geojson.features.length = 0;
        this.geojsonPoint.features.length = 0;
        this.onClear();
        this.updateGeometryDataSource();
        this.updatePointDataSource();
    }

    getFeatrue(id: string) {
        return this.geojson.features.find(f => f.id === id);
    }

    deleteFeature(...ids: Array<string>) {
        const source1 = this.map.getSource(this.id) as GeoJSONSource;
        const source2 = this.map.getSource(this.pointSourceId) as GeoJSONSource;

        this.geojson.features = this.geojson.features.filter(f => !ids.some(id => id === f.id));
        this.geojsonPoint.features = this.geojsonPoint.features.filter(f => !ids.some(id => id === f.id));

        source1.setData(this.geojson);
        source2.setData(this.geojsonPoint);
    }

    /**
     * 销毁
     * todo : 暂时没有想好怎么实现
     */
    destroy() {
        // 清除数据
        this.clear();

        // 删除所有图层
        this.layerGroup.removeAll();

        // 删除图层组
        this.map.removeLayerGroup(this.id);
    }

    /**
    * 更新绘制图形的数据
    */
    protected updateGeometryDataSource() {
        const source = this.map.getSource(this.id) as GeoJSONSource;
        source && source.setData(this.geojson);
    }

    /**
     * 更新点状数据
     */
    protected updatePointDataSource() {
        const source = this.map.getSource(this.pointSourceId) as GeoJSONSource;
        source && source.setData(this.geojsonPoint);
    }

    /**
     * 获取点状数据的id
     */
    protected get pointSourceId() {
        return this.id + "_point";
    }
}