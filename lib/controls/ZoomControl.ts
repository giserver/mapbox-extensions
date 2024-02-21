import mapboxgl from "mapbox-gl";
import { dom } from 'wheater';

export interface ZoomControlOptions {
    /**
     * 控件默认位置
     */
    defaultPosition?: string;
    /**
     * 缩放级别保留的小数位数
     */
    fractionDigits?: number;
    /**
     * 缩放级别显示文本前缀
     */
    prefix?: string;
}

/**
 * 缩放控件：显示地图当前缩放级别
 */
export class ZoomControl implements mapboxgl.IControl {

    readonly element = dom.createHtmlElement('div', ["jas-ctrl-zoom", "mapboxgl-ctrl"]);

    constructor(private options: ZoomControlOptions = {}) {
        this.options.defaultPosition ??= "top-left";
        this.options.fractionDigits ??= 1;
        this.options.prefix ??= "缩放级别";
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        let that = this;
        this.element.innerHTML = `${that.options.prefix} ${map.getZoom().toFixed(that.options.fractionDigits)}`;
        map.on("zoom", function (e) {
            that.element.innerHTML = `${that.options.prefix} ${map.getZoom().toFixed(that.options.fractionDigits)}`;
        });
        return that.element;
    }

    onRemove(map: mapboxgl.Map): void {
        this.element.remove();
    }

    getDefaultPosition(): string { return this.options.defaultPosition! };
}