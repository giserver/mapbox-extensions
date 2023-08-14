import { createUUID } from '../../../utils';
import mapboxgl from 'mapbox-gl';


/**
 * 测量功能
 *
 * @abstract
 * @class MeasureBase
 */
export default abstract class MeasureBase {
    readonly sourceId;
    readonly pointSourceId;
    readonly symbolSourceId;
    protected geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        type: 'FeatureCollection',
        features: []
    }

    protected geojsonPoint: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        type: 'FeatureCollection',
        features: []
    }

    private touchAddPointHandler :(ev: mapboxgl.MapMouseEvent & mapboxgl.EventData)=>void

    isDrawing = false;

    protected abstract onInit(): void;
    protected abstract onAddPoint(pos:mapboxgl.LngLat): void;
    protected abstract onRevokePoint(): void;
    protected abstract onFinish(): void;
    protected abstract getCoordinates(): GeoJSON.Position[] | undefined;

    constructor(protected map: mapboxgl.Map) {

        this.sourceId = createUUID()
        this.pointSourceId = createUUID()
        this.symbolSourceId = createUUID()

        this.map.addSource(this.sourceId, {
            type: 'geojson',
            data: this.geojson
        })
        this.map.addSource(this.pointSourceId, {
            type: 'geojson',
            data: this.geojsonPoint
        });

        let that = this
        this.touchAddPointHandler = (e)=>{
            that.addPoint(e.lngLat);
        }

        //onInit 实现添加图层，配置图层样式
        this.onInit();
    };

    protected get currentFeature() {
        return this.isDrawing ? this.geojson.features[this.geojson.features.length - 1] : undefined;
    }

    /**
     * 判断是否有绘制图层，如果没有，重新添加
     *
     * @memberof MeasureBase
     */
    start() {
        if (!this.map.getLayer(this.sourceId)) {
            this.map.addSource(this.sourceId, {
                type: 'geojson',
                data: this.geojson
            })
            this.map.addSource(this.pointSourceId, {
                type: 'geojson',
                data: this.geojsonPoint
            })
            this.onInit()
        }

        this.map.moveLayer(this.sourceId);
        this.map.moveLayer(this.pointSourceId);
        this.map.moveLayer(this.symbolSourceId);

        this.map.on('click',this.touchAddPointHandler);
    }

    stop(){
        this.map.off('click',this.touchAddPointHandler);
    }

    /**
     *  画点
     *
     * @abstract
     * @memberof Draw
     */
    addPoint(pos:mapboxgl.LngLat) {
        // 创建或更新currentFeature 并更新数据源，添加线测量
        this.onAddPoint(pos);
    }

    /**
     * 撤销当前点位
     *
     * @memberof line
     */
    revokePoint() {
        // 判断当前feature是否有点
        if (this.getCoordinates()?.pop()) {
            // 删除最后一个点
            this.geojsonPoint.features.pop()
            this.updateDataSource()
        }
        // 这里面展示没有操作
        this.onRevokePoint();
    }

    /**
     *  结束操作
     *
     * @abstract
     * @memberof Draw
     */
    finish() {
        // isDraw恢复原始
        this.isDrawing = false;
        this.onFinish();
    }

    clear() {
        this.geojson.features.length = 0;
        this.geojsonPoint.features.length = 0;
        this.updateDataSource();
    }

    /**
     *  更新数据源
     * 
     * @protected
     * @memberof MeasureBase
     */
    protected updateDataSource() {
        (this.map.getSource(this.sourceId) as any).setData(this.geojson);
        (this.map.getSource(this.pointSourceId) as any).setData(this.geojsonPoint);
    }
}