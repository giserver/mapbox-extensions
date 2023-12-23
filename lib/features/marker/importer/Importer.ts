import { array } from "wheater";
import { ConverterOptions, FileType, IImportConverter, import_converters } from "./ImportConverter";

export default class Importer {
    private converter: IImportConverter;

    /**
     *
     */
    constructor(converter: IImportConverter | FileType) {
        this.converter = typeof converter === 'string' ?
            array.first(import_converters, x => x.type === converter)! :
            converter;
    }

    async import(layerId: string, value: string, options?: ConverterOptions) {
        return await this.converter.convert(layerId, value, options);
    }
}