import proj4 from 'proj4';


type TLngLat = [number, number] | GeoJSON.Position
type TCoordConvertOptions = {
    lat_0?: number,
    lon_0?: number,
    x_0?: number,
    y_0?: number,
    towgs84?: number
}
const wgs84g = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

export const coordConverter = {
    wgs84g_to_cgcs2000_gauss_kruger: (lngLat: TLngLat, options: TCoordConvertOptions = {}) => {

        let cgcs2000 = '+proj=tmerc +lat_0=@lat_0 +lon_0=@lon_0 +k=1 +x_0=@x_0 +y_0=@y_0 +ellps=GRS80 +units=m +no_defs'
            .replace('@lon_0', (options.lon_0 ?? 120).toString())
            .replace('@lat_0', (options.lat_0 ?? 0).toString())
            .replace('@x_0', (options.x_0 ?? 500000).toString())
            .replace('@y_0', (options.y_0 ?? 0).toString());

        if (options.towgs84) {
            cgcs2000 += ' +towgs84=' + options.towgs84;
        }

        return proj4(wgs84g, cgcs2000, lngLat);
    },

    wgs84g_to_wgs84_pseudo_mercator: (lngLat: TLngLat, options: TCoordConvertOptions) => {
        const wgs84_pm = `+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs`
    },

    wgs84g_to_bj54: (lnglat: TLngLat, options: TCoordConvertOptions) => {
        const bj54 = "+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=25500000 +y_0=0 +ellps=krass +units=m +no_defs +type=crs";

    }
}