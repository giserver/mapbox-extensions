import { creator } from 'wheater';
import { Tip } from '@giserver/tip';

export type DrawType = 'Point' | 'LineString' | 'Polygon';

export type TipOptions = {
    message_before_drawing: string,
    message_drawing: string
}

export interface DrawBaseOptions {
    onDrawed?: (id: string, geometry: GeoJSON.Geometry) => void;
    onRender?: (type: DrawType, fc: GeoJSON.FeatureCollection) => void;
    once?: boolean;
    tip?: TipOptions
}

export abstract class DrawBase<G extends GeoJSON.Geometry = GeoJSON.Geometry> {
    private tip?: Tip;
    private _currentFeature: GeoJSON.Feature<G> | undefined;

    protected readonly fc: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: []
    }

    protected get currentFeature() {
        return this._currentFeature;
    };
    protected set currentFeature(feature: GeoJSON.Feature<G> | undefined) {
        if (this.tip && this.options.tip) {
            this.tip.resetContent(feature ?
                _ => this.options.tip!.message_drawing :
                _ => this.options.tip!.message_before_drawing)
        }
        this._currentFeature = feature;
    }

    protected get currentGeometry(): G | undefined {
        return this.currentFeature?.geometry;
    }
    protected readonly layers: mapboxgl.AnyLayer[] = [];

    readonly id = creator.uuid();

    abstract readonly type: DrawType;

    constructor(protected map: mapboxgl.Map, protected options: DrawBaseOptions = {}) {
        map.addSource(this.id, {
            type: 'geojson',
            data: this.fc,
        });

        if (options.tip) this.tip = new Tip({ map, getContent: _ => this.options.tip!.message_before_drawing });
    }

    protected abstract onStart(): void;
    protected abstract onStop(): void;
    protected abstract onClear(): void;

    start() {
        this.layers.forEach(layer => {
            if (!this.map.getLayer(layer.id))
                this.map.addLayer(layer);
            this.map.moveLayer(layer.id);
        });

        this.map.getCanvas().style.cursor = 'crosshair';
        this.map.doubleClickZoom.disable();
        this.tip?.start();

        this.onStart();
    }

    /**
     * 停止绘制
     */
    stop() {
        // 绘制一半中断
        if (this.currentFeature) {
            const cindex = this.fc.features.indexOf(this.currentFeature);
            if (cindex !== -1) {
                this.fc.features.splice(cindex, 1);
                this.currentFeature = undefined;
                this.updateDataSource();
            }
        }
        this.map.getCanvas().style.cursor = '';
        this.tip?.stop();
        this.onStop();
    }

    /**
     * 清除绘制数据
     */
    clear() {
        this.currentFeature = undefined;
        this.fc.features = [];
        this.updateDataSource();
        this.onClear();
    }

    protected updateDataSource() {
        if (this.currentFeature) {
            const cindex = this.fc.features.indexOf(this.currentFeature);
            if (cindex === -1)
                this.fc.features.push(this.currentFeature);
        }
        (this.map.getSource(this.id) as mapboxgl.GeoJSONSource).setData(this.fc);
        this.options.onRender?.(this.type, this.fc);
    }
}