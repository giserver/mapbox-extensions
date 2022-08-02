import { Map } from "mapbox-gl";
import { createUUID } from './utils'

export default abstract class Measure {
    readonly id: string
    protected geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        'type': 'FeatureCollection',
        'features': []
    }

    protected abstract init(): void;
    protected abstract onStart(): void;

    /**
     *
     */
    constructor(protected map: Map) {
        this.id = createUUID();
        map.on('load', () => {
            map.addSource(this.id, {
                type: "geojson",
                data: this.geojson as any
            });

            this.init();
        })
    }

    start() {
        this.map.getCanvas().style.cursor = 'crosshair';
        this.onStart();
    }

    stop() {
        this.map.getCanvas().style.cursor = 'grab';
    }

    clear() {
        this.geojson.features.length = 0;
        this.resetSourceData();
    }

    destroy() {
        
    }

    protected resetSourceData() {
        (this.map.getSource(this.id) as any).setData(this.geojson);
    }
}

export class MeasurePoint extends Measure {

    protected init(): void {
        this.map.addLayer({
            id: this.id,
            type: 'circle',
            source: this.id,
            layout: {},
            paint: {
                'circle-color': 'red',
                'circle-stroke-width': 3
            }
        })

        this.map.addLayer({
            id: this.id + "_font",
            type: 'symbol',
            source: this.id,
            layout: {
                "text-field": ['get', 'coord']
            }
        })
    }

    protected onStart(): void {
        this.map.on('click', e => {
            this.geojson.features.push({
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [e.lngLat.lng, e.lngLat.lat]
                },
                'properties': {
                    'coord': `${e.lngLat.lng} ${e.lngLat.lat}`
                }
            });

            this.resetSourceData();
        })
    }
}