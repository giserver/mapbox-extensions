import { EaseToOptions, IControl, Map } from "mapbox-gl";
import { createHtmlElement } from "../utils";
import svgs from '../svg';

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
        this.options.easeToOptions ??= {
            center: map.getCenter(),
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing()
        };

        const div = createHtmlElement('div', "jas-btn-hover", "jas-flex-center", "jas-one-button-mapbox", "mapboxgl-ctrl", "mapboxgl-ctrl-group")
        div.innerHTML = svgs.origin;

        div.addEventListener('click', e => {
            map.easeTo(this.options.easeToOptions!)
        })

        return div;
    }

    onRemove(map: Map): void {

    }
    getDefaultPosition?: (() => string) | undefined;

}