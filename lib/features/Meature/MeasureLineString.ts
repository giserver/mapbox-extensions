import * as turf from "@turf/turf";
import { LineString } from "@turf/turf";
import { MapMouseEvent, EventData, GeoJSONSource } from "mapbox-gl";
import { createUUID } from "../utils";
import MeasureBase from "./MeasureBase";
import { MeasureType } from ".";

export default class MeasureLineString extends MeasureBase {
    protected type: MeasureType = 'LineString';
    private drawing: boolean = false;
    private geojsonPoint: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        'type': 'FeatureCollection',
        'features': []
    };

    protected onInit(): void {
        // 所有线段
        this.map.addLayer({
            id: this.id,
            type: 'line',
            source: this.id,
            layout: {},
            paint: {}
        });

        // 所有点以及距离标记
        this.map.addSource(this.pointSourceId, {
            type: 'geojson',
            data: this.geojsonPoint
        })

        this.map.addLayer({
            id: this.pointSourceId,
            type: 'circle',
            source: this.pointSourceId,
            layout: {},
            paint: {
                'circle-color': '#000000'
            },
            filter: ['!=', ['get', 'center'], true]
        })

        this.map.addLayer({
            id: this.pointSourceId + "_font",
            type: 'symbol',
            source: this.pointSourceId,
            layout: {
                'text-field': ['get', 'distance'],
                'text-offset': [0, -1.2],
                'text-size': 12
            },
            paint: {
                "text-color": ['case', ['==', ['get', 'center'], true], "#ff0000", "#000000"]
            }
        })
    }

    protected onStart(): void {
        this.map.on('click', this.onMapClickHandler);
        this.map.on('dblclick', this.onMapDoubleClickHandler);
    }

    protected onClear(): void {
        this.drawing = false;
        this.geojsonPoint.features.length = 0;
        this.updatePointDataSource();

    }

    protected onStop(): void {
        this.drawing = false;
        this.map.off('click', this.onMapClickHandler);
        this.map.off('dblclick', this.onMapDoubleClickHandler);
    }

    private onMapClickHandler = (e: MapMouseEvent & EventData) => {
        const point = [e.lngLat.lng, e.lngLat.lat];
        let distance = "0";
        let featureId = createUUID();
        // 判断是否已经落笔
        if (this.drawing) {
            // 获取最近一次的linestring
            const feature = this.geojson.features[this.geojson.features.length - 1];
            const lineString = feature.geometry as LineString;
            const lastPoint = lineString.coordinates[lineString.coordinates.length - 1];
            lineString.coordinates.push(point);
            distance = this.getDistanceString(lineString);
            featureId = feature.id!.toString();

            // 添加中间点
            const centerPoint = [(point[0] + lastPoint[0]) / 2, (point[1] + lastPoint[1]) / 2];
            const segment = this.getDistanceString({ type: 'LineString', coordinates: [lastPoint, point] });
            this.geojsonPoint.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: centerPoint,
                },
                properties: {
                    distance: segment,
                    parentId: featureId,
                    center: true
                }
            })

        } else {
            this.drawing = true;
            this.geojson.features.push({
                type: 'Feature',
                id: featureId,
                geometry: {
                    type: 'LineString',
                    coordinates: [point]
                },
                properties: {}
            })
        }

        this.geojsonPoint.features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: point
            },
            properties: {
                distance,
                parentId: featureId
            }
        })

        this.updateGeometryDataSource();
        this.updatePointDataSource();
    }

    private onMapDoubleClickHandler = (e: MapMouseEvent & EventData) => {
        const currentFeature = this.geojson.features[this.geojson.features.length - 1];
        const currentLine = currentFeature.geometry as LineString;

        currentLine.coordinates.pop();
        this.geojsonPoint.features.pop();
        this.geojsonPoint.features.pop();

        if (currentLine.coordinates.length === 1) {
            this.geojson.features.pop();
            this.geojsonPoint.features.pop();
        }

        console.log(this.geojsonPoint)

        this.updateGeometryDataSource();
        this.updatePointDataSource();

        this.drawing = false;
    }

    private getDistanceString(line: LineString) {
        const length = turf.length(turf.lineString(line.coordinates));
        return length > 1 ? `${length.toFixed(3)}km` : `${(length * 1000).toFixed(0)}m`;
    }

    private get pointSourceId() {
        return this.id + "_point";
    }

    private updatePointDataSource() {
        const source = this.map.getSource(this.pointSourceId) as GeoJSONSource;
        source.setData(this.geojsonPoint);
    }
}