
import { Geometry, Feature, BBox } from "geojson";

export interface GeometryProperties {
    type: 'Point' | 'Line' | 'Polygon',
    title: string,
    remark?: string
}
export interface PointProperties extends GeometryProperties {
    type: 'Point',
}

export interface LineProperties extends GeometryProperties {
    type: 'Line',
    'line-width': number,
    'line-color': string,
}

export interface PolygonProperties extends GeometryProperties {
    type: 'Polygon',
    'fill-color': string,
    'fill-opacity': number,
    'out-line-color': string,
    'out-line-width': number,
}

export type AnyProperties = PointProperties | LineProperties | PolygonProperties

export class MarkerInfo implements Feature<Geometry, AnyProperties> {
    type: "Feature" = "Feature";
    id?: string | number | undefined;
    bbox?: BBox | undefined;

    /**
     *
     */
    constructor(public geometry: Geometry, public properties: AnyProperties) {

    }
}


export class MarkerProject {

    /**
     *
     */
    constructor(
        readonly id: string,
        name: string,
        readonly createDate: Date = new Date(),
        readonly markers: MarkerInfo[] = new Array<MarkerInfo>()) {
    }
}

export class MarkerContext {

    /**
     *
     */
    constructor(private map: mapboxgl.Map, private projects: Array<MarkerProject>) {

    }
}