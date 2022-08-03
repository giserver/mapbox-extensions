import * as turf from "@turf/turf";
import { LineString } from "@turf/turf";
import { MapMouseEvent, EventData } from "mapbox-gl";
import { createUUID } from "../utils";
import MeasureBase from "./MeasureBase";
import { MeasureType } from ".";

export default class MeasureLineString extends MeasureBase {
    protected type: MeasureType = 'LineString';
    private drawing: boolean = false;

    protected onInit(): void {

        this.map.addLayer({
            id: this.id,
            type: 'line',
            source: this.id,
            layout: {},
            paint: {}
        })

        this.map.addLayer({
            id: this.pointSourceId,
            type: 'circle',
            source: this.pointSourceId,
            layout: {},
            paint: {
                'circle-color': '#000000'
            },
            filter: ['!=', ['get', 'center'], true]
        })

        this.map.addLayer({
            id: this.pointSourceId + "_font",
            type: 'symbol',
            source: this.pointSourceId,
            layout: {
                'text-field': ['get', 'distance'],
                'text-offset': [0, -1.2],
                'text-size': 12
            },
            paint: {
                "text-color": ['case', ['==', ['get', 'center'], true], "#ff0000", "#000000"]
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
        let distance = "0";
        let featureId = createUUID();
        
        // 判断是否已经落笔
        if (this.drawing) {
            // 获取最近一次的linestring
            const lastPoint = this.currentLine.coordinates[this.currentLine.coordinates.length - 2];
            this.currentLine.coordinates.push(point);
            distance = this.getDistanceString(this.currentLine);
            featureId = this.currentFeature.id!.toString();

            // 添加中间点
            const centerPoint = [(point[0] + lastPoint[0]) / 2, (point[1] + lastPoint[1]) / 2];
            const segment = this.getDistanceString({ type: 'LineString', coordinates: [lastPoint, point] });
            this.geojsonPoint.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: centerPoint,
                },
                properties: {
                    distance: segment,
                    parentId: featureId,
                    center: true
                }
            })

        } else {
            this.drawing = true;
            this.geojson.features.push({
                type: 'Feature',
                id: featureId,
                geometry: {
                    type: 'LineString',
                    coordinates: [point]
                },
                properties: {}
            });

            this.map.on('mousemove', this.onMouseMoveHandler);
        }

        this.geojsonPoint.features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: point
            },
            properties: {
                distance,
                parentId: featureId
            }
        })

        this.updateGeometryDataSource();
        this.updatePointDataSource();
    }

    private onMapDoubleClickHandler = (e: MapMouseEvent & EventData) => {
        // 结束绘制
        this.drawing = false;

        this.map.off('mousemove', this.onMouseMoveHandler);

        // 排除最后一个点 中点
        this.currentLine.coordinates.pop();
        this.geojsonPoint.features.pop();
        this.geojsonPoint.features.pop();

        // 如果直接双击，删除本次测量
        if (this.currentLine.coordinates.length === 1) {
            this.geojson.features.pop();
            this.geojsonPoint.features.pop();
        }

        // 提交更新
        this.updateGeometryDataSource();
        this.updatePointDataSource();
    }

    private onMouseMoveHandler = (e: MapMouseEvent & EventData) => {
        const point = [e.lngLat.lng, e.lngLat.lat];
        if (this.currentLine.coordinates.length > 1) {
            this.currentLine.coordinates.pop();
        }

        this.currentLine.coordinates.push(point);

        this.updateGeometryDataSource();
    }

    /**
     * 获取最后一个feature
     */
    private get currentFeature() {
        return this.geojson.features[this.geojson.features.length - 1];
    }

    // 获取最后一个feature的线数据
    private get currentLine() {
        return this.currentFeature.geometry as LineString;
    }

    /**
     * 计算linestring类型数据的长度，并转化为字符串形式
     * @param line 
     * @returns 
     */
    private getDistanceString(line: LineString) {
        const length = turf.length(turf.lineString(line.coordinates));
        return length > 1 ? `${length.toFixed(3)}km` : `${(length * 1000).toFixed(2)}m`;
    }
}