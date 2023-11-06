import tokml from '@maphubs/tokml';
import { DxfWriter, HatchBoundaryPaths, HatchPolylineBoundary, HatchPredefinedPatterns, LWPolylineVertex, pattern, vertex } from '@tarikjabiri/dxf';
import { ExportGeoJsonType } from '../types';
import { date } from 'wheater';
import { coordConverter } from '../../../common/proj';

export type FileType = 'dxf' | 'kml' | 'geojson' | 'csv';

export interface IExportConverter {
    readonly type: FileType;
    convert(geojson: ExportGeoJsonType): string;
}

export class DxfConverter implements IExportConverter {
    readonly type = 'dxf';

    convert(geojson: ExportGeoJsonType): string {
        const dxf = new DxfWriter();
        const featrues = geojson.type === "Feature" ? [geojson] : geojson.features;

        featrues.forEach(f => {
            switch (f.geometry.type) {
                case "Point":
                    const point = coordConverter.wgs84g_to_cgcs2000p([f.geometry.coordinates[0], f.geometry.coordinates[1]]);
                    dxf.addPoint(point[0], point[1], 0);
                    break;
                case "MultiPoint":
                    f.geometry.coordinates.forEach(x => {
                        const point = coordConverter.wgs84g_to_cgcs2000p([x[0], x[1]]);
                        dxf.addPoint(point[0], point[1], 0);
                    })
                    break;

                case "LineString":
                    const points = f.geometry.coordinates.map(coord => {
                        const point = coordConverter.wgs84g_to_cgcs2000p([coord[0], coord[1]]);
                        return { point: { x: point[0], y: point[1] } } as LWPolylineVertex;
                    })
                    dxf.addLWPolyline(points, { thickness: f.properties.style.lineWidth });
                    break;

                case "MultiLineString":
                    f.geometry.coordinates.forEach(x => {
                        const points = x.map(coord => {
                            const point = coordConverter.wgs84g_to_cgcs2000p([coord[0], coord[1]]);
                            return { point: { x: point[0], y: point[1] } } as LWPolylineVertex;
                        })
                        dxf.addLWPolyline(points, { thickness: f.properties.style.lineWidth });
                    });
                    break;

                case "Polygon":
                    const solid = pattern({
                        name: HatchPredefinedPatterns.SOLID,
                    });

                    const boundary = new HatchBoundaryPaths();
                    boundary.addPolylineBoundary(new HatchPolylineBoundary(f.geometry.coordinates[0].map(coord => {
                        const point = coordConverter.wgs84g_to_cgcs2000p([coord[0], coord[1]]);
                        return vertex(point[0], point[1]);
                    })));

                    dxf.addHatch(boundary, solid);

                    break;

                case "MultiPolygon":
                    f.geometry.coordinates.forEach(x => {
                        const solid = pattern({
                            name: HatchPredefinedPatterns.SOLID,
                        });

                        const boundary = new HatchBoundaryPaths();
                        boundary.addPolylineBoundary(new HatchPolylineBoundary(x[0].map(coord => {
                            const point = coordConverter.wgs84g_to_cgcs2000p([coord[0], coord[1]]);
                            return vertex(point[0], point[1]);
                        })));

                        dxf.addHatch(boundary, solid);
                    });
                    break;
            }
        });

        return dxf.stringify();
    }
}

export class KmlConverter implements IExportConverter {
    readonly type = 'kml';
    convert(geojson: ExportGeoJsonType): string {
        return tokml(geojson);
    }
}

export class GeoJsonConverter implements IExportConverter {
    readonly type = 'geojson';
    convert(geojson: ExportGeoJsonType): string {
        return JSON.stringify(geojson);
    }
}

export class CSVConverter implements IExportConverter {
    type: FileType = "csv";

    convert(geojson: ExportGeoJsonType): string {
        const features = geojson.type === 'Feature' ? [geojson] : geojson.features;
        const header = `name,date,style,geometry-type,geometry`;

        return header + '\n' + features.map(f =>
            this.value2Cell(f.properties.name) + ',' +
            date.formatDate(new Date(f.properties.date), 'yyyy-MM-dd HH:mm:ss')+ ',' +
            this.value2Cell(JSON.stringify(f.properties.style))+ ',' +
            f.geometry.type+ ',' +
            this.value2Cell(JSON.stringify(f.geometry))).join('\n');
    }

    private value2Cell(value: string) {
        value = value.replace(/"/g,`""`);
        return value.indexOf(',') >= 0 ?
            `"${value}"` : value;
    }
}

export const export_converters = [new DxfConverter(), new GeoJsonConverter(), new KmlConverter(), new CSVConverter()];