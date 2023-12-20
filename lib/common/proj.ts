import proj4 from 'proj4';


type TLngLat = [number, number] | GeoJSON.Position

export type TCoordConverterType = "cgcs2000_gauss_kruger" | "wgs84_pseudo_mercator" | "bj54_gauss_kruger";

export type TCoordConvertOptions = {
    type: TCoordConverterType,
    lat_0?: number,
    lon_0?: number,
    x_0?: number,
    y_0?: number,
    towgs84?: string
}

const wgs84g = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

const projDefs = new Map<TCoordConverterType, string>([
    ['cgcs2000_gauss_kruger', '+proj=tmerc +lat_0=@lat_0 +lon_0=@lon_0 +k=1 +x_0=@x_0 +y_0=@y_0 +ellps=GRS80 +units=m +no_defs'],
    ['bj54_gauss_kruger', '+proj=tmerc +lat_0=@lat_0 +lon_0=@lon_0 +k=1 +x_0=@x_0 +y_0=@y_0 +ellps=krass +units=m +no_defs +type=crs'],
    ['wgs84_pseudo_mercator', '+proj=merc +a=6378137 +b=6378137 +lat_ts=@lat_0 +lon_0=@lon_0 +x_0=@x_0 +y_0=@y_0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs']
])

function replaceParams(projString: string, options: Omit<TCoordConvertOptions, "towgs84">) {
    return projString
        .replace('@lon_0', (options.lon_0 ?? 0).toString())
        .replace('@lat_0', (options.lat_0 ?? 0).toString())
        .replace('@x_0', (options.x_0 ?? 0).toString())
        .replace('@y_0', (options.y_0 ?? 0).toString());
}

export const coordConverter = {
    convert: (lngLat: TLngLat, options: TCoordConvertOptions) => {
        let projDef = replaceParams(projDefs.get(options.type)!, options);

        if (options.towgs84 && options.towgs84.trim()) {
            projDef += ' +towgs84=' + options.towgs84;
        }

        return proj4(wgs84g, projDef, lngLat);
    }
}