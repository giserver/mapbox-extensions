import { DrawBase, DrawBaseOptions, DrawType } from './drawBase';
import { creator } from 'wheater';

export interface DrawPointOptions extends DrawBaseOptions {
    circlePaintBuilder?(paint: mapboxgl.CirclePaint): void,
    useSymbol?: boolean,
    symbolPaintBuilder?(paint: mapboxgl.SymbolPaint): void,
    symbolLayoutBuilder?(layout: mapboxgl.SymbolLayout): void,
}

export class DrawPoint extends DrawBase<GeoJSON.Point>{
    readonly type: DrawType = "Point";

    /**
     *
     */
    constructor(map: mapboxgl.Map, options: DrawPointOptions = {}) {
        super(map, options);

        if (options.useSymbol) {
            const symbolLayer = {
                id: creator.uuid(),
                type: 'symbol',
                source: this.id,
                paint: {},
                layout: {}
            } as mapboxgl.SymbolLayer

            if (options.symbolPaintBuilder)
                options.symbolPaintBuilder(symbolLayer.paint);
            if (options.symbolLayoutBuilder)
                options.symbolLayoutBuilder(symbolLayer.layout);

            this.layers.push(symbolLayer);
        } else {
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

            options.circlePaintBuilder?.(circleLayer.paint);

            this.layers.push(circleLayer);
        }
    }

    protected onStart(): void {
        this.map.on('click', this.onMapClickHandle);
    }
    protected onStop(): void {
        this.map.off('click', this.onMapClickHandle);
    }
    protected onClear(): void {
        
    }

    private onMapClickHandle = (e: mapboxgl.MapMouseEvent & Object) => {
        const id = creator.uuid();
        this.currentFeature = {
            type: 'Feature',
            id,
            geometry: {
                type: 'Point',
                coordinates: [e.lngLat.lng, e.lngLat.lat],
            },
            properties: {
                id
            }
        }

        this.options.onDrawed?.call(this, id, this.currentFeature.geometry);

        this.updateDataSource();

        if (this.options.once) {
            this.stop();
        }
    }
}