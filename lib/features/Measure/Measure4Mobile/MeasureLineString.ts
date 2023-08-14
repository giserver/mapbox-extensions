import MeasureBase from "./MeasureBase";
import turfLength from '@turf/length'

/**
 *  测量距离
 *
 * @class MeasureLine
 * @extends {MeasureBase}
 */
export default class MeasureLineString extends MeasureBase {
    protected getCoordinates(): GeoJSON.Position[] | undefined {
        if (!this.currentFeature)
            return undefined;
        return (this.currentFeature.geometry as GeoJSON.LineString).coordinates;
    }

    protected onInit(): void {
        // 添加数据源
        this.map.addLayer({
            id: this.sourceId,
            type: 'line',
            source: this.sourceId,
            layout: {},
            paint: {
                'line-color': '#fbb03b',
                'line-width': 2,
            }
        })

        this.map.addLayer({
            id: this.pointSourceId,
            type: 'circle',
            source: this.pointSourceId,
            layout: {},
            paint: {
                'circle-color': '#fbb03b'
            }
        })
        this.map.addLayer({
            id: this.symbolSourceId,
            type: 'symbol',
            source: this.pointSourceId,
            layout: {
                'text-field': "{distance}",
                'text-offset': [0, -1.2]
            }, paint: {
                "text-halo-color": '#fff',
                "text-halo-width":2
            }
        })
    }

    protected onAddPoint(pos:mapboxgl.LngLat): void {
        let point = [pos.lng, pos.lat]
        let distance = '0';
        //第一次定点 或者中间清空->获取不到currentFeature
        if (!this.isDrawing || !this.currentFeature) {
            this.isDrawing = true;
            this.geojson.features.push({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [point]
                },
                properties: {}
            })
        } else {
            const geometry = this.currentFeature!.geometry as GeoJSON.LineString;
            geometry.coordinates.push(point);
            distance = geometry.coordinates.length > 1 ? this.getDistanceString(geometry) : '0';
        }

        this.geojsonPoint.features.push({ //存点数据
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: point,
            },
            properties: {
                distance
            }
        })
        this.updateDataSource()
    }

    protected onRevokePoint(): void { }
    protected onFinish(): void { }

    /**
       * 计算linestring类型数据的长度，并转化为字符串形式
       * @param line 
       * @returns 
       */
    private getDistanceString(line: GeoJSON.LineString) {
        const length = turfLength({
            type: 'Feature',
            geometry: line,
            properties: {}
        });
        return length > 1 ? `${length.toFixed(3)}km` : `${(length * 1000).toFixed(2)}m`
    }
}