import * as turf from '@turf/turf';
import { Polygon } from "@turf/turf";
import { EventData, FillPaint, LinePaint, Map, MapMouseEvent, SymbolLayout, SymbolPaint } from "mapbox-gl";
import { createUUID } from '../../utils';
import MeasureBase, { MeasureOptions, MeasureType } from "./MeasureBase";

export interface MeasurePolygonOptions extends MeasureOptions<GeoJSON.Polygon> {

    polygonPaintBuilder?(paint: FillPaint): void,
    outlinePaintBuilder?(paint: LinePaint): void;


    /**
     * 外部设置label layout 
     * @param layout 
     */
    labelLayoutBuilder?(layout: SymbolLayout): void;

    /**
     * 外部设置label Paint 
     * @param paint 
     */
    labelPaintBuilder?(paint: SymbolPaint): void;


    /**
     *  创建面积文字,area为平方米
     */
    createText?: (area: number) => string,

    /**
     *  计算长度显示的文字，length 单位为千米(km)
     */
    createLengthText?: (length: number) => string,
}

export default class MeasurePolygon extends MeasureBase {
    type: MeasureType = 'Polygon';

    /**
     *
     */
    constructor(map: Map, private options: MeasurePolygonOptions = {}) {
        options.createText ??= (area: number) => area > 1000000 ?
            `${(area / 1000000).toFixed(4)}km²` :
            `${area.toFixed(4)}m²`;

        options.createLengthText ??= (length: number) => length > 1 ?
            `${length.toFixed(3)}km` :
            `${(length * 1000).toFixed(2)}m`;
        super(map);
    }

    protected onInit(): void {
        const polyonPaint: FillPaint = {
            'fill-color': "#fbb03b",
            'fill-opacity': 0.2
        };
        this.options.polygonPaintBuilder?.call(undefined, polyonPaint);
        this.layerGroup.add({
            id: this.id,
            type: 'fill',
            source: this.id,
            layout: {},
            paint: polyonPaint
        });

        const outlinePaint: LinePaint = {
            "line-color": "#fbb03b",
            "line-width": 4
        };
        this.options.outlinePaintBuilder?.call(undefined, outlinePaint);
        this.layerGroup.add({
            id: this.id + "_line",
            type: 'line',
            source: this.id,
            layout: {},
            paint: outlinePaint
        });

        const labelLayout: SymbolLayout = {
            'text-field': ['format',
                ['concat', "面积 : ", ['get', 'area']], {}, '\n', {}, '\n', {},
                ['concat', "周长 : ", ['get', 'length']], {}],
            'text-size': 16,
            'text-justify': 'left'
        }
        const labelPaint: SymbolPaint = {
            'text-color': "#000000",
            "text-halo-color": '#ffffff',
            "text-halo-width": 2
        };
        this.options.labelLayoutBuilder?.call(undefined, labelLayout);
        this.options.labelPaintBuilder?.call(undefined, labelPaint);
        this.layerGroup.add({
            id: this.pointSourceId,
            type: 'symbol',
            source: this.pointSourceId,
            layout: labelLayout,
            paint: labelPaint
        });
    }

    protected onStart(): void {
        this.map.on('click', this.onMapClickHandler);
        this.map.on('dblclick', this.onMapDoubleClickHandler);
    }
    protected onClear(): void {
        this.map.off('mousemove', this.onMouseMoveHandler);
    }
    protected onStop(): void {
        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('click', this.onMapClickHandler);
        this.map.off('dblclick', this.onMapDoubleClickHandler);
    }

    private onMapClickHandler = (e: MapMouseEvent & EventData) => {
        const point = [e.lngLat.lng, e.lngLat.lat];

        // 判断是否已经落笔
        if (this._isDrawing) {
            const coords = this.currentPolygon.coordinates[0];
            if (coords.length > 2)
                coords.pop(); //删除第一个点
            coords.push(point);
            coords.push(coords[0]);
        } else {
            this._isDrawing = true;
            const id = createUUID();
            this.geojson.features.push({
                type: 'Feature',
                id,
                geometry: {
                    type: 'Polygon',
                    coordinates: [[point]]
                },
                properties: {
                    id
                }
            });

            this.map.on('mousemove', this.onMouseMoveHandler);
            this.map.on('contextmenu', this.onRightClickHandler);
        }

        this.updateGeometryDataSource();
    };

    private onMapDoubleClickHandler = (e: MapMouseEvent & EventData) => {
        this._isDrawing = false;
        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('contextmenu', this.onRightClickHandler);

        const coords = this.currentPolygon.coordinates[0];
        coords.pop();
        coords.pop();
        coords.pop();
        if (coords.length < 3) {
            this.geojson.features.pop();
        } else {
            // 添加第一个点 (闭合)
            coords.push(coords[0]);

            // 在中心点添加标注
            const center = turf.centroid(this.currentPolygon);
            const area = this.options.createText!(turf.area(this.currentFeature));
            const length = this.options.createLengthText!(turf.length(this.currentFeature));
            center.id = this.currentFeature.id;
            center.properties = {
                area,
                length,
                id: this.currentFeature.id
            };

            this.geojsonPoint.features.push(center);
            this.options.onDrawed?.call(this, this.currentFeature.id!.toString(), this.currentPolygon);
        }

        this.updateGeometryDataSource();
        this.updatePointDataSource();
    };

    private onMouseMoveHandler = (e: MapMouseEvent & EventData) => {
        const point = [e.lngLat.lng, e.lngLat.lat];
        const coords = this.currentPolygon.coordinates[0];

        if (coords.length > 1)
            coords.pop();

        if (coords.length > 1) {
            coords.pop();
        }

        coords.push(point);

        if (coords.length > 2)
            coords.push(coords[0]);

        this.updateGeometryDataSource();
    }

    private onRightClickHandler = (e: MapMouseEvent & EventData) => {
        const coords = this.currentPolygon.coordinates[0];

        if (coords.length === 2)  // 只存在第一个点和动态点则不进行删除操作
            return;

        coords.pop();
        this.onMouseMoveHandler(e); // 调用鼠标移动事件，重新建立动态线

        this.updateGeometryDataSource();
        this.updatePointDataSource();
    }

    private get currentFeature() {
        return this.geojson.features[this.geojson.features.length - 1];
    }

    private get currentPolygon() {
        return this.currentFeature.geometry as Polygon;
    }
}