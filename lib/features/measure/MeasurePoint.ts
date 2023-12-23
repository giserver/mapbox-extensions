import mapboxgl from "mapbox-gl";
import { creator } from 'wheater';
import MeasureBase, { MeasureOptions, MeasureType } from "./MeasureBase";

export interface MeasurePointOptions extends MeasureOptions<GeoJSON.Point> {

    circlePaintBuilder?: (paint: mapboxgl.CirclePaint) => void;
    symbolLayoutBuilder?: (layout: mapboxgl.SymbolLayout) => void;
    symbolPaintBuilder?: (paint: mapboxgl.SymbolPaint) => void;

    /**
     * 文字创建
     */
    createText?: (lng: number, lat: number) => string
}

export default class MeasurePoint extends MeasureBase {
    readonly type: MeasureType = 'Point';

    /**
     *
     */
    constructor(map: mapboxgl.Map, private options: MeasurePointOptions = {}) {
        options.createText ??= (lng: number, lat: number) => `${lng.toFixed(4)} , ${lat.toFixed(4)}`;
        super(map, options);
    }

    protected onInit(): void {
        const circlePaint: mapboxgl.CirclePaint = {
            'circle-color': "#fbb03b",
            'circle-radius': 5
        };
        this.options.circlePaintBuilder?.call(undefined, circlePaint);
        this.layerGroup.add({
            id: this.id,
            type: 'circle',
            source: this.id,
            layout: {},
            paint: circlePaint
        });

        const symbolLayout: mapboxgl.SymbolLayout = {
            "text-field": ['get', 'coord'],
            'text-offset': [0, -1.2],
            'text-size': 16
        };
        const symbolPaint: mapboxgl.SymbolPaint = {
            'text-color': "#000000",
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
        }

        this.options.symbolLayoutBuilder?.call(undefined, symbolLayout);
        this.options.symbolPaintBuilder?.call(undefined, symbolPaint)

        this.layerGroup.add({
            id: this.id + "_label",
            type: 'symbol',
            source: this.id,
            layout: symbolLayout,
            paint: symbolPaint
        })
    }

    protected onStart(): void {
        this.map.on('click', this.onMapClickHandle);
    }

    protected onStop(): void {
        this.map.off('click', this.onMapClickHandle);
    }

    protected onClear(): void {

    }

    private onMapClickHandle = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        const id = creator.uuid();
        this.geojson.features.push({
            type: 'Feature',
            id,
            geometry: {
                type: 'Point',
                coordinates: [e.lngLat.lng, e.lngLat.lat],
            },
            properties: {
                "coord": this.options.createText!(e.lngLat.lng, e.lngLat.lat),
                id
            }
        });

        this.options.onDrawed?.call(this, id, this.geojson.features.at(-1)!.geometry as GeoJSON.Point);

        this.updateGeometryDataSource();
    }
}