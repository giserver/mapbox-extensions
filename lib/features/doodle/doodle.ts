import mapboxgl from "mapbox-gl";
import { creator } from "wheater";

type TMapboxEventKey = keyof mapboxgl.MapEventType;

type TMapboxEvent<T extends TMapboxEventKey> = mapboxgl.MapEventType[T] & mapboxgl.EventData;

export interface DoodleOptions {
    linePaintBuilder?(paint: mapboxgl.LinePaint): void;
    fillPaintBuilder?(paint: mapboxgl.FillPaint): void;

    onStart?(): void;
    onDrawed?(geometry: GeoJSON.Polygon): void;
}

export class Doodle {
    private pencilImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAjRJREFUWEft1T2L1EAYB/D/kw0IVlaClSDY6FUKwnVXWYmFIAqC4MGBB4K6ZDILIu7BQZxJUFDBFxAURfHQ0k/gWyE2IldZiPgVLASZRwYmErPJ7exlwjZuFZLZ+f/yzJMZwpx/NOd8/AdMVEBrfR/ATmb+EEXRWyHE5z6X6R+A1voQgE+1wF8A3jHzGynlODSmqQK/AQyqQcy8ZsOLojiQJMlmSEQT4D2AxTKkGm6M2WDmlyEr0QS4AeCyBdTDARys3g9RiQlAURQnjDGv2sLrlemKmADkeb4bwKoQYs2uuS17+eb1sBLZBdG6EU0LD1WJVoBSakxE13zerkslttyKlVLrRHSlT8TUs0ApdZ2IpA+CiMa2d3zGlmOmAuxArXUOIPGZeNbl8ALYYKXUTSK6FBrhDXCI20R0ISRiJoBD3CWi8z4In56YGeAQD4hoxQNxNU3T9a3GbQvgGvMhgOW2yZk5lVLa5kWe5wtCiC9NY7cNcIjHAM7WJyaii0KIW/Z+lmWHB4PBE2beaDpFOwEc4imAM5WteVVKec+9+SIz2+f73PNzaZo+qoI7A1zQc2Y+DeBvQJZlS3EcP2PmPZXAb0Rkl+PnTBuRR7PZzepUmqYvXFWOArDXu+r/jaLoSJIkH4MDygmVUseJyB7hO5rgcRzvHw6HX3sDaK1t+MmmcGZ+LaU8FrwH6mFtCGPM3tFo9L13gOuDZSJacn2waYy5I6X8MfHJ+jRYn2OCfIZdgHMH/AFcQQ0wbeMD1AAAAABJRU5ErkJggg==`;
    private id = creator.uuid;
    private drawing: boolean = false;
    private currentLine: GeoJSON.Feature<GeoJSON.LineString, null> =
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: null };

    private get currentPolygon(): GeoJSON.Feature<GeoJSON.Polygon, null> {
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: this.currentLine.geometry.coordinates.length === 0 ? [] :
                    [[...this.currentLine.geometry.coordinates, this.currentLine.geometry.coordinates[0]]]

            },
            properties: null
        }
    }

    private onMouseDown = (e: TMapboxEvent<'mousedown'>) => {
        e.preventDefault();

        this.addPoint(e.lngLat);

        e.target.on('mousemove', this.onMouseMove);
        e.target.once('mouseup', this.onMouseUp);
    };

    private onMouseMove = (e: TMapboxEvent<'mousemove'>) => {
        this.addPoint(e.lngLat);
    };

    private onMouseUp = (e: TMapboxEvent<'mouseup'>) => {
        this.addPoint(e.lngLat, true);
        e.target.off('mousemove', this.onMouseMove);
        this.options.onDrawed?.(this.currentPolygon.geometry);
        this.drawing = false;
    };


    get lineSourceId() {
        return `doodle-line-${this.id}`;
    }

    get polygonSourceId() {
        return `doodle-polygon-${this.id}`;
    }

    get lineLayerId() {
        return `doodle-line-${this.id}`;
    }

    get polygonLayerId() {
        return `doodle-polygon-${this.id}`;
    }

    /**
     *
     */
    constructor(private map: mapboxgl.Map, private options: DoodleOptions = {}) {
        map.addSource(this.lineSourceId, {
            type: 'geojson',
            data: this.currentLine
        });

        map.addSource(this.polygonSourceId, {
            type: 'geojson',
            data: this.currentPolygon
        });

        const linePaint: mapboxgl.LinePaint = {
            "line-color": 'blue',
            "line-width": 5,
        };

        const fillPaint: mapboxgl.FillPaint = {
            "fill-color": 'cyan',
            "fill-opacity": 0.5
        };

        options.linePaintBuilder?.(linePaint);
        options.fillPaintBuilder?.(fillPaint);

        map.addLayer({
            id: this.lineLayerId,
            type: 'line',
            source: this.lineSourceId,
            paint: linePaint
        });

        map.addLayer({
            id: this.polygonSourceId,
            type: 'fill',
            source: this.polygonSourceId,
            paint: fillPaint
        });
    }

    /**
     * 开始在地图上绘制涂鸦
     * 鼠标指针变化
     * handle mouse down，action：handle mouse move and handle once mouse up
     * mouse move action : add current mouse position(lng lat) into layer, update
     * mouse up   action : off mouse move
     */
    start() {
        // 检查是否已经点击开始
        if (this.drawing)
            return;

        this.drawing = true;
        this.options.onStart?.();
        this.map.getCanvas().style.cursor = `url("${this.pencilImage}"),auto`;
        this.map.once('mousedown', this.onMouseDown);
    }

    stop() {
        if (!this.drawing)
            return;

        // stop operation
        this.map.off('mousedown', this.onMouseDown);
        this.map.getCanvas().style.cursor = '';
        this.drawing = false;
    }

    clear() {
        this.currentLine.geometry.coordinates.length = 0;
        this.updateDataSource(true);
    }

    private addPoint(lngLat: mapboxgl.LngLat, updatePolygon?: boolean) {
        this.currentLine.geometry.coordinates.push([lngLat.lng, lngLat.lat]);
        this.updateDataSource(updatePolygon);
    }

    private updateDataSource(withPolygon?: boolean) {
        if (withPolygon) {
            (this.map.getSource(this.lineSourceId) as mapboxgl.GeoJSONSource).setData(this.currentPolygon);
            (this.map.getSource(this.polygonSourceId) as mapboxgl.GeoJSONSource).setData(this.currentPolygon);
        } else
            (this.map.getSource(this.lineSourceId) as mapboxgl.GeoJSONSource).setData(this.currentLine);
    }
}