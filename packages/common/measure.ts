import { area as calArea } from './area';
import { length as calLength } from './length';
import calCentroid from '@turf/centroid';

/**
    * 测量标记属性
    */
type TMeasureProperties = {
    /**
     * 测量显示数据
     */
    value: string,

    /**
     * 是否为中间值
     * 
     * 线测量中的线段数据
     */
    center?: boolean,

    /**
     * 测量类型
     */
    type: 'Point' | 'LineString' | 'Polygon'
}

type TMeasureMarkerFeature = GeoJSON.Feature<GeoJSON.Point, TMeasureProperties>;

/**
 * 点测量计算参数
 */
type TMeasureCalPointOptions = {
    /**
     * 经纬度格式化
     * @param position 经纬度 lng=position[0] lat=position[1]
     */
    format?(position: GeoJSON.Position): string
}

/**
 * 线测量计算参数
 */
type TMeasureCalLineStringOptions = {
    /**
     * 长度格式化
     * @param length 长度数值
     * @param index 标点下标
     * @param end 是否为最后一个
     * @param center 是否为中间数值
     */
    format?(length: number, index: number, end: boolean, center: boolean): string,

    /**
     * 是否包含第一个数值
     * 
     * 如果计算圆环数据时 防止最后一个数据被第一个数据压盖
     */
    withStart?: boolean
}

type TMeasureCalPolygonOptions = {
    format?(area: number): string,
    withLineString?: boolean,
    measureLineStringOptions?: TMeasureCalLineStringOptions,
}

/**
 * 测量计算参数
 */
type TMeasureCalOptions = {
    point?: TMeasureCalPointOptions,
    lineString?: TMeasureCalLineStringOptions,
    polygon?: TMeasureCalPolygonOptions
}

function calPoint(g: GeoJSON.Position, options?: TMeasureCalPointOptions): TMeasureMarkerFeature[] {
    const value = options?.format?.(g) || `${g[0].toFixed(6)} , ${g[1].toFixed(6)}`;
    return [{
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: g
        },
        properties: {
            value,
            type: 'Point'
        }
    }]
}

function calLineString(g: GeoJSON.Position[], options?: TMeasureCalLineStringOptions): TMeasureMarkerFeature[] {
    const ret = new Array<TMeasureMarkerFeature>();
    let sumLength = 0;

    for (let i = 0; i < g.length; i++) {
        const current = g[i];

        if (i > 0) {
            const last = g[i - 1];
            const line: GeoJSON.Feature<GeoJSON.LineString> = { type: 'Feature', geometry: { type: 'LineString', coordinates: [last, current] }, properties: {} };
            const length = calLength(line.geometry);
            const center = calCentroid(line);

            sumLength += length;

            ret.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: center.geometry.coordinates
                },
                properties: {
                    value: options?.format?.(length, i, false, true) || `${(length).toFixed(2)} m`,
                    center: true,
                    type: 'LineString'
                }
            });
        }

        // 不记录第一个点 0 数值
        if (options?.withStart === false && i === 0) continue;

        ret.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: current
            },
            properties: {
                value: options?.format?.(sumLength * 1000, i, i === g.length - 1, false) || `${(sumLength * 1000).toFixed(2)} m`,
                type: 'LineString'
            }
        });
    }

    return ret;
}

function calPolygon(g: GeoJSON.Position[][], options?: TMeasureCalPolygonOptions): TMeasureMarkerFeature[] {
    const ret = new Array<TMeasureMarkerFeature>();

    if (options?.withLineString !== false) {
        g.forEach(x => {
            ret.push(...calLineString(x, options?.measureLineStringOptions));
        });
    }

    if (g[0].length > 3) {
        const polygon: GeoJSON.Feature<GeoJSON.Polygon> = { type: 'Feature', geometry: { type: 'Polygon', coordinates: g }, properties: {} };
        const center = calCentroid(polygon);
        const area = calArea(polygon.geometry);

        ret.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: center.geometry.coordinates
            },
            properties: {
                value: options?.format?.(area) || `${area.toFixed(2)} m²`,
                type: 'Polygon'
            }
        })
    }

    return ret;
}

function calGeometry(g: GeoJSON.Geometry, options?: TMeasureCalOptions): TMeasureMarkerFeature[] {
    if (g.type === 'Point') return calPoint(g.coordinates, options?.point);
    if (g.type === 'LineString') return calLineString(g.coordinates, options?.lineString);
    if (g.type === 'Polygon') return calPolygon(g.coordinates, options?.polygon);

    function calMulGeometry<T>(data: Array<T>, cal: (d: T, options?: any) => TMeasureMarkerFeature[], options: any): TMeasureMarkerFeature[] {
        return data.reduce((p, c) => {
            return p.concat(cal(c, options));
        }, new Array<TMeasureMarkerFeature>());
    }

    if (g.type === 'MultiPoint') return calMulGeometry(g.coordinates, calPoint, options?.point);
    if (g.type === 'MultiLineString') return calMulGeometry(g.coordinates, calLineString, options?.lineString);
    if (g.type === 'MultiPolygon') return calMulGeometry(g.coordinates, calPolygon, options?.polygon);

    throw new Error(`not suppose geometry type: ${g.type} to measure`);
}

/**
 * 根据地理数据计算测量数据
 * @param data 地理数据
 * @param options 计算参数
 * @returns 
 */
export function calMeasure(data: GeoJSON.Feature | GeoJSON.Feature[] | GeoJSON.Geometry, options?: TMeasureCalOptions) {
    if (data instanceof Array) {
        return data.reduce((p, c) => {
            return p.concat(calGeometry(c.geometry, options));
        }, new Array<TMeasureMarkerFeature>());
    }

    if (data.type === 'Feature')
        return calGeometry(data.geometry, options);

    return calGeometry(data, options);
}