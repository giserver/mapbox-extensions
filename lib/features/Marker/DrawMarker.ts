import mapboxgl from "mapbox-gl";
import { GeometryStyle, MarkerFeatrueProperties } from "./types";
import { creator } from "wheater";

type DrawType = "Point" | "LineString" | "Polygon";
type MapBoxClickEvent = mapboxgl.MapMouseEvent & mapboxgl.EventData

interface DrawBaseOptions {
    onDrawFinish: (draw: DrawBase<GeoJSON.Geometry>, flush: () => void) => void
}

abstract class DrawBase<T extends GeoJSON.Geometry> {
    readonly abstract type: DrawType;
    protected readonly data: GeoJSON.FeatureCollection<T, MarkerFeatrueProperties> = {
        type: 'FeatureCollection',
        features: []
    };

    protected onEnd?: () => void

    protected abstract onInit(): void;
    protected abstract onStart(style: GeometryStyle): void;

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
        this.onInit();
    }

    start(style?: GeometryStyle) {
        this.end();

        style ??= {
            point_color: 'blue',

            line_color: 'blue',
            line_width: 3,

            polygon_color: 'blue',
            polygon_opacity: 0,
            polygon_outline_color: 'blue',
            polygon_outline_width: 2,
        }
        this.map.getCanvas().style.cursor = 'crosshair';
        this.onStart(style);
    }

    end() {
        this.onEnd?.call(undefined);
        this.map.getCanvas().style.cursor = '';
        this.data.features.length = 0;
        this.update();
    }

    update() {
        (this.map.getSource(this.id) as mapboxgl.GeoJSONSource)
            .setData(this.data);
    }
}

class DrawPoint extends DrawBase<GeoJSON.Point> {
    readonly type = 'Point';

    protected onInit(): void {
        this.map.addLayer({
            id: this.id,
            type: 'symbol',
            source: this.id,
            layout: {
                "icon-image": "img1"
            },
            paint: {
                "icon-color": ['get', "point_color"],
            }
        });
    }

    protected onStart(style: GeometryStyle): void {
        const clickHandler = (e: MapBoxClickEvent) => {
            this.data.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [e.lngLat.lng, e.lngLat.lat]
                },
                properties: {
                    id: creator.uuid(),
                    name: '',
                    date: Date.now(),
                    group_id: '',
                    ...style
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

    protected onInit(): void {
        this.map.addLayer({
            id: this.id,
            type: 'line',
            source: this.id,
            paint: {
                "line-color": ['get', 'line_color'],
                "line-width": ['get', 'line_width']
            }
        });
    }

    protected onStart(style: GeometryStyle): void {

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
                        id: creator.uuid(),
                        name: "",
                        group_id: '',
                        date: Date.now(),
                        ...style
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
            this.map.off('dblClickHandler', dblClickHandler);
        }

        this.map.on('click', clickHandler);
    }
}

class DrawPolygon extends DrawBase<GeoJSON.Polygon> {
    readonly type = 'Polygon'

    protected onInit(): void {
        this.map.addLayer({
            id: this.id,
            type: 'fill',
            source: this.id,
            paint: {
                "fill-color": ['get', 'polygon_color'],
                'fill-opacity': ['get', 'polygon_opacity'],
            }
        });
        this.map.addLayer({
            id: `${this.id}_outline`,
            type: 'line',
            source: this.id,
            paint: {
                "line-color": ['get', 'polygon_outline_color'],
                "line-width": ['get', 'polygon_outline_width']
            }
        });


        this.map.addLayer({
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
        });
    }

    protected onStart(style: GeometryStyle): void {
        
        this.map.setPaintProperty(this.id + "_outline_addion","line-color",style.polygon_outline_color);
        this.map.setPaintProperty(this.id + "_outline_addion","line-width",style.polygon_outline_width);

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
                        id: creator.uuid(),
                        name: "",
                        group_id: '',
                        date: Date.now(),
                        ...style
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
            this.map.off('dblClickHandler', dblClickHandler);
        }

        this.map.on('click', clickHandler);
    }
}

export default class DrawManager {
    private readonly draws: Map<DrawType, DrawBase<GeoJSON.Geometry>>;
    private currentDraw?: DrawBase<GeoJSON.Geometry>;

    constructor(map: mapboxgl.Map, options: DrawBaseOptions) {

        this.draws = new Map<DrawType, DrawBase<GeoJSON.Geometry>>([
            ['Point', new DrawPoint(map, options)],
            ['LineString', new DrawLineString(map, options)],
            ['Polygon', new DrawPolygon(map, options)],
        ]);

        document.addEventListener('keydown', e => {
            if (e.keyCode === 27) {
                if (this.currentDraw) {
                    this.currentDraw.end();
                    this.currentDraw = undefined;
                }
            }
        })
    }

    start(type: DrawType, style?: GeometryStyle) {
        this.currentDraw = this.draws.get(type)!;
        this.currentDraw.start(style);
    }
}