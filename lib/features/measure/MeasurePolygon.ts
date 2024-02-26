import centroid from '@turf/centroid';
import turfArea from '@turf/area';
import turfLength from '@turf/length';
import mapboxgl from "mapbox-gl";
import { creator } from 'wheater';
import MeasureBase, { MeasureOptions, MeasureType } from "./MeasureBase";

export interface MeasurePolygonOptions extends MeasureOptions<GeoJSON.Polygon> {

    polygonPaintBuilder?(paint: mapboxgl.FillPaint): void,
    outlinePaintBuilder?(paint: mapboxgl.LinePaint): void;


    /**
     * 外部设置label layout 
     * @param layout 
     */
    labelLayoutBuilder?(layout: mapboxgl.SymbolLayout): void;

    /**
     * 外部设置label Paint 
     * @param paint 
     */
    labelPaintBuilder?(paint: mapboxgl.SymbolPaint): void;


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
    private currentMeasurePoint: GeoJSON.Feature | undefined;
    private moveTimer: NodeJS.Timeout | undefined;

    type: MeasureType = 'Polygon';

    /**
     *
     */
    constructor(map: mapboxgl.Map, private options: MeasurePolygonOptions = {}) {
        options.createText ??= (area: number) => area > 1000000 ?
            `${(area / 1000000).toFixed(4)}km²` :
            `${area.toFixed(4)}m²`;

        options.createLengthText ??= (length: number) => length > 1 ?
            `${length.toFixed(3)}km` :
            `${(length * 1000).toFixed(2)}m`;
        super(map, options);
    }

    protected onInit(): void {
        const polyonPaint: mapboxgl.FillPaint = {
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

        const outlinePaint: mapboxgl.LinePaint = {
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

        this.map.addSource(this.id + "_line_addion", {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });
        this.layerGroup.add({
            id: this.id + "_line_addion",
            type: 'line',
            source: this.id + "_line_addion",
            paint: outlinePaint
        });

        const labelLayout: mapboxgl.SymbolLayout = {
            'text-field': ['format',
                ['concat', "面积 : ", ['get', 'area']], {}, '\n', {}, '\n', {},
                ['concat', "周长 : ", ['get', 'length']], {}],
            'text-size': 16,
            'text-justify': 'left'
        }
        const labelPaint: mapboxgl.SymbolPaint = {
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

    private onMapClickHandler = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        const point = [e.lngLat.lng, e.lngLat.lat];

        // 判断是否已经落笔
        if (this.isDrawing) {
            const coords = this.currentPolygon.coordinates[0];
            if (coords.length > 2)
                coords.pop(); //删除第一个点
            coords.push(point);
            coords.push(coords[0]);
        } else {
            this.isDrawing = true;
            const id = creator.uuid();
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

        this.calMeasurePoint();
        this.updateGeometryDataSource();
        this.updatePointDataSource();
    };

    private onMapDoubleClickHandler = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        this.isDrawing = false;
        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('contextmenu', this.onRightClickHandler);

        const coords = this.currentPolygon.coordinates[0];
        coords.pop();
        coords.pop();
        coords.pop();
        if (coords.length < 3) {
            this.geojson.features.pop();
            this.geojsonPoint.features.pop();
        } else {
            // 添加第一个点 (闭合)
            coords.push(coords[0]);

            this.calMeasurePoint();
            this.options.onDrawed?.call(this, this.currentFeature.id!.toString(), this.currentPolygon);
        }

        (this.map.getSource(this.id + "_line_addion") as mapboxgl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: []
        });

        this.updateGeometryDataSource();
        this.updatePointDataSource();
        this.currentMeasurePoint = undefined;
    };

    private onMouseMoveHandler = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        const point = [e.lngLat.lng, e.lngLat.lat];
        const coords = this.currentPolygon.coordinates[0];

        if (coords.length === 2) {
            setTimeout(() => {
                (this.map.getSource(this.id + "_line_addion") as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: coords },
                    properties: {}
                })
            }, 50);
        }

        if (coords.length > 1)
            coords.pop();

        if (coords.length > 1) {
            coords.pop();
        }

        coords.push(point);

        if (coords.length > 2)
            coords.push(coords[0]);

        this.updateGeometryDataSource();

        if (this.moveTimer)
            clearTimeout(this.moveTimer);
        this.moveTimer = setTimeout(() => {
            this.moveTimer = undefined;
            this.calMeasurePoint();
            this.updatePointDataSource();
        }, 50);
    }

    private onRightClickHandler = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        const coords = this.currentPolygon.coordinates[0];

        console.log(coords);

        if (coords.length === 2) {// 只存在第一个点和动态点则删除当前图形，进行下一次绘制
            this.map.off('mousemove', this.onMouseMoveHandler);
            this.map.off('contextmenu', this.onRightClickHandler);
            this.isDrawing = false;
            this.geojson.features.pop();
            this.geojsonPoint.features.pop();
            (this.map.getSource(this.id + "_line_addion") as mapboxgl.GeoJSONSource).setData({
                type: 'FeatureCollection',
                features: []
            });
            this.currentMeasurePoint = undefined;

            this.updateGeometryDataSource();
            this.updatePointDataSource();
        } else {
            coords.pop();
            if(coords.length === 3) coords.pop(); // 辅助线 _line_addion 更新
            this.onMouseMoveHandler(e); // 调用鼠标移动事件，重新建立动态线
        }
    }

    private get currentFeature() {
        return this.geojson.features[this.geojson.features.length - 1];
    }

    private get currentPolygon() {
        return this.currentFeature.geometry as GeoJSON.Polygon;
    }

    /**
     * 在中心点添加标注
     * @returns 
     */
    private calMeasurePoint() {
        if (!this.currentFeature) return;

        // 防止计算错误
        if (this.currentPolygon.coordinates[0].length < 2) {
            if (this.currentMeasurePoint) {
                this.currentMeasurePoint.properties!['area'] = 0;
            }

            return;
        };

        const center = centroid(this.currentPolygon);
        const area = this.options.createText!(turfArea(this.currentFeature));
        const length = this.options.createLengthText!(turfLength(this.currentFeature));
        center.id = this.currentFeature.id;
        center.properties = {
            area,
            length,
            id: this.currentFeature.id
        };

        if (this.currentMeasurePoint) {
            this.currentMeasurePoint.geometry = center.geometry;
            this.currentMeasurePoint.properties = center.properties;
        } else {
            this.currentMeasurePoint = center;
            this.geojsonPoint.features.push(center);
        }
    }
}