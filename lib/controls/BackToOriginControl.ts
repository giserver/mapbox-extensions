import { EaseToOptions, IControl, Map } from "mapbox-gl";
import { createHtmlElement } from "../utils";

export interface BackToOriginControlOptions {
    easeToOptions?: EaseToOptions
}

export default class BackToOriginControl implements IControl {
    private img = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_568_16884)" fill="none" stroke="black">
    <path stroke-width="0.6" d="M12 3H10L11.3 1.7C11.7 1.3 11.7 0.7 11.3 0.3C10.9 -0.1 10.3 -0.1 9.9 0.3L6.9 3.3C6.5 3.7 6.5 4.3 6.9 4.7L9.9 7.7C10.1 7.9 10.4 8 10.6 8C10.8 8 11.1 7.9 11.3 7.7C11.7 7.3 11.7 6.7 11.3 6.3L10 5H12C16.7 5 20.5 8.8 20.5 13.5C20.5 18.2 16.7 22 12 22C7.3 22 3.5 18.2 3.5 13.5C3.5 12 3.9 10.5 4.7 9.2C5 8.7 4.8 8.1 4.3 7.8C3.9 7.5 3.2 7.7 3 8.1C2 9.7 1.5 11.6 1.5 13.5C1.5 19.3 6.2 24 12 24C17.8 24 22.5 19.3 22.5 13.5C22.5 7.7 17.8 3 12 3Z" fill="#48505E"/>
    <path stroke-width="0.6" d="M15.8 13.5C15.8 11.4 14.1 9.69995 12 9.69995C9.90001 9.69995 8.20001 11.4 8.20001 13.5C8.20001 15.6 9.90001 17.3 12 17.3C14.1 17.3 15.8 15.6 15.8 13.5ZM10.2 13.5C10.2 12.5 11 11.7 12 11.7C13 11.7 13.8 12.5 13.8 13.5C13.8 14.5 13 15.2 12 15.2C11 15.2 10.2 14.5 10.2 13.5Z" fill="#48505E"/>
    </g>
    <defs>
    <clipPath id="clip0_568_16884">
    <rect width="24" height="24" fill="white"/>
    </clipPath>
    </defs>
    </svg>
    `
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

        const div = createHtmlElement('div', "jas-ctrl-backtoorigin", "mapboxgl-ctrl", "mapboxgl-ctrl-group")
        div.innerHTML = this.img;

        div.addEventListener('click', e => {
            map.easeTo(this.options.easeToOptions!)
        })

        return div;
    }

    onRemove(map: Map): void {

    }
    getDefaultPosition?: (() => string) | undefined;

}