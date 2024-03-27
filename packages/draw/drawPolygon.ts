import { creator } from 'wheater';
import booleanClockwise from '@turf/boolean-clockwise';
import { DrawBase, DrawBaseOptions, DrawType } from "./drawBase";

export interface DrawPolygonOptions extends DrawBaseOptions {
    useCircle?: boolean,
    useOutLine?: boolean,
    circlePaintBuilder?(paint: mapboxgl.CirclePaint): void,
    linePaintBuilder?(paint: mapboxgl.LinePaint): void,
    fillPaintBuilder?(paint: mapboxgl.FillPaint): void,
}

export class DrawPolygon extends DrawBase<GeoJSON.Polygon>{
    readonly type: DrawType = "Polygon";
    private readonly line_addion_id = `${this.id}_line_addion`;

    /**
     *
     */
    constructor(map: mapboxgl.Map, options: DrawPolygonOptions = {}) {
        super(map, options);

        const fillLayer = {
            id: creator.uuid(),
            type: 'fill',
            source: this.id,
            paint: {
                'fill-color': "#fbb03b",
                'fill-opacity': 0.2
            }
        } as mapboxgl.FillLayer;

        if (options.fillPaintBuilder)
            options.fillPaintBuilder(fillLayer.paint);
        this.layers.push(fillLayer);

        if (options.useOutLine !== false) {
            const lineLayer = {
                id: creator.uuid(),
                type: 'line',
                source: this.id,
                paint: {
                    'line-color': "#fbb03b",
                    'line-width': 2,
                }
            } as mapboxgl.LineLayer;

            if (options.linePaintBuilder)
                options.linePaintBuilder(lineLayer.paint);

            this.layers.push(lineLayer);

            map.addLayer({
                id: this.line_addion_id,
                type: 'line',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    }
                },
                paint: lineLayer.paint
            });
        }

        if (options.useCircle) {
            const circleLayer = {
                id: creator.uuid(),
                type: 'circle',
                source: this.id,
                paint: {
                    'circle-color': "#fbb03b",
                    'circle-radius': 5,
                    'circle-stroke-color': '#fff',
                    'circle-stroke-width': 2,
                }
            } as mapboxgl.CircleLayer;

            if (options.circlePaintBuilder)
                options.circlePaintBuilder(circleLayer.paint);

            this.layers.push(circleLayer);
        }
    }

    protected onStart(): void {
        if(this.map.getLayer(this.line_addion_id))
            this.map.moveLayer(this.line_addion_id);
        
        this.map.on('click', this.onMapClickHandler);
        this.map.on('dblclick', this.onMapDoubleClickHandler);
    }
    protected onStop(): void {
        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('contextmenu', this.onRightClickHandler);
        this.map.off('click', this.onMapClickHandler);
        this.map.off('dblclick', this.onMapDoubleClickHandler);

        (this.map.getSource(this.line_addion_id) as mapboxgl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: []
        });
    }
    protected onClear(): void {
        (this.map.getSource(this.line_addion_id) as mapboxgl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: []
        });
    }

    private onMapClickHandler = (e: mapboxgl.MapMouseEvent & Object) => {
        const point = [e.lngLat.lng, e.lngLat.lat];

        // 判断是否已经落笔
        if (this.currentFeature && this.currentGeometry) {
            const coords = this.currentGeometry.coordinates[0];
            if (coords.length > 2)
                coords.pop(); //删除第一个点
            coords.push(point);
            coords.push(coords[0]);
        } else {
            const id = creator.uuid();
            this.currentFeature = {
                type: 'Feature',
                id,
                geometry: {
                    type: 'Polygon',
                    coordinates: [[point]]
                },
                properties: {
                    id
                }
            };

            this.map.on('mousemove', this.onMouseMoveHandler);
            this.map.on('contextmenu', this.onRightClickHandler);
        }

        this.updateDataSource();
    };

    private onMapDoubleClickHandler = (e: mapboxgl.MapMouseEvent & Object) => {
        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('contextmenu', this.onRightClickHandler);

        if (!this.currentFeature || !this.currentGeometry) return;

        const coords = this.currentGeometry.coordinates[0];
        coords.pop();
        coords.pop();
        coords.pop();
        if (coords.length < 3) {
            this.fc.features.pop();
            this.currentFeature = undefined;
        } else {
            // 添加第一个点 (闭合)
            coords.push(coords[0]);
            this.options.onDrawed?.call(this, this.currentFeature.id!.toString(), this.currentGeometry);
            this.currentFeature = undefined;

            if (this.options.once)
                this.stop();
        }

        (this.map.getSource(this.line_addion_id) as mapboxgl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: []
        });

        this.updateDataSource();
    };

    private onMouseMoveHandler = (e: mapboxgl.MapMouseEvent & Object) => {
        if (!this.currentFeature || !this.currentGeometry) return;

        const point = [e.lngLat.lng, e.lngLat.lat];
        const coords = this.currentGeometry.coordinates[0];

        if (coords.length === 2) {
            setTimeout(() => {
                (this.map.getSource(this.line_addion_id) as mapboxgl.GeoJSONSource).setData({
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

        if(coords.length > 2){
            this.currentFeature.properties = {
                ...this.currentFeature.properties,
                clockwise : booleanClockwise(coords)
            }
        }

        this.updateDataSource();
    }

    private onRightClickHandler = (e: mapboxgl.MapMouseEvent & Object) => {
        if (!this.currentFeature || !this.currentGeometry) return;

        const coords = this.currentGeometry.coordinates[0];

        if (coords.length === 2) {// 只存在第一个点和动态点则删除当前图形，进行下一次绘制
            this.map.off('mousemove', this.onMouseMoveHandler);
            this.map.off('contextmenu', this.onRightClickHandler);
            this.fc.features.pop();
            this.currentFeature = undefined;
            setTimeout(() => {
                (this.map.getSource(this.line_addion_id) as mapboxgl.GeoJSONSource).setData({
                    type: 'FeatureCollection',
                    features: []
                });
            }, 50);

            this.updateDataSource();
        } else {
            coords.pop();
            if (coords.length === 3) coords.pop(); // 辅助线 _line_addion 更新
            this.onMouseMoveHandler(e); // 调用鼠标移动事件，重新建立动态线
        }
    }
}