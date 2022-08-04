import { EventData, MapMouseEvent } from "mapbox-gl";
import { createUUID } from "../utils";
import MeasureBase from "./MeasureBase";
import { MeasureType } from ".";

export default class MeasurePoint extends MeasureBase {
    readonly type: MeasureType = 'Point';

    protected onInit(): void {
        this.map.addLayer({
            id: this.id,
            type: 'circle',
            source: this.id,
            layout: {},
            paint: {}
        })

        this.map.addLayer({
            id: this.id + "_font",
            type: 'symbol',
            source: this.id,
            layout: {
                "text-field": ['get', 'coord'],
                'text-offset': [0, -1.2],
                'text-size': 12
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
                "coord": `${e.lngLat.lng.toFixed(4)} , ${e.lngLat.lat.toFixed(4)}`
            }
        });

        this.updateGeometryDataSource();
    }
}