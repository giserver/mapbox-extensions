import { EaseToOptions, IControl, Map } from "mapbox-gl";
import { createHtmlElement } from "../utils";
import SvgBuilder from '../svg';

export interface BackToOriginControlOptions {
    easeToOptions?: EaseToOptions
}

export default class BackToOriginControl implements IControl {

    private parentElement = createHtmlElement('div', "jas-flex-center", "jas-one-button-mapbox", "mapboxgl-ctrl", "mapboxgl-ctrl-group");

    /**
     *
     */
    constructor(public options: BackToOriginControlOptions = {}) {

    }

    onAdd(map: Map): HTMLElement {
        this.options.easeToOptions ??= {};
        const easeToOptions = this.options.easeToOptions;
        easeToOptions.center ??= map.getCenter();
        easeToOptions.zoom ??= map.getZoom();
        easeToOptions.pitch ??= map.getPitch();
        easeToOptions.bearing ??= map.getBearing();

        const div = this.parentElement;
        div.innerHTML = new SvgBuilder('origin').create();

        div.addEventListener('click', e => {
            map.easeTo(this.options.easeToOptions!)
        });

        return div;
    }

    onRemove(map: Map): void {
        this.parentElement.remove();
    }

    getDefaultPosition?: (() => string) | undefined;
}