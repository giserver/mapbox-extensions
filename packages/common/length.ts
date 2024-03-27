import proj4 from "proj4";

/**
 * 计算长度
 * @param value 
 */
export function length(value: Array<[number, number]>): number;

/**
 * 计算长度
 * @param value Geometry
 * @param projExpression proj4 投影参数 {@link http://proj4js.org/}，也可以在 {@link https://epsg.io/} 中获取
 */
export function length(value: GeoJSON.Geometry, projExpression?: string | ((coordinates: GeoJSON.Position[]) => string)): number;
export function length(value: GeoJSON.Geometry | Array<[number, number]>, projExpression?: string | ((coordinates: GeoJSON.Position[]) => string)): number {
    if (value instanceof Array) {
        return value.reduce((p, c, i) => {
            return i === value.length - 1 ?
                p :
                p + Math.sqrt(Math.pow(c[0] - value[i + 1][0], 2) + Math.pow(c[1] - value[i + 1][1], 2));
        }, 0);
    }

    // 默认坐标系为4549，中央精度使用多边形最小值，变形最小
    projExpression ??= (coordinates: GeoJSON.Position[]) => {
        const lon_0 = coordinates.reduce((p, c) => Math.min(c[0], p), Number.MAX_VALUE);
        return `+proj=tmerc +lat_0=0 +lon_0=${lon_0} +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs`;
    }

    if (value.type === 'Point' || value.type === "MultiPoint") return 0;

    function calSingleLineLength(coordinates: GeoJSON.Position[]) {
        const toProjection = typeof projExpression === 'string' ? projExpression : projExpression(coordinates);
        const proj_coords = coordinates.map(x => proj4(toProjection, x));
        return length(proj_coords as any);
    }

    if (value.type === 'LineString') return calSingleLineLength(value.coordinates);
    if (value.type === 'MultiLineString' || value.type === 'Polygon') return value.coordinates.reduce((p, c) => p + calSingleLineLength(c), 0);
    if (value.type === 'MultiPolygon') return value.coordinates.reduce((p, c) => p + c.reduce((p1, c1) => p1 + calSingleLineLength(c1), 0), 0);

    return value.geometries.reduce((p, c) => p + length(c, projExpression), 0);
}