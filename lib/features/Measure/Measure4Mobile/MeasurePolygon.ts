import MeasureBase from "./MeasureBase";
import * as turf from '@turf/turf'

/**
 *  测量面积
 *
 * @class MeasureArea
 * @extends {MeasureBase}
 */
export default class MeasurePolygon extends MeasureBase {
    protected getCoordinates(): turf.helpers.Position[] | undefined {
        if (!this.currentFeature)
            return undefined;
        return (this.currentFeature.geometry as turf.Polygon).coordinates[0];
    }

    protected onInit(): void {
        this.map.addLayer({
            id: this.sourceId,
            type: 'fill',
            source: this.sourceId,
            layout: {},
            paint: {
                'fill-color': '#fbb03b',
                'fill-opacity': 0.4,
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
            source: this.sourceId,
            layout: {
                'text-field': "{area}",
            }
        })
    }

    protected onAddPoint(): void {
        let pos = this.getCrossLngLat();
        let point = [pos.lng, pos.lat]
        // 第一次定点 或者中间清空->获取不到currentFeature
        if (!this.isDrawing || !this.currentFeature) {
            this.isDrawing = true;
            this.geojson.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[point]]
                },
                properties: { area: '0' }
            })
        } else {
            const geometry = this.currentFeature?.geometry as turf.Polygon;
            geometry.coordinates[0].push(point);
            this.currentFeature!.properties!.area = geometry.coordinates[0].length > 2 ? this.getAreaString(geometry) : '0';
        }
        this.geojsonPoint.features.push({ //存点数据
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: point,
            },
            properties: {}
        })
        this.updateDataSource()
    }

    protected onRevokePoint(): void {
        const geometry = this.currentFeature?.geometry as turf.Polygon;
        this.currentFeature!.properties!.area = geometry.coordinates[0].length < 3 ? '0' : this.getAreaString(geometry);
        this.updateDataSource()
    }

    protected onFinish(): void { }

    /**
       * 计算linestring类型数据的长度，并转化为字符串形式
       * @param line 
       * @returns 
       */
    private getAreaString(polygon: turf.Polygon) {
        const area = turf.area(polygon);
        return area > 1000000 ? `${(area / 1000000).toFixed(2)}km²` : `${area.toFixed(2)}m²`
    }

}