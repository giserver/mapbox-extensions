import * as turf from "@turf/turf";
import { LineString } from "@turf/turf";
import { MapMouseEvent, EventData, Map } from "mapbox-gl";
import { createUUID, setDefaultValue } from "../utils";
import MeasureBase, { MeasureType } from "./MeasureBase";

export interface MeasureLineStringOptions {
    /**
     * 线颜色
     */
    lineColor?: string,

    /**
     * 线宽
     */
    lineWidth?: number,

    /**
     * 端点颜色
     */
    segmentPointColor?: string,

    /**
     * 端点大小
     */
    segmentPointSize?: number,

    /**
     * 文字在纵方向上的偏移
     */
    textOffsetY?: number,

    /**
     * 端点(距离求和)文字的大小
     */
    segmentTextSize?: number,

    /**
     * 端点(距离求和)文字的颜色
     */
    segmentTextColor?: string,

    /**
     * 是否显示线段中间文字(线段长度)
     */
    showCenterText?: boolean,

    /**
     * 线段中间文字(线段长度)大小
     */
    centerTextSize?: number,

    /**
     * 线段中间文字(线段长度)颜色
     */
    centerTextColor?: string,

    /**
     * 计算长度显示的文字，length 单位为千米(km)
     */
    createText?: (length: number) => string
}

export default class MeasureLineString extends MeasureBase {
    type: MeasureType = 'LineString';

    /**
     *
     */
    constructor(map: Map, private options: MeasureLineStringOptions = {}) {
        setDefaultValue(options, 'lineColor', "#000000");
        setDefaultValue(options, 'lineWidth', 1);
        setDefaultValue(options, 'segmentPointColor', "#000000");
        setDefaultValue(options, 'segmentPointSize', 4);
        setDefaultValue(options, 'textOffsetY', -1.2);
        setDefaultValue(options, 'segmentTextSize', 12);
        setDefaultValue(options, 'segmentTextColor', "#000000");
        setDefaultValue(options, 'showCenterText', true);
        setDefaultValue(options, 'centerTextSize', 12);
        setDefaultValue(options, 'centerTextColor', '#ff0000');
        setDefaultValue(options, 'createText', (length: number) => length > 1 ? `${length.toFixed(3)}km` : `${(length * 1000).toFixed(2)}m`);

        super(map);
    }

    protected onInit(): void {
        this.layerGroup.add({
            id: this.id,
            type: 'line',
            source: this.id,
            layout: {},
            paint: {
                'line-color': this.options.lineColor,
                'line-width': this.options.lineWidth,
            }
        });

        this.layerGroup.add({
            id: this.pointSourceId,
            type: 'circle',
            source: this.pointSourceId,
            layout: {},
            paint: {
                'circle-color': this.options.segmentPointColor,
                'circle-radius': this.options.segmentPointSize,
            },
            filter: ['!=', ['get', 'center'], true]
        })

        this.layerGroup.add({
            id: this.pointSourceId + "_font",
            type: 'symbol',
            source: this.pointSourceId,
            layout: {
                'text-field': ['get', 'distance'],
                'text-offset': [0, this.options.textOffsetY!],
                'text-size': ['case', ['==', ['get', 'center'], true], this.options.centerTextSize, this.options.segmentTextSize]
            },
            paint: {
                "text-color": ['case', ['==', ['get', 'center'], true], this.options.centerTextColor, this.options.segmentTextColor]
            },
            filter: this.options.showCenterText ? ['all'] : ['!=', ['get', 'center'], true]
        })
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
        let distance = "0";

        // 判断是否已经落笔
        if (this._isDrawing) {
            const lastPoint = this.currentLine.coordinates[this.currentLine.coordinates.length - 2];
            if (!lastPoint) // 防止双击
                return;
            this.currentLine.coordinates.push(point);
            distance = this.getDistanceString(this.currentLine);

            // 添加中间点
            const centerPoint = [(point[0] + lastPoint[0]) / 2, (point[1] + lastPoint[1]) / 2];
            const segment = this.getDistanceString({ type: 'LineString', coordinates: [lastPoint, point] });
            this.geojsonPoint.features.push({
                type: 'Feature',
                id: this.currentFeature.id,
                geometry: {
                    type: 'Point',
                    coordinates: centerPoint,
                },
                properties: {
                    distance: segment,
                    center: true
                }
            })

        } else {
            this._isDrawing = true;
            this.geojson.features.push({
                type: 'Feature',
                id: createUUID(),
                geometry: {
                    type: 'LineString',
                    coordinates: [point]
                },
                properties: {}
            });

            this.map.on('mousemove', this.onMouseMoveHandler);
            this.map.on('contextmenu', this.onRightClickHandler);
        }

        this.geojsonPoint.features.push({
            type: 'Feature',
            id: this.currentFeature.id,
            geometry: {
                type: 'Point',
                coordinates: point
            },
            properties: {
                distance
            }
        })

        this.updateGeometryDataSource();
        this.updatePointDataSource();
    }

    private onMapDoubleClickHandler = (e: MapMouseEvent & EventData) => {
        // 结束绘制
        this._isDrawing = false;

        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('contextmenu', this.onRightClickHandler);

        // 排除最后一个点和动态点
        this.currentLine.coordinates.pop();
        this.currentLine.coordinates.pop();

        // 如果直接双击，删除本次测量
        if (this.currentLine.coordinates.length < 2) {
            this.geojson.features.pop();
            this.geojsonPoint.features.pop();
        }
        else { // 删除最后一个点和动态点
            this.geojsonPoint.features.pop();
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

    private onRightClickHandler = (e: MapMouseEvent & EventData) => {
        if (this.currentLine.coordinates.length === 2)  // 只存在第一个点和动态点则不进行删除操作
            return;

        this.currentLine.coordinates.pop();
        this.onMouseMoveHandler(e); // 调用鼠标移动事件，重新建立动态线
        this.geojsonPoint.features.pop();  // 去掉端点
        this.geojsonPoint.features.pop();  // 去掉中点

        this.updateGeometryDataSource();
        this.updatePointDataSource();
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
        return this.options.createText!(length);
    }
}