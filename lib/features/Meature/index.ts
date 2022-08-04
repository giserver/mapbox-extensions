import MeasureBase from "./MeasureBase";
import MeasurePoint, { MeasurePointOptions } from "./MeasurePoint";
import MeasureLineString, { MeasureLineStringOptions } from "./MeasureLineString";
import MeasurePolygon, { MeasurePolygonOptions } from "./MeasurePolygon";

export type MeasureType = 'Point' | 'LineString' | 'Polygon'

export { MeasureBase, 
    MeasurePoint, MeasurePointOptions, 
    MeasureLineString, MeasureLineStringOptions, 
    MeasurePolygon, MeasurePolygonOptions }