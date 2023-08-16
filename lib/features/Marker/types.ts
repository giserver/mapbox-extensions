export interface GeometryStyle {
    point_color?: string,

    line_color?: string,
    line_width?: number,

    polygon_color?: string,
    polygon_opacity?: number,
    polygon_outline_color?: string,
    polygon_outline_width?: number
}

export interface MarkerFeatrueProperties extends GeometryStyle {
    id: string,
    name: string,
    group_id: string,
    date: number,
    visible?: boolean
}

export interface MarkerLayerProperties {
    id: string,
    name: string,
    date: number
}

export type MarkerFeatureType = GeoJSON.Feature<GeoJSON.Geometry, MarkerFeatrueProperties>;