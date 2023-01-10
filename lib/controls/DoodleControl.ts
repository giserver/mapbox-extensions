import { LineString, Polygon } from "@turf/turf";
import { EventData, GeoJSONSource, IControl, Map, MapEventType } from "mapbox-gl";

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
    onDrawed?(polygon: Polygon): void;

    /**
     * 清空当前绘制回调
     */
    onClear?(): void;

    /**
     * 退出绘制
     */
    onExit?(): void;
}

export default class DoodleControl implements IControl {

    private penImage = `<svg t="1672824007026" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2828" width="20" height="20">
    <path d="M745.76 369.86l-451 537.48a18.693 18.693 0 0 1-8.46 5.74l-136.58 45.27c-13.24 4.39-26.46-6.71-24.43-20.5l20.86-142.36c0.5-3.44 1.95-6.67 4.19-9.33l451-537.48c6.65-7.93 18.47-8.96 26.4-2.31l115.71 97.1c7.92 6.64 8.96 18.46 2.31 26.39zM894.53 192.56l-65.9 78.53c-6.65 7.93-18.47 8.96-26.4 2.31l-115.71-97.1c-7.93-6.65-8.96-18.47-2.31-26.4l65.9-78.53c6.65-7.93 18.47-8.96 26.4-2.31l115.71 97.1c7.93 6.65 8.96 18.47 2.31 26.4z" fill="#6C6D6E" p-id="2829">
    </path></svg>`

    private pencilImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAjRJREFUWEft1T2L1EAYB/D/kw0IVlaClSDY6FUKwnVXWYmFIAqC4MGBB4K6ZDILIu7BQZxJUFDBFxAURfHQ0k/gWyE2IldZiPgVLASZRwYmErPJ7exlwjZuFZLZ+f/yzJMZwpx/NOd8/AdMVEBrfR/ATmb+EEXRWyHE5z6X6R+A1voQgE+1wF8A3jHzGynlODSmqQK/AQyqQcy8ZsOLojiQJMlmSEQT4D2AxTKkGm6M2WDmlyEr0QS4AeCyBdTDARys3g9RiQlAURQnjDGv2sLrlemKmADkeb4bwKoQYs2uuS17+eb1sBLZBdG6EU0LD1WJVoBSakxE13zerkslttyKlVLrRHSlT8TUs0ApdZ2IpA+CiMa2d3zGlmOmAuxArXUOIPGZeNbl8ALYYKXUTSK6FBrhDXCI20R0ISRiJoBD3CWi8z4In56YGeAQD4hoxQNxNU3T9a3GbQvgGvMhgOW2yZk5lVLa5kWe5wtCiC9NY7cNcIjHAM7WJyaii0KIW/Z+lmWHB4PBE2beaDpFOwEc4imAM5WteVVKec+9+SIz2+f73PNzaZo+qoI7A1zQc2Y+DeBvQJZlS3EcP2PmPZXAb0Rkl+PnTBuRR7PZzepUmqYvXFWOArDXu+r/jaLoSJIkH4MDygmVUseJyB7hO5rgcRzvHw6HX3sDaK1t+MmmcGZ+LaU8FrwH6mFtCGPM3tFo9L13gOuDZSJacn2waYy5I6X8MfHJ+jRYn2OCfIZdgHMH/AFcQQ0wbeMD1AAAAABJRU5ErkJggg==`;

    private drawing = false;
    private div_doodle_switch: HTMLDivElement;
    private svg_doodle_switch: HTMLDivElement;
    private span_doodle_switch: HTMLSpanElement;

    private div_redraw: HTMLDivElement;

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

        this.div_doodle_switch = document.createElement('div');
        this.div_doodle_switch.className = "jas-ctrl mapboxgl-ctrl-group"
        let style = this.div_doodle_switch.style;
        style.pointerEvents = 'auto';
        style.cursor = 'pointer';
        style.display = 'flex';
        style.justifyContent = 'center';
        style.alignItems = 'center';
        style.height = '29px';
        style.padding = '0 5px'
        style.fontSize = '13px';
        style.fontWeight = '500';
        style.marginLeft = '10px';

        this.svg_doodle_switch = document.createElement('div');
        this.svg_doodle_switch.innerHTML = this.penImage;
        this.svg_doodle_switch.style.height = '20px';
        this.span_doodle_switch = document.createElement('span');
        this.span_doodle_switch.innerText = this.options.name!;

        this.div_doodle_switch.append(this.svg_doodle_switch);
        this.div_doodle_switch.append(this.span_doodle_switch);

        this.div_redraw = document.createElement('div');
        this.div_redraw.className = "jas-ctrl mapboxgl-ctrl-group";
        style = this.div_redraw.style;
        style.pointerEvents = 'auto';
        style.display = 'flex';
        style.justifyContent = 'center';
        style.alignItems = 'center';
        style.cursor = 'pointer';
        style.height = '29px';
        style.padding = '0 5px';
        style.fontSize = '13px';
        style.fontWeight = '500';

        this.div_redraw.innerHTML = `<span>${this.options.reName}</span>`;
        this.div_redraw.style.display = 'none';
    }

    onAdd(map: Map): HTMLElement {
        const div = document.createElement('div');
        div.className = "jas-ctrl-doodle mapboxgl-ctrl";
        div.style.display = 'flex'

        div.innerHTML = `<style>
            .jas-ctrl:hover{
                background-color : #ddd !important;
            }
        </style>`;

        const that = this;
        const currentLine: LineString = { type: 'LineString', coordinates: [] };
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

        function onMouseDown<T extends keyof MapEventType>(e: MapEventType[T] & EventData) {
            e.preventDefault();
            that.div_redraw.style.display = 'flex';

            const lnglat = [e.lngLat.lng, e.lngLat.lat];
            currentLine.coordinates.push(lnglat);
            updateDataSource();

            map.on('mousemove', onMouseMove);
            map.once('mouseup', onMouseUp);
        }

        function onMouseMove<T extends keyof MapEventType>(e: MapEventType[T] & EventData) {
            const lnglat = [e.lngLat.lng, e.lngLat.lat];
            currentLine.coordinates.push(lnglat);
            updateDataSource();
        }

        function onMouseUp<T extends keyof MapEventType>(e: MapEventType[T] & EventData) {
            map.getCanvas().style.cursor = '';
            const polygon = updateDataSource(true);
            map.off('mousemove', onMouseMove);

            if (that.options.onDrawed && polygon)
                that.options.onDrawed(polygon);
        }

        function updateDataSource(polygon: boolean = false) {
            if (polygon) {
                const polygon: Polygon = {
                    type: 'Polygon',
                    coordinates: currentLine.coordinates.length === 0 ? [] : [[...currentLine.coordinates, currentLine.coordinates[0]]]
                };

                (map.getSource('doodle-polygon') as GeoJSONSource).setData({
                    type: 'Feature', geometry: polygon, properties: {}
                });

                (map.getSource('doodle-line') as GeoJSONSource).setData({
                    type: 'Feature', geometry: {
                        type: 'LineString',
                        coordinates: currentLine.coordinates.length === 0 ? [] : [...currentLine.coordinates, currentLine.coordinates[0]]
                    }, properties: {}
                });

                currentLine.coordinates.length = 0;
                return polygon;
            } else {
                (map.getSource('doodle-line') as GeoJSONSource).setData({ type: 'Feature', geometry: currentLine, properties: {} });
            }
        }

        this.stop = () => {
            this.drawing = false;
            this.svg_doodle_switch.style.display = '';
            this.div_redraw.style.display = 'none';
            this.span_doodle_switch.innerText = `${this.options.name}`;

            canvas.style.cursor = ``;

            currentLine.coordinates.length = 0;
            updateDataSource(true);

            this.options.onClear?.call(this);
            this.options.onExit?.call(this);

            map.off('mousedown', onMouseDown);
        }

        this.div_doodle_switch.addEventListener('click', () => {

            // 当前正在绘制 退出绘制
            if (this.drawing) {
                this.stop();
            } else { // 开始绘制
                this.options.onStart?.call(this);

                this.svg_doodle_switch.style.display = 'none';
                this.span_doodle_switch.innerText = this.options.exitText!;
                canvas.style.cursor = `url("${that.pencilImage}"),auto`;

                map.once('mousedown', onMouseDown);
                this.drawing = true;
            }
        });

        /**
         * 重画
         */
        this.div_redraw.addEventListener('click', () => {
            that.div_redraw.style.display = 'none';
            canvas.style.cursor = `url("${that.pencilImage}"),auto`;
            currentLine.coordinates.length = 0;

            updateDataSource(true);

            this.options.onClear?.call(this);

            map.once('mousedown', onMouseDown);
        });

        div.append(this.div_redraw);
        div.append(this.div_doodle_switch);
        return div;
    }

    onRemove(map: Map): void {
    }

    getDefaultPosition?: (() => string) | undefined;
}