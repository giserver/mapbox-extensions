import { Map, EventData, MapMouseEvent } from "mapbox-gl";
import { createUUID } from "../utils";
import MeasureBase from "./MeasureBase";
import { MeasureType } from ".";

export class MeasurePointOptions {

    constructor(
        /**
         * 经纬度文字的大小
         */
        public textSize = 12,

        /**
        * 文字颜色
        */
        public textColor = "#000000",

        /**
         * 文字在众方向上的偏移 
         */
        public textOffsetY = -1.2,

        /**
         * 点颜色
         */
        public pointColor = "#000000",

        /**
         * 文字创建
         */
        public createText = (lng: number, lat: number) => `${lng.toFixed(4)} , ${lat.toFixed(4)}`
    ) { }
}

export default class MeasurePoint extends MeasureBase {
    readonly type: MeasureType = 'Point';

    /**
     *
     */
    constructor(map: Map, private options = new MeasurePointOptions()) {
        super(map);
    }

    protected onInit(): void {
        this.map.addLayer({
            id: this.id,
            type: 'circle',
            source: this.id,
            layout: {},
            paint: {
                'circle-color': this.options.pointColor,
            }
        })

        this.map.addLayer({
            id: this.id + "_font",
            type: 'symbol',
            source: this.id,
            layout: {
                "text-field": ['get', 'coord'],
                'text-offset': [0, this.options.textOffsetY],
                'text-size': this.options.textSize,
            },
            paint: {
                'text-color': this.options.textColor
            }
        })

        this.layerIds.push(...[this.id, this.id + "_font"]);
    }

    protected onStart(): void {
        this.map.on('click', this.onMapClickHandle);
    }

    protected onStop(): void {
        this.map.off('click', this.onMapClickHandle);
    }

    protected onClear(): void {

    }

    private onMapClickHandle = (e: MapMouseEvent & EventData) => {
        this.geojson.features.push({
            type: 'Feature',
            id: createUUID(),
            geometry: {
                type: 'Point',
                coordinates: [e.lngLat.lng, e.lngLat.lat],
            },
            properties: {
                "coord": this.options.createText(e.lngLat.lng, e.lngLat.lat)
            }
        });

        this.updateGeometryDataSource();
    }
}