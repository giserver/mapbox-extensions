import { array } from "wheater";
import { download } from '../../../common/io';
import { ExportGeoJsonType } from "../types";
import { ConverterOptions, FileType, IExportConverter, export_converters } from "./ExportConverter";

export default class Exporter {
    private converter: IExportConverter;
    /**
     *
     */
    constructor(converter: IExportConverter | FileType) {
        this.converter = typeof converter === 'string' ?
            array.first(export_converters, x => x.type === converter)! :
            converter;
    }

    export(fileName: string, geojson: ExportGeoJsonType, options?: ConverterOptions) {
        download(fileName + `.${this.converter.type}`, this.converter.convert(geojson, options));
    }
}