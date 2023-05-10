import * as turf from "@turf/turf";
import { LineString } from "@turf/turf";
import { MapMouseEvent, EventData, Map, LinePaint, CirclePaint, SymbolPaint, SymbolLayout } from "mapbox-gl";
import { createUUID } from "../../utils";
import MeasureBase, { MeasureOptions, MeasureType } from "./MeasureBase";

export interface MeasureLineStringOptions extends MeasureOptions<GeoJSON.LineString> {

    linePaintBuilder?(paint: LinePaint): void,
    segmentPointPaintBuilder?(paint: CirclePaint): void;


    /**
     * 外部设置label layout 
     * 注意 区分线段中部和断点 使用 ['case', ['==', ['get', 'center'], true], ... , ... ]
     * @param layout 
     */
    labelLayoutBuilder?(layout: SymbolLayout): void;

    /**
     * 外部设置label Paint 
     * 注意 区分线段中部和断点 使用 ['case', ['==', ['get', 'center'], true], ... , ... ]
     * @param paint 
     */
    labelPaintBuilder?(paint: SymbolPaint): void;

    /**
     * 是否显示线段中间文字(线段长度)
     */
    showCenterText?: boolean,

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
        options.showCenterText ??= true;
        options.createText ??= (length: number) => length > 1 ? `${length.toFixed(3)}km` : `${(length * 1000).toFixed(2)}m`;

        super(map);
    }

    protected onInit(): void {
        const linePaint: LinePaint = {
            'line-color': "#fbb03b",
            'line-width': 2,
        }
        this.options.linePaintBuilder?.call(undefined, linePaint);
        this.layerGroup.add({
            id: this.id,
            type: 'line',
            source: this.id,
            layout: {},
            paint: linePaint
        });

        const segmentPointPaint: CirclePaint = {
            'circle-color': "#fbb03b"
        }
        this.options.segmentPointPaintBuilder?.call(undefined, segmentPointPaint);
        this.layerGroup.add({
            id: this.pointSourceId,
            type: 'circle',
            source: this.pointSourceId,
            layout: {},
            paint: segmentPointPaint,
            filter: ['!=', ['get', 'center'], true]
        });

        const labelPaint: SymbolPaint = {
            "text-color": ['case', ['==', ['get', 'center'], true], '#ff0000', "#000000"],
            "text-halo-color": "#ffffff",
            "text-halo-width": 2,
        }
        const labelLayout: SymbolLayout = {
            'text-field': ['get', 'distance'],
            'text-offset': [0, -1.2],
            'text-size': ['case', ['==', ['get', 'center'], true], 16, 16]
        }
        this.options.labelPaintBuilder?.call(undefined, labelPaint);
        this.options.labelLayoutBuilder?.call(undefined, labelLayout);

        this.layerGroup.add({
            id: this.pointSourceId + "_label",
            type: 'symbol',
            source: this.pointSourceId,
            layout: labelLayout,
            paint: labelPaint,
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
                    id: this.currentFeature.id,
                    distance: segment,
                    center: true
                }
            })

        } else {
            this._isDrawing = true;
            const id = createUUID();
            this.geojson.features.push({
                type: 'Feature',
                id,
                geometry: {
                    type: 'LineString',
                    coordinates: [point]
                },
                properties: {
                    id
                }
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
                id: this.currentFeature.id,
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

            this.options.onDrawed?.call(this, this.currentFeature.id!.toString(), this.currentLine);
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