import proj4 from 'proj4';

/**
 * 鞋带法计算面积
 * @param ring 环形,可以不闭合 内层数组长度必须大于1。
 * @example
 * let area = cal([[0,0],[1,1],[1,0]]);
 * @returns 面积
 */
export function cal(ring: number[][]) {
    if (ring.length < 3) return 0;

    let sum = 0;

    for (let i = 0; i < ring.length; i++) {
        const current = ring[i];
        const next = i === ring.length - 1 ? ring[0] : ring[i + 1];

        sum += current[0] * next[1] - current[1] * next[0];
    }

    return Math.abs(0.5 * sum);
}

/**
 * 计算地理多边形面积
 * @param value 面或者多面
 * @param projExpression 
 * proj4 投影参数 {@link http://proj4js.org/}，
 * 也可以在 {@link https://epsg.io/} 中获取
 * @returns 
 */
export function calGeoPolygon(value: GeoJSON.Polygon | GeoJSON.MultiPolygon, projExpression?: string | ((coordinates: GeoJSON.Position[]) => string)): number {
    // 默认坐标系为4549，中央精度使用多边形最小值，变形最小
    projExpression ??= (coordinates: GeoJSON.Position[]) => {
        const lon_0 = coordinates.reduce((p, c) => Math.min(c[0], p), Number.MAX_VALUE);
        return `+proj=tmerc +lat_0=0 +lon_0=${lon_0} +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs`;
    }

    /**
     * 计算封闭多边形面积
     * @param coordinates 
     * @returns 
     */
    function calClosedPolygon(coordinates: GeoJSON.Position[]): number {
        const toProjection = typeof projExpression === 'string' ? projExpression : projExpression(coordinates);
        const proj_coords = coordinates.map(x => proj4(toProjection, x));
        return cal(proj_coords);
    }

    /**
     * 计算单个多边形面积
     * @param coordinates 
     * @returns 
     */
    function calSinglePolygon(coordinates: GeoJSON.Position[][]): number {
        return coordinates.reduce<number>((p, c) => {
            const currentArea = calClosedPolygon(c);
            return p === Number.MIN_VALUE ? currentArea : p - currentArea;
        }, Number.MIN_VALUE);
    }

    return value.type === 'MultiPolygon' ?
        value.coordinates.reduce((p, c) => p + calSinglePolygon(c), 0) :
        calSinglePolygon(value.coordinates);
}