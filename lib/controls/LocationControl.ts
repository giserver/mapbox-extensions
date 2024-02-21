import mapboxgl from "mapbox-gl";
import { dom } from 'wheater';

export interface LocationControlOptions {
    /**
     * 控件默认位置
     */
    defaultPosition?: string;
    /**
     * 经纬度保留的小数位数
     */
    fractionDigits?: number;
    /**
     * 经度显示文本前缀
     */
    lngPrefix?: string;
    /**
     * 纬度显示文本前缀
     */
    latPrefix?: string;
}

/**
 * 位置控件：实时显示鼠标所在位置的经纬度
 */
export class LocationControl implements mapboxgl.IControl {

    readonly element = dom.createHtmlElement('div', ["jas-ctrl-location", "mapboxgl-ctrl"]);

    constructor(private options: LocationControlOptions = {}) {
        this.options.defaultPosition ??= "top-left";
        this.options.fractionDigits ??= 5;
        this.options.lngPrefix ??= "经度";
        this.options.latPrefix ??= "纬度";
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        let that = this;
        map.on("mousemove", function (e) {
            let lng = e.lngLat.lng;
            let lat = e.lngLat.lat;
            that.element.innerHTML = `${that.options.lngPrefix} ${Math.abs(lng).toFixed(that.options.fractionDigits)}° ${lng > 0 ? "E" : "W"}&nbsp;&nbsp;${that.options.latPrefix} ${Math.abs(lat).toFixed(that.options.fractionDigits)}° ${lat > 0 ? "N" : "S"}`;
        });
        return that.element;
    }

    onRemove(map: mapboxgl.Map): void {
        this.element.remove();
    }

    getDefaultPosition(): string { return this.options.defaultPosition! };

}