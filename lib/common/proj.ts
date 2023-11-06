import proj4 from 'proj4';

export const coordConverter = {
    wgs84g_to_cgcs2000p: (lngLat: [number, number], options: {
        lon_0?: number,
        x_0?: number,
        y_0?: number
    } = {}) => {
        options.lon_0 ??= 120;
        options.x_0 ??= 500000;
        options.y_0 ??= 0;

        const wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        const cgcs2000 = '+proj=tmerc +lat_0=0 +lon_0=@lon_0 +k=1 +x_0=@x_0 +y_0=@y_0 +ellps=GRS80 +units=m +no_defs'
            .replace('@lon_0', options.lon_0.toString())
            .replace('@x_0', options.x_0.toString())
            .replace('@y_0', options.y_0.toString());

        return proj4(wgs84, cgcs2000, lngLat);
    }
}