import mapboxgl from "mapbox-gl";
import { dom } from 'wheater';

export default class {

    private element = dom.createHtmlElement('div', ['jas-ctrl-tip']);
    private eventShow: keyof mapboxgl.MapLayerEventType;
    private eventHide: keyof mapboxgl.MapLayerEventType;
    private declare lngLat: mapboxgl.LngLatLike;

    /**
     *
     */
    constructor(private options: {
        map: mapboxgl.Map,
        getContent: (event: mapboxgl.MapLayerMouseEvent) => string | HTMLElement,
        layer?: string
    }) {
        this.eventShow = options.layer ? "mouseenter" : "mouseover";
        this.eventHide = this.options.layer ? 'mouseleave' : 'mouseout';
    }

    resetContent(getContent: (event: mapboxgl.MapLayerMouseEvent) => string | HTMLElement) {
        this.options.getContent = getContent;
    }

    start() {
        const map = this.options.map;
        if (this.options.layer) {
            map.on(this.eventShow, this.options.layer, this.show);
            map.on('mousemove', this.options.layer, this.move);
            map.on(this.eventHide, this.options.layer, this.hide);
        } else {
            map.on(this.eventShow, this.show);
            map.on('mousemove', this.move);
            map.on(this.eventHide, this.hide);
        }

    }

    stop() {
        const map = this.options.map;
        if (this.options.layer) {
            map.off(this.eventShow, this.options.layer, this.show);
            map.off('mousemove', this.options.layer, this.move);
            map.off(this.eventHide, this.options.layer, this.hide);
        } else {
            map.off(this.eventShow, this.show);
            map.off('mousemove', this.move);
            map.off(this.eventHide, this.hide);
        }
        this.hide();
    }

    private show = () => {
        this.options.map.getContainer().appendChild(this.element);
        this.options.map.on('move', this.updatePosition);
    }

    private hide = () => {
        this.element.remove();
        this.options.map.on('move', this.updatePosition);
    }

    private move = (e: mapboxgl.MapLayerMouseEvent) => {
        const domChild = this.options.getContent(e);
        if (typeof domChild === 'string')
            this.element.innerHTML = domChild;
        else {
            this.element.childNodes.forEach(n => n.remove());
            this.element.append(domChild);
        }

        this.lngLat = e.lngLat;
        this.updatePosition();
    }

    private updatePosition = () => {
        const position = this.options.map.project(this.lngLat);
        this.element.style.left = `${position.x}px`;
        this.element.style.top = `${position.y}px`;
    }
}