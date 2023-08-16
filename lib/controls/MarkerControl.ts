import mapboxgl from "mapbox-gl";
import ExtendControl, { UIPosition } from "./ExtendControl";
import { createHtmlElement } from "../utils";
import SvgBuilder from "../svg";
import MarkerManager from "../features/Marker/MarkerManager";

export interface MarkerControlOptions {
    icon?: string | SVGElement
    position?: UIPosition
}

export default class MarkerControl implements mapboxgl.IControl {

    /**
     *
     */
    constructor(private options: MarkerControlOptions = {}) {
        this.options.icon ??= new SvgBuilder('flag').create();
        this.options.position ??= 'top-right';
    }

    onAdd(map: mapboxgl.Map): HTMLElement {

        const content = createHtmlElement('div');
        content.style.height = "600px";
        content.append(new MarkerManager(map).htmlElement);

        const extend = new ExtendControl({
            title:"标注",
            closeable:true,
            ...this.options,
            content,
            img1: this.options.icon,
            onChange: (open) => {
                if (!open) {
                
                }
            }
        });

        setTimeout(() => {
            extend.open = true;
        }, 100);

        return extend.onAdd(map);
    }

    onRemove(map: mapboxgl.Map): void {
    }

    getDefaultPosition?: (() => string) | undefined;
}