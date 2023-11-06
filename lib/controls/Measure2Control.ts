import mapboxgl from "mapbox-gl";
import { dom, validator } from 'wheater';
import MeasureControl, { MeasureControlOptions } from "./MeasureControl";
import { AbstractExtendControl, ExtendControlContentType, UIPosition } from "./ExtendControl";
import SvgBuilder from "../common/svg";
import { MeasureMobileUIBase } from "../features/Measure/Measure4Mobile";
import MeasureLineString from "../features/Measure/Measure4Mobile/MeasureLineString";
import MeasurePolygon from "../features/Measure/Measure4Mobile/MeasurePolygon";

export type Measure2ControlOptions = MeasureControlOptions & {
    position?: UIPosition,
    checkUIWidth?: boolean
}

export default class Measure2Control extends AbstractExtendControl {
    private measureControl: MeasureControl | undefined;
    private measureMobileControl: MeasureMobileUIBase | undefined;

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
            img1: new SvgBuilder('measure').create()
        });
    }

    protected createContent(): ExtendControlContentType {

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

            if ((this.ops.checkUIWidth && isMobileWidth) || validator.os.isMobile()) {
                this.measureMobileControl = new MeasureMobileUIBase(map, mapContainer, mapContainer);
                this.measureMobileControl.show(false);

                const measureClearDiv = dom.createHtmlElement('div',
                    ["jas-flex-center", "jas-ctrl-measure-mobile-item"],
                    [new SvgBuilder('clean').create('svg')],
                    { onClick: () => this.measureMobileControl?.clear() }
                );


                this.measureMobileControl.measuresMap.set('LineString', {
                    measure: new MeasureLineString(map),
                    measureDiv: dom.createHtmlElement('div',
                        ["jas-flex-center", "jas-ctrl-measure-mobile-item"],
                        [new SvgBuilder('line').create('svg')],
                        { onClick: () => this.measureMobileControl?.changeMeasureType('LineString') }
                    )
                });

                this.measureMobileControl.measuresMap.set('Polygon', {
                    measure: new MeasurePolygon(map),
                    measureDiv: dom.createHtmlElement('div',
                        ["jas-flex-center", "jas-ctrl-measure-mobile-item"],
                        [new SvgBuilder('polygon').create('svg')],
                        { onClick: () => this.measureMobileControl?.changeMeasureType('Polygon') }
                    )
                });

                extendContent = dom.createHtmlElement('div',
                    ["jas-ctrl-measure", "mapboxgl-ctrl-group", "hor"], [
                    this.measureMobileControl.measuresMap.get('LineString')!.measureDiv,
                    this.measureMobileControl.measuresMap.get('Polygon')!.measureDiv
                    , measureClearDiv
                ]);
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
        this.measureControl?.onRemove(map);
        this.measureMobileControl?.onRemove();
    }
}