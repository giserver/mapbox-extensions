import { creator } from 'wheater';

import { DrawBase, DrawBaseOptions, DrawType } from './drawBase';

export interface DrawLineStringOptions extends DrawBaseOptions {
    useCircle?: boolean,
    circlePaintBuilder?(paint: mapboxgl.CirclePaint): void,
    linePaintBuilder?(paint: mapboxgl.LinePaint): void,
}

export class DrawLineString extends DrawBase<GeoJSON.LineString> {
    readonly type: DrawType = "LineString";

    /**
     *
     */
    constructor(map: mapboxgl.Map, options: DrawLineStringOptions = {}) {

        super(map, options);

        const lineLayer = {
            id: creator.uuid(),
            type: 'line',
            source: this.id,
            paint: {
                'line-color': "#fbb03b",
                'line-width': 2,
            }
        } as mapboxgl.LineLayer;

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

        if (options.linePaintBuilder)
            options.linePaintBuilder(lineLayer.paint);

        if (options.circlePaintBuilder)
            options.circlePaintBuilder(circleLayer.paint);

        this.layers.push(lineLayer);

        if (options.useCircle)
            this.layers.push(circleLayer);
    }

    protected onStart(): void {
        this.map.on('click', this.onMapClickHandler);
        this.map.on('dblclick', this.onMapDoubleClickHandler);
    }
    protected onStop(): void {
        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('contextmenu', this.onRightClickHandler);
        this.map.off('click', this.onMapClickHandler);
        this.map.off('dblclick', this.onMapDoubleClickHandler);
    }

    protected onClear(): void {
        
    }


    private onMapClickHandler = (e: mapboxgl.MapMouseEvent & Object) => {
        const point = [e.lngLat.lng, e.lngLat.lat];

        // 判断是否已经落笔
        if (this.currentFeature && this.currentGeometry) {
            const lastPoint = this.currentGeometry.coordinates[this.currentGeometry.coordinates.length - 2];
            if (!lastPoint) // 防止双击
                return;

            this.currentGeometry.coordinates.push(point);

        } else {
            const id = creator.uuid();
            this.currentFeature = {
                type: 'Feature',
                id,
                geometry: {
                    type: 'LineString',
                    coordinates: [point]
                },
                properties: {
                    id
                }
            };

            this.map.on('mousemove', this.onMouseMoveHandler);
            this.map.on('contextmenu', this.onRightClickHandler);
        }

        this.updateDataSource();
    }

    private onMapDoubleClickHandler = (e: mapboxgl.MapMouseEvent & Object) => {

        this.map.off('mousemove', this.onMouseMoveHandler);
        this.map.off('contextmenu', this.onRightClickHandler);

        if (!this.currentGeometry || !this.currentFeature) return;

        // 排除最后一个点和动态点
        this.currentGeometry.coordinates.pop();
        this.currentGeometry.coordinates.pop();

        // 如果直接双击，删除本次测量
        if (this.currentGeometry.coordinates.length < 2) {
            this.fc.features.pop();
            this.currentFeature = undefined;
        }
        else {
            this.options.onDrawed?.call(this, this.currentFeature.id!.toString(), this.currentGeometry);
            this.currentFeature = undefined;

            if (this.options.once)
                this.stop();
        }

        // 提交更新
        this.updateDataSource();
    }

    private onMouseMoveHandler = (e: mapboxgl.MapMouseEvent & Object) => {
        const point = [e.lngLat.lng, e.lngLat.lat];

        if (!this.currentGeometry || !this.currentFeature) return;

        if (this.currentGeometry.coordinates.length > 1) {
            this.currentGeometry.coordinates.pop();
        }

        this.currentGeometry.coordinates.push(point);

        this.updateDataSource();
    }

    private onRightClickHandler = (e: mapboxgl.MapMouseEvent & Object) => {
        if (!this.currentGeometry || !this.currentFeature) return;

        if (this.currentGeometry.coordinates.length === 2) { // 只存在第一个点和动态点直接删除图形
            this.fc.features.pop();
            this.currentFeature = undefined;
            this.map.off('mousemove', this.onMouseMoveHandler);
            this.map.off('contextmenu', this.onRightClickHandler);
        } else {
            this.currentGeometry.coordinates.pop();
            this.onMouseMoveHandler(e); // 调用鼠标移动事件，重新建立动态线
        }

        this.updateDataSource();
    }
}