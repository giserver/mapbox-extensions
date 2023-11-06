import mapboxgl from "mapbox-gl";
import { creator } from "wheater";
import { MarkerFeatrueProperties } from "./types";
import LayerGroup  from "../LayerGroup";

type DrawType = "Point" | "LineString" | "Polygon";
type MapBoxClickEvent = mapboxgl.MapMouseEvent & mapboxgl.EventData

interface DrawBaseOptions {
    onDrawFinish: (draw: DrawBase<GeoJSON.Geometry>, flush: () => void) => void
}

abstract class DrawBase<T extends GeoJSON.Geometry> {
    readonly abstract type: DrawType;
    readonly layerGroup: LayerGroup;

    protected readonly data: GeoJSON.FeatureCollection<T, MarkerFeatrueProperties> = {
        type: 'FeatureCollection',
        features: []
    };

    protected onEnd?: () => void

    protected abstract onInit(): mapboxgl.AnyLayer[];
    protected abstract onStart(properties: MarkerFeatrueProperties): void;

    readonly id = creator.uuid();

    get currentFeature() {
        return this.data.features.at(0);
    }

    /**
     *
     */
    constructor(protected map: mapboxgl.Map, protected options: DrawBaseOptions) {
        map.addSource(this.id, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        })
        const layers = this.onInit();
        this.layerGroup = new LayerGroup(`draw-marker-${this.id}`, map, layers);
    }

    start(properties: MarkerFeatrueProperties) {
        this.end();

        this.map.doubleClickZoom.disable();
        this.map.getCanvas().style.cursor = 'crosshair';
        this.onStart(properties);
    }

    end() {
        this.onEnd?.call(undefined);
        this.map.getCanvas().style.cursor = '';
        this.map.doubleClickZoom.enable();

        this.data.features.length = 0;
        setTimeout(() => {
            this.update();
        }, 10);
    }

    update() {
        (this.map.getSource(this.id) as mapboxgl.GeoJSONSource)
            .setData(this.data);
    }
}

class DrawPoint extends DrawBase<GeoJSON.Point> {
    readonly type = 'Point';

    protected onInit(): mapboxgl.AnyLayer[] {
        return [{
            id: this.id,
            type: 'symbol',
            source: this.id,
            layout: {
                "text-field": ['get', 'name'],
                'text-size': ['get', 'textSize', ['get', 'style']],
                'icon-image': ['get', 'pointIcon', ['get', 'style']],
                'icon-size': ['get', 'pointIconSize', ['get', 'style']],
                'text-justify': 'auto',
                'text-variable-anchor': ['left', 'right', 'top', 'bottom'],
                'text-radial-offset': ['*', ['get', 'pointIconSize', ['get', 'style']], 4]
            },
            paint: {
                "text-color": ['get', 'textColor', ['get', 'style']],
                "text-halo-width": ['get', 'textHaloWidth', ['get', 'style']],
                "text-halo-color": ['get', 'textHaloColor', ['get', 'style']],
                'icon-color': ['get', 'pointIconColor', ['get', 'style']]
            }
        }];
    }

    protected onStart(properties: MarkerFeatrueProperties): void {
        const clickHandler = (e: MapBoxClickEvent) => {
            this.data.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [e.lngLat.lng, e.lngLat.lat]
                },
                properties: {
                    ...properties,
                    id: creator.uuid(),
                    date: Date.now(),
                }
            });

            this.update();

            this.options.onDrawFinish(this, () => {
                this.end();
            });
        };

        this.onEnd = () => {
            this.map.off('click', clickHandler);
        }

        this.map.once('click', clickHandler);
    }
}

class DrawLineString extends DrawBase<GeoJSON.LineString> {
    readonly type = 'LineString';

    protected onInit(): mapboxgl.AnyLayer[] {
        return [{
            id: this.id,
            type: 'line',
            source: this.id,
            paint: {
                "line-color": ['get', 'lineColor', ['get', 'style']],
                "line-width": ['get', 'lineWidth', ['get', 'style']]
            }
        }, {
            id: `${this.id}_label`,
            type: 'symbol',
            source: this.id,
            layout: {
                "text-field": ['get', 'name'],
                'text-size': ['get', 'textSize', ['get', 'style']]
            },
            paint: {
                "text-color": ['get', 'textColor', ['get', 'style']],
                "text-halo-width": ['get', 'textHaloWidth', ['get', 'style']],
                "text-halo-color": ['get', 'textHaloColor', ['get', 'style']],
            }
        }];
    }

    protected onStart(properties: MarkerFeatrueProperties): void {

        // 鼠标移动 动态构建线段
        const mouseMoveHandler = (e: MapBoxClickEvent) => {
            const coord = [e.lngLat.lng, e.lngLat.lat];

            if (this.currentFeature!.geometry.coordinates.length > 1) {
                this.currentFeature!.geometry.coordinates.pop();
            }

            this.currentFeature!.geometry.coordinates.push(coord);

            this.update();
        }

        // 删除点
        const rightClickHandler = (e: MapBoxClickEvent) => {
            if (!this.currentFeature) return;

            // 只剩下第一个点和动态点
            if (this.currentFeature.geometry.coordinates.length === 2)
                return;

            this.currentFeature.geometry.coordinates.pop();
            mouseMoveHandler(e); // 调用鼠标移动事件，重新建立动态线

            this.update();
        }

        const clickHandler = (e: MapBoxClickEvent) => {
            const coord = [e.lngLat.lng, e.lngLat.lat];
            // 判断是否为初次绘制
            if (!this.currentFeature) {
                this.data.features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [coord]
                    },
                    properties: {
                        ...properties,
                        id: creator.uuid(),
                        date: Date.now()
                    }
                });

                this.map.on('contextmenu', rightClickHandler);
                this.map.on('mousemove', mouseMoveHandler);
                this.map.once('dblclick', dblClickHandler);
            } else {
                this.currentFeature.geometry.coordinates.push(coord);
            }

            this.update();
        };

        const dblClickHandler = (e: MapBoxClickEvent) => {
            const coordinates = this.currentFeature!.geometry.coordinates;

            // 排除最后一个点和动态点
            coordinates.pop();
            coordinates.pop();

            this.map.off('click', clickHandler);
            this.map.off('contextmenu', rightClickHandler);
            this.map.off('mousemove', mouseMoveHandler);

            // 提交更新
            this.update();

            this.options.onDrawFinish(this, () => {
                this.end();
            })
        }

        this.onEnd = () => {
            this.map.off('click', clickHandler);
            this.map.off('contextmenu', rightClickHandler);
            this.map.off('mousemove', mouseMoveHandler);
            this.map.off('dblclick', dblClickHandler);
        }

        this.map.on('click', clickHandler);
    }
}

class DrawPolygon extends DrawBase<GeoJSON.Polygon> {
    readonly type = 'Polygon'

    protected onInit(): mapboxgl.AnyLayer[] {
        return [{
            id: this.id,
            type: 'fill',
            source: this.id,
            paint: {
                "fill-color": ['get', 'polygonColor', ['get', 'style']],
                'fill-opacity': ['get', 'polygonOpacity', ['get', 'style']],
            }
        }, {
            id: `${this.id}_outline`,
            type: 'line',
            source: this.id,
            paint: {
                "line-color": ['get', 'polygonOutlineColor', ['get', 'style']],
                "line-width": ['get', 'polygonOutlineWidth', ['get', 'style']]
            }
        }, {
            id: `${this.id}_label`,
            type: 'symbol',
            source: this.id,
            layout: {
                "text-field": ['get', 'name'],
                'text-size': ['get', 'textSize', ['get', 'style']]
            },
            paint: {
                "text-color": ['get', 'textColor', ['get', 'style']],
                "text-halo-width": ['get', 'textHaloWidth', ['get', 'style']],
                "text-halo-color": ['get', 'textHaloColor', ['get', 'style']],
            }
        }, {
            id: this.id + "_outline_addion",
            type: 'line',
            source: {
                'type': 'geojson',
                'data': {
                    type: 'FeatureCollection',
                    features: []
                }
            },
            paint: {
            }
        }];
    }

    protected onStart(properties: MarkerFeatrueProperties): void {

        this.map.setPaintProperty(this.id + "_outline_addion", "line-color", properties.style.polygonOutlineColor);
        this.map.setPaintProperty(this.id + "_outline_addion", "line-width", properties.style.polygonOutlineWidth);

        // 鼠标移动 动态构建线段
        const mouseMoveHandler = (e: MapBoxClickEvent) => {
            const coord = [e.lngLat.lng, e.lngLat.lat];
            const coords = this.currentFeature!.geometry.coordinates[0];

            if (coords.length === 2) {
                (this.map.getSource(this.id + "_outline_addion") as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: coords },
                    properties: {}
                })
            }

            if (coords.length > 1)
                coords.pop();

            if (coords.length > 1) {
                coords.pop();
            }

            coords.push(coord);
            if (coords.length > 2)
                coords.push(coords[0]);
            else
                (this.map.getSource(this.id + "_outline_addion") as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: coords },
                    properties: {}
                })

            this.update();
        }

        // 删除点
        const rightClickHandler = (e: MapBoxClickEvent) => {
            const coords = this.currentFeature!.geometry.coordinates[0];

            if (coords.length === 2)  // 只存在第一个点和动态点则不进行删除操作
                return;

            coords.pop();
            mouseMoveHandler(e); // 调用鼠标移动事件，重新建立动态线

            this.update();
        }

        const clickHandler = (e: MapBoxClickEvent) => {
            const coord = [e.lngLat.lng, e.lngLat.lat];
            // 判断是否为初次绘制
            if (!this.currentFeature) {
                this.data.features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[coord]]
                    },
                    properties: {
                        ...properties,
                        id: creator.uuid(),
                        date: Date.now()
                    }
                });

                this.map.on('contextmenu', rightClickHandler);
                this.map.on('mousemove', mouseMoveHandler);
                this.map.once('dblclick', dblClickHandler);
            } else {
                const coords = this.currentFeature.geometry.coordinates[0];
                if (coords.length > 2)
                    coords.pop(); //删除第一个点
                coords.push(coord);
                coords.push(coords[0]);
            }

            this.update();
        };

        const dblClickHandler = (e: MapBoxClickEvent) => {
            const coords = this.currentFeature!.geometry.coordinates[0];
            coords.pop();
            coords.pop();
            coords.pop();

            this.map.off('click', clickHandler);
            this.map.off('contextmenu', rightClickHandler);
            this.map.off('mousemove', mouseMoveHandler);

            if (coords.length < 3)
                return;

            coords.push(coords[0]);
            this.update();

            (this.map.getSource(this.id + "_outline_addion") as mapboxgl.GeoJSONSource).setData({
                type: 'FeatureCollection',
                features: []
            });

            this.options.onDrawFinish(this, () => {
                this.end();
            })
        }

        this.onEnd = () => {
            (this.map.getSource(this.id + "_outline_addion") as mapboxgl.GeoJSONSource).setData({
                type: 'FeatureCollection',
                features: []
            });

            this.map.off('click', clickHandler);
            this.map.off('contextmenu', rightClickHandler);
            this.map.off('mousemove', mouseMoveHandler);
            this.map.off('dblclick', dblClickHandler);
        }

        this.map.on('click', clickHandler);
    }
}

export default class DrawManager {
    private readonly draws: Map<DrawType, DrawBase<GeoJSON.Geometry>>;
    private currentDraw?: DrawBase<GeoJSON.Geometry>;

    constructor(private map: mapboxgl.Map, options: DrawBaseOptions) {
        this.draws = new Map<DrawType, DrawBase<GeoJSON.Geometry>>([
            ['Point', new DrawPoint(map, options)],
            ['LineString', new DrawLineString(map, options)],
            ['Polygon', new DrawPolygon(map, options)],
        ]);

        document.addEventListener('keydown', e => {
            if (e.code.toLocaleLowerCase() === 'escape') {
                if (this.currentDraw) {
                    this.currentDraw.end();
                    this.currentDraw = undefined;
                }
            }
        })
    }

    start(type: DrawType, properties: MarkerFeatrueProperties) {
        this.currentDraw?.end();
        this.currentDraw = this.draws.get(type)!;
        this.currentDraw.start(properties);
    }

    moveTo(beforeId?: string) {
        this.draws.forEach(d=>{
            d.layerGroup.moveTo(beforeId);
        });
    }

    destroy(){
        this.draws.forEach(d=>{
            this.map.removeLayerGroup(d.layerGroup.id);
        })
    }
}