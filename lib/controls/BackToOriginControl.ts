import { EaseToOptions, IControl, Map } from "mapbox-gl";
import { createHtmlElement } from "../utils";
import SvgBuilder from '../svg';

export interface BackToOriginControlOptions {
    easeToOptions?: EaseToOptions
}

export default class BackToOriginControl implements IControl {

    /**
     *
     */
    constructor(private options: BackToOriginControlOptions = {}) {

    }

    onAdd(map: Map): HTMLElement {
        this.options.easeToOptions ??= {};
        const easeToOptions = this.options.easeToOptions;
        easeToOptions.center ??= map.getCenter();
        easeToOptions.zoom ??= map.getZoom();
        easeToOptions.pitch ??= map.getPitch();
        easeToOptions.bearing ??= map.getBearing();

        const div = createHtmlElement('div', "jas-flex-center", "jas-one-button-mapbox", "mapboxgl-ctrl", "mapboxgl-ctrl-group")
        div.innerHTML = new SvgBuilder('origin').create();

        div.addEventListener('click', e => {
            map.easeTo(this.options.easeToOptions!)
        })

        return div;
    }

    onRemove(map: Map): void {

    }
    getDefaultPosition?: (() => string) | undefined;

}