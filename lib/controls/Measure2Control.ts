import mapboxgl from "mapbox-gl";
import MeasureControl, { MeasureControlOptions } from "./MeasureControl";
import { AbstractExtendControl, ExtendControlContentType, UIPosition } from "./ExtendControl";
import SvgBuilder from "../svg";
import { createHtmlElement, isMobile } from "../utils";
import { MeasureMobileUIBase } from "../features/Measure/Measure4Mobile";
import MeasureLineString from "../features/Measure/Measure4Mobile/MeasureLineString";
import MeasurePolygon from "../features/Measure/Measure4Mobile/MeasurePolygon";

export type Measure2ControlOptions = MeasureControlOptions & {
    position?: UIPosition,
    checkUIWidth?: boolean
}

export default class Measure2Control extends AbstractExtendControl {
    private declare measureControl: MeasureControl;
    private declare measureMobileControl: MeasureMobileUIBase;

    /**
     *
     */
    constructor(private ops: Measure2ControlOptions = {}) {
        ops.horizontal ??= true;
        ops.position ??= 'top-right';
        ops.checkUIWidth ??= true;

        super({ 
            mustBe: "pc", 
            position: ops.position, 
            img1: new SvgBuilder('measure').create() });
    }

    createContent(): ExtendControlContentType {

        this.emitter.on('openChange', open => {
            if (open) {
                this.measureMobileControl?.show(true);
            } else {
                this.measureControl?.stop();
                this.measureMobileControl?.show(false);
            }
        });

        return (map: mapboxgl.Map) => {
            const mapContainer = map.getContainer();
            const isMobileWidth = mapContainer.clientWidth < this.minWidth;

            let extendContent: HTMLElement;

            if ((this.ops.checkUIWidth && isMobileWidth) || isMobile()) {
                extendContent = createHtmlElement('div', "jas-ctrl-measure", "mapboxgl-ctrl-group", "hor");
                this.measureMobileControl = new MeasureMobileUIBase(map, mapContainer, mapContainer);
                this.measureMobileControl.show(false);

                const measureLineDiv = createHtmlElement('div', "jas-flex-center", "jas-ctrl-measure-mobile-item");
                const measurePolygonDiv = createHtmlElement('div', "jas-flex-center", "jas-ctrl-measure-mobile-item");
                const measureClearDiv = createHtmlElement('div', "jas-flex-center", "jas-ctrl-measure-mobile-item");

                measureLineDiv.innerHTML = new SvgBuilder('line').create();
                measureLineDiv.addEventListener('click', () => {
                    this.measureMobileControl?.changeMeasureType('LineString');
                });

                this.measureMobileControl.measuresMap.set('LineString', {
                    measure: new MeasureLineString(map),
                    measureDiv: measureLineDiv
                });
                measurePolygonDiv.innerHTML = new SvgBuilder('polygon').create();
                measurePolygonDiv.addEventListener('click', () => {
                    this.measureMobileControl?.changeMeasureType('Polygon');
                })
                this.measureMobileControl.measuresMap.set('Polygon', {
                    measure: new MeasurePolygon(map),
                    measureDiv: measurePolygonDiv
                });
                measureClearDiv.innerHTML = new SvgBuilder('clean').create();
                measureClearDiv.addEventListener('click', () => {
                    this.measureMobileControl?.clear();
                })

                extendContent.append(measureLineDiv, measurePolygonDiv, measureClearDiv);
                //this.measureMobileControl?.changeMeasureType('LineString');
            } else {
                this.measureControl = new MeasureControl(this.ops);
                extendContent = this.measureControl.onAdd(map);
                extendContent.classList.remove('mapboxgl-ctrl');
                extendContent.style.margin = '0';
            }

            return extendContent;
        }
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        const element = super.onAdd(map);
        (element.children[2] as HTMLElement).style.padding = '0';
        return element;
    }

    onRemove(map: mapboxgl.Map): void {
        super.onRemove(map);
        this.measureControl.onRemove(map);
    }
}