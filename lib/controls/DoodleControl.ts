import mapboxgl from "mapbox-gl";
import { dom } from 'wheater';
import { svg } from "../common";

export interface DoodleControlOptions {
    /**
     * 名字(默认：画圈)
     */
    name?: string;

    /**
     * 重绘名字（默认 ：重画）
     */
    reName?: string;

    /**
     * 退出文字
     */
    exitText?: string;

    /**
     * 线颜色
     */
    lineColor?: string;

    /**
     * 线宽度
     */
    lineWidth?: number;

    /**
     * 多边形颜色
     */
    polygonColor?: string;

    /**
     * 多边形透明度
     */
    polygonOpacity?: number;

    onStart?(): void;

    /**
     * 绘制完成
     * @param polygon 绘制的多边形
     */
    onDrawed?(polygon: GeoJSON.Polygon): void;

    /**
     * 清空当前绘制回调
     */
    onClear?(): void;

    /**
     * 退出绘制
     */
    onExit?(): void;
}

export class DoodleControl implements mapboxgl.IControl {

    private pencilImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAjRJREFUWEft1T2L1EAYB/D/kw0IVlaClSDY6FUKwnVXWYmFIAqC4MGBB4K6ZDILIu7BQZxJUFDBFxAURfHQ0k/gWyE2IldZiPgVLASZRwYmErPJ7exlwjZuFZLZ+f/yzJMZwpx/NOd8/AdMVEBrfR/ATmb+EEXRWyHE5z6X6R+A1voQgE+1wF8A3jHzGynlODSmqQK/AQyqQcy8ZsOLojiQJMlmSEQT4D2AxTKkGm6M2WDmlyEr0QS4AeCyBdTDARys3g9RiQlAURQnjDGv2sLrlemKmADkeb4bwKoQYs2uuS17+eb1sBLZBdG6EU0LD1WJVoBSakxE13zerkslttyKlVLrRHSlT8TUs0ApdZ2IpA+CiMa2d3zGlmOmAuxArXUOIPGZeNbl8ALYYKXUTSK6FBrhDXCI20R0ISRiJoBD3CWi8z4In56YGeAQD4hoxQNxNU3T9a3GbQvgGvMhgOW2yZk5lVLa5kWe5wtCiC9NY7cNcIjHAM7WJyaii0KIW/Z+lmWHB4PBE2beaDpFOwEc4imAM5WteVVKec+9+SIz2+f73PNzaZo+qoI7A1zQc2Y+DeBvQJZlS3EcP2PmPZXAb0Rkl+PnTBuRR7PZzepUmqYvXFWOArDXu+r/jaLoSJIkH4MDygmVUseJyB7hO5rgcRzvHw6HX3sDaK1t+MmmcGZ+LaU8FrwH6mFtCGPM3tFo9L13gOuDZSJacn2waYy5I6X8MfHJ+jRYn2OCfIZdgHMH/AFcQQ0wbeMD1AAAAABJRU5ErkJggg==`;

    private drawing = false;
    readonly element = dom.createHtmlElement('div', ["jas-ctrl-doodle", "mapboxgl-ctrl"]);

    private doodle_switch_div: HTMLDivElement;
    private doodle_switch_svg: HTMLDivElement;
    private doodle_switch_span: HTMLSpanElement;

    private doodle_re_draw: HTMLDivElement;

    declare stop: () => void;

    /**
     *
     */
    constructor(private options: DoodleControlOptions = {}) {
        this.options.name ??= "画圈";
        this.options.reName ??= '重画';
        this.options.exitText ??= '退出画圈';
        this.options.lineColor ??= 'blue';
        this.options.lineWidth ??= 5;
        this.options.polygonColor ??= 'cyan';
        this.options.polygonOpacity ??= 0.5;

        this.doodle_switch_svg = dom.createHtmlElement('div', ["jas-ctrl-doodle-switch-svg"], [new svg.SvgBuilder('pen').create('svg')]);
        this.doodle_switch_span = dom.createHtmlElement('span', [], [this.options.name!]);

        this.doodle_switch_div = dom.createHtmlElement('div',
            ["jas-btn-hover", "jas-flex-center", "jas-ctrl-doodle-switch", "mapboxgl-ctrl-group"],
            [
                this.doodle_switch_svg,
                this.doodle_switch_span
            ]);

        this.doodle_re_draw = dom.createHtmlElement('div',
            ["jas-flex-center", "jas-btn-hover", "mapboxgl-ctrl-group"],
            [dom.createHtmlElement('span', [], [this.options.reName])]);
        this.doodle_re_draw.style.display = 'none';
    }

    onAdd(map: mapboxgl.Map): HTMLElement {

        const that = this;
        const currentLine: GeoJSON.LineString = { type: 'LineString', coordinates: [] };
        const canvas = map.getCanvas();

        map.addSource('doodle-line', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [],
                },
                properties: {}
            }
        })
        map.addSource('doodle-polygon', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [],
                },
                properties: {}
            }
        })
        map.addLayer({
            id: 'doodle-line',
            type: 'line',
            source: 'doodle-line',
            layout: {},
            paint: {
                "line-width": this.options.lineWidth,
                "line-color": this.options.lineColor
            }
        })

        map.addLayer({
            id: 'doodle-polygon',
            type: 'fill',
            source: 'doodle-polygon',
            layout: {},
            paint: {
                'fill-color': this.options.polygonColor,
                'fill-opacity': this.options.polygonOpacity
            }
        })

        function onMouseDown<T extends keyof mapboxgl.MapEventType>(e: mapboxgl.MapEventType[T] & mapboxgl.EventData) {
            e.preventDefault();
            that.doodle_re_draw.style.display = 'flex';

            const lnglat = [e.lngLat.lng, e.lngLat.lat];
            currentLine.coordinates.push(lnglat);
            updateDataSource();

            map.on('mousemove', onMouseMove);
            map.once('mouseup', onMouseUp);
        }

        function onMouseMove<T extends keyof mapboxgl.MapEventType>(e: mapboxgl.MapEventType[T] & mapboxgl.EventData) {
            const lnglat = [e.lngLat.lng, e.lngLat.lat];
            currentLine.coordinates.push(lnglat);
            updateDataSource();
        }

        function onMouseUp<T extends keyof mapboxgl.MapEventType>(e: mapboxgl.MapEventType[T] & mapboxgl.EventData) {
            map.getCanvas().style.cursor = '';
            const polygon = updateDataSource(true);
            map.off('mousemove', onMouseMove);

            if (that.options.onDrawed && polygon)
                that.options.onDrawed(polygon);
        }

        function updateDataSource(polygon: boolean = false) {
            if (polygon) {
                const polygon: GeoJSON.Polygon = {
                    type: 'Polygon',
                    coordinates: currentLine.coordinates.length === 0 ? [] : [[...currentLine.coordinates, currentLine.coordinates[0]]]
                };

                (map.getSource('doodle-polygon') as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature', geometry: polygon, properties: {}
                });

                (map.getSource('doodle-line') as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature', geometry: {
                        type: 'LineString',
                        coordinates: currentLine.coordinates.length === 0 ? [] : [...currentLine.coordinates, currentLine.coordinates[0]]
                    }, properties: {}
                });

                currentLine.coordinates.length = 0;
                return polygon;
            } else {
                (map.getSource('doodle-line') as mapboxgl.GeoJSONSource).setData({ type: 'Feature', geometry: currentLine, properties: {} });
            }
        }

        this.stop = () => {
            this.drawing = false;
            this.doodle_switch_svg.style.display = '';
            this.doodle_re_draw.style.display = 'none';
            this.doodle_switch_span.innerText = `${this.options.name}`;

            canvas.style.cursor = ``;

            currentLine.coordinates.length = 0;
            updateDataSource(true);

            this.options.onClear?.call(this);
            this.options.onExit?.call(this);

            map.off('mousedown', onMouseDown);
        }

        this.doodle_switch_div.addEventListener('click', () => {

            // 当前正在绘制 退出绘制
            if (this.drawing) {
                this.stop();
            } else { // 开始绘制
                this.options.onStart?.call(this);

                this.doodle_switch_svg.style.display = 'none';
                this.doodle_switch_span.innerText = this.options.exitText!;
                canvas.style.cursor = `url("${that.pencilImage}"),auto`;

                map.once('mousedown', onMouseDown);
                this.drawing = true;
            }
        });

        /**
         * 重画
         */
        this.doodle_re_draw.addEventListener('click', () => {
            that.doodle_re_draw.style.display = 'none';
            canvas.style.cursor = `url("${that.pencilImage}"),auto`;
            currentLine.coordinates.length = 0;

            updateDataSource(true);

            this.options.onClear?.call(this);

            map.once('mousedown', onMouseDown);
        });

        this.element.append(this.doodle_re_draw);
        this.element.append(this.doodle_switch_div);
        return this.element;
    }

    onRemove(map: mapboxgl.Map): void {
        this.stop();

        map.removeLayer("doodle-polygon");
        map.removeSource("doodle-polygon");

        map.removeLayer("doodle-line");
        map.removeSource("doodle-line");

        this.element.remove();
    }

    getDefaultPosition?: (() => string) | undefined;
}