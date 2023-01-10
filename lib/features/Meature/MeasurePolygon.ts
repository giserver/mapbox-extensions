import * as turf from '@turf/turf';
import { Polygon } from "@turf/turf";
import { EventData, Map, MapMouseEvent } from "mapbox-gl";
import { createUUID } from '../../utils';
import MeasureBase, { MeasureOptions, MeasureType } from "./MeasureBase";

export interface MeasurePolygonOptions extends MeasureOptions<GeoJSON.Polygon> {
    /**
        * 内部颜色
        */
    polygonColor?: string,

    /**
     * 内部颜色透明度
     */
    polygonOpacity?: number,

    /**
     * 边框颜色
     */
    polygonOutlineColor?: string,

    /**
     * 文字大小
     */
    textSize?: number,

    /**
     * 文字颜色
     */
    textColor?: string,

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
        options.polygonColor??="#ff0000";
        options.polygonOpacity??=0.5;
        options.polygonOutlineColor??="#000000";
        options.textSize??=12;
        options.textColor??="#000000";
        options.createText??=(area: number) => area > 1000000 ?
            `${(area / 1000000).toFixed(4)}km²` :
            `${area.toFixed(4)}m²`;

        options.createLengthText??=(length: number) => length > 1 ?
            `${length.toFixed(3)}km` :
            `${(length * 1000).toFixed(2)}m`;
        super(map);
    }

    protected onInit(): void {
        this.layerGroup.add({
            id: this.id,
            type: 'fill',
            source: this.id,
            layout: {},
            paint: {
                'fill-color': this.options.polygonColor,
                'fill-opacity': this.options.polygonOpacity,
                'fill-outline-color': this.options.polygonOutlineColor
            }
        });

        this.layerGroup.add({
            id: this.pointSourceId,
            type: 'symbol',
            source: this.pointSourceId,
            layout: {
                'text-field': ['format', ['concat', "面积 : ", ['get', 'area']], {}, '\n', {}, ['concat', "周长 : ", ['get', 'length']], {}],
                'text-size': this.options.textSize,
                'text-justify': 'left'
            },
            paint: {
                'text-color': this.options.textColor,
            }
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
            this.currentPolygon.coordinates[0].push(point);

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

        this.currentPolygon.coordinates[0].pop();
        this.currentPolygon.coordinates[0].pop();
        if (this.currentPolygon.coordinates[0].length < 3) {
            this.geojson.features.pop();
        } else {
            // 添加第一个点 (闭合)
            this.currentPolygon.coordinates[0].push(this.currentPolygon.coordinates[0][0]);

            // 在中心点添加标注
            const center = turf.center(this.currentPolygon);
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
        if (this.currentPolygon.coordinates[0].length > 1) {
            this.currentPolygon.coordinates[0].pop();
        }

        this.currentPolygon.coordinates[0].push(point);

        this.updateGeometryDataSource();
    }

    private onRightClickHandler = (e: MapMouseEvent & EventData) => {
        if (this.currentPolygon.coordinates[0].length === 2)  // 只存在第一个点和动态点则不进行删除操作
            return;

        this.currentPolygon.coordinates[0].pop();
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