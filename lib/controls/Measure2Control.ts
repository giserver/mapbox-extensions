import mapboxgl from "mapbox-gl";
import MeasureControl, { MeasureControlOptions } from "./MeasureControl";
import ExtendControl, { UIPosition } from "./ExtendControl";
import SvgBuilder from "../svg";
import { createHtmlElement, isMobile } from "../utils";
import { MeasureMobileUIBase } from "../features/Measure/Measure4Mobile";
import MeasureLineString from "../features/Measure/Measure4Mobile/MeasureLineString";
import MeasurePolygon from "../features/Measure/Measure4Mobile/MeasurePolygon";

export type Measure2ControlOptions = MeasureControlOptions & {
    position?: UIPosition,
    checkUIWidth?: boolean
}

export default class Measure2Control implements mapboxgl.IControl {
    private minWidth = 600;
    private measureControl: MeasureControl | undefined;
    private measureMobileControl: MeasureMobileUIBase | undefined;

    /**
     *
     */
    constructor(private options: Measure2ControlOptions = {}) {
        options.horizontal ??= true;
        options.position ??= 'top-right';
        options.checkUIWidth ??= true;
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        const mapContainer = map.getContainer();
        const isMobileWidth = mapContainer.clientWidth < this.minWidth;

        let extendContent: HTMLElement;

        if ((this.options.checkUIWidth && isMobileWidth) || isMobile()) {
            extendContent = createHtmlElement('div', "jas-ctrl-measure", "mapboxgl-ctrl-group", "hor");
            this.measureMobileControl = new MeasureMobileUIBase(map,mapContainer, mapContainer);
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
            this.measureControl = new MeasureControl(this.options);
            extendContent = this.measureControl.onAdd(map);
            extendContent.classList.remove('mapboxgl-ctrl');
            extendContent.style.margin = '0';
        }

        const extendControl = new ExtendControl({
            content: extendContent,
            mustBe: "pc",
            onChange: open => {
                if (open) {
                    this.measureMobileControl?.show(true);
                } else {
                    this.measureControl?.stop();
                    this.measureMobileControl?.show(false);
                }
            },
            img1: new SvgBuilder('measure').create()
        });

        const extendEle = extendControl.onAdd(map);
        (extendEle.children[2] as HTMLElement).style.padding = '0';
        return extendEle;
    }

    onRemove(map: mapboxgl.Map): void {
        this.measureControl?.onRemove(map);
    }

    getDefaultPosition() {
        return this.options.position!;
    }
}