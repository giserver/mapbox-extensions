import { EaseToOptions, IControl, Map } from "mapbox-gl";
import { dom } from 'wheater';
import { svg } from '../common';

export interface BackToOriginControlOptions {
    easeToOptions?: EaseToOptions
}

export class BackToOriginControl implements IControl {

    readonly element = dom.createHtmlElement('div', ["jas-flex-center", "jas-one-button-mapbox", "mapboxgl-ctrl", "mapboxgl-ctrl-group"]);

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

        this.element.innerHTML = new svg.SvgBuilder('origin').create();

        this.element.addEventListener('click', e => {
            map.easeTo(this.options.easeToOptions!)
        });

        return this.element;
    }

    onRemove(map: Map): void {
        this.element.remove();
    }

    getDefaultPosition?: (() => string) | undefined;
}