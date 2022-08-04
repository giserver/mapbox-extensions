import * as turf from '@turf/turf';
import { Polygon } from "@turf/turf";
import { EventData, MapMouseEvent } from "mapbox-gl";
import { MeasureType } from ".";
import { createUUID } from '../utils';
import MeasureBase from "./MeasureBase";

export default class MeasurePolygon extends MeasureBase {
    protected type: MeasureType = 'Polygon';
    private drawing = false;

    protected onInit(): void {
        this.map.addLayer({
            id: this.id,
            type: 'fill',
            source: this.id,
            layout: {},
            paint: {
                'fill-color': '#ff0000',
                'fill-opacity': 0.5,
                'fill-outline-color': '#000000'
            }
        });

        this.map.addLayer({
            id: this.pointSourceId,
            type: 'symbol',
            source: this.pointSourceId,
            layout: {
                'text-field': ['get', 'area'],
                'text-size': 15
            }
        })
    }

    protected onStart(): void {
        this.map.on('click', this.onMapClickHandler);
        this.map.on('dblclick', this.onMapDoubleClickHandler);
    }
    protected onClear(): void {
        this.drawing = false;
        this.map.off('mousemove', this.onMouseMoveHandler);
    }
    protected onStop(): void {
        this.drawing = false;
        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('click', this.onMapClickHandler);
        this.map.off('dblclick', this.onMapDoubleClickHandler);
    }

    private onMapClickHandler = (e: MapMouseEvent & EventData) => {
        const point = [e.lngLat.lng, e.lngLat.lat];
        let featureId = createUUID();

        // 判断是否已经落笔
        if (this.drawing) {
            this.currentPolygon.coordinates[0].push(point);

        } else {
            this.drawing = true;
            this.geojson.features.push({
                type: 'Feature',
                id: featureId,
                geometry: {
                    type: 'Polygon',
                    coordinates: [[point]]
                },
                properties: {}
            });

            this.map.on('mousemove', this.onMouseMoveHandler);
            this.map.on('contextmenu', this.onRightClickHandler);
        }

        this.updateGeometryDataSource();
    };

    private onMapDoubleClickHandler = (e: MapMouseEvent & EventData) => {
        this.drawing = false;
        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('contextmenu', this.onRightClickHandler);

        this.currentPolygon.coordinates[0].pop();
        if (this.currentPolygon.coordinates[0].length < 3) {
            this.geojson.features.pop();
        } else {
            const center = turf.center(this.currentPolygon);
            const area = this.getAreaString(this.currentPolygon);
            center.properties = {
                area
            };

            this.geojsonPoint.features.push(center);
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

    private getAreaString(polygon: Polygon) {
        const area = turf.area(polygon);
        return area > 1000000 ? `${(area / 1000000).toFixed(4)}km²` : `${area.toFixed(4)}m²`;
    }
}