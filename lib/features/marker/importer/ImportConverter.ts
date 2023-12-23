import { toGeoJSON } from 'kml-geojson';
import { GeometryStyle, MarkerFeatrueProperties } from '../types';
import { FeatureCollection, Geometry } from 'geojson';
import { uuid } from 'wheater/dist/utils/creator';

export type FileType = "kml";

export type ConverterOptions = {
    defaultStyle?: GeometryStyle
}

export interface IImportConverter {
    readonly type: FileType;
    convert(layerId: string, value: string, options?: ConverterOptions): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry, MarkerFeatrueProperties>>;
}

export class KmlConverter implements IImportConverter {
    readonly type = 'kml';

    async convert(layerId: string, value: string, options?: ConverterOptions): Promise<FeatureCollection<Geometry, MarkerFeatrueProperties>> {
        const fc = await toGeoJSON(value);

        fc.features.forEach(f => {
            f.id = uuid();
            f.properties = {
                id: f.id,
                name: "",
                layerId,
                date: Date.now(),
                style: options?.defaultStyle ?? getDefaultStyle()
            }
        });

        return fc as any;
    }
}

export const import_converters = [new KmlConverter()];

function getDefaultStyle(): GeometryStyle {
    return {
        textSize: 14,
        textColor: 'black',
        textHaloColor: 'white',
        textHaloWidth: 1,

        pointIcon: "标1.png",
        pointIconColor: "#ff0000",
        pointIconSize: 0.3,

        lineColor: '#0000ff',
        lineWidth: 3,

        polygonColor: '#0000ff',
        polygonOpacity: 0.5,
        polygonOutlineColor: '#000000',
        polygonOutlineWidth: 2,
    }
}