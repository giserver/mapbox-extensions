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
}

/**
 * 实时显示鼠标所在位置的经纬度
 */
export class LocationControl implements mapboxgl.IControl {

    readonly element = dom.createHtmlElement('div', ["jas-ctrl-location", "mapboxgl-ctrl"]);

    constructor(private options: LocationControlOptions = {}) {
        this.options.defaultPosition ??= "top-left";
        this.options.fractionDigits ??= 5;
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        let that = this;
        map.on("mousemove", function (e) {
            that.element.innerHTML = formatLocation(e.lngLat.lng, e.lngLat.lat, that.options.fractionDigits);
        });
        return that.element;
    }

    onRemove(map: mapboxgl.Map): void {
        this.element.remove();
    }

    getDefaultPosition(): string { return this.options.defaultPosition! };

}

function formatLocation(lng: any, lat: any, n?: number) {
    return `${lng > 0 ? "东经" : "西经"}：${Math.abs(lng).toFixed(n)}°&nbsp;&nbsp;${lat > 0 ? "北纬" : "南纬"}：${Math.abs(lat).toFixed(n ?? 5)}°`;
}