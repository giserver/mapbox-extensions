import { Map, EventData, MapMouseEvent } from "mapbox-gl";
import { createUUID, setDefaultValue } from "../utils";
import MeasureBase, { MeasureType } from "./MeasureBase";

export interface MeasurePointOptions {

    /**
         * 经纬度文字的大小
         */
    textSize?: number,

    /**
    * 文字颜色
    */
    textColor?: string,

    /**
     * 文字在众方向上的偏移 
     */
    textOffsetY?: number,

    /**
     * 点颜色
     */
    pointColor?: string,

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
    constructor(map: Map, private options: MeasurePointOptions = {}) {
        setDefaultValue(options, 'textSize', 12);
        setDefaultValue(options, 'textColor', "#000000");
        setDefaultValue(options, 'textOffsetY', -1.2);
        setDefaultValue(options, 'pointColor', "#000000");
        setDefaultValue(options, 'createText', (lng: number, lat: number) => `${lng.toFixed(4)} , ${lat.toFixed(4)}`);
        super(map);
    }

    protected onInit(): void {
        this.layerGroup.add({
            id: this.id,
            type: 'circle',
            source: this.id,
            layout: {},
            paint: {
                'circle-color': this.options.pointColor,
            }
        });

        this.layerGroup.add({
            id: this.id + "_font",
            type: 'symbol',
            source: this.id,
            layout: {
                "text-field": ['get', 'coord'],
                'text-offset': [0, this.options.textOffsetY!],
                'text-size': this.options.textSize,
            },
            paint: {
                'text-color': this.options.textColor
            }
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

    private onMapClickHandle = (e: MapMouseEvent & EventData) => {
        this.geojson.features.push({
            type: 'Feature',
            id: createUUID(),
            geometry: {
                type: 'Point',
                coordinates: [e.lngLat.lng, e.lngLat.lat],
            },
            properties: {
                "coord": this.options.createText!(e.lngLat.lng, e.lngLat.lat)
            }
        });

        this.updateGeometryDataSource();
    }
}