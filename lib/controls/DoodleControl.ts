import mapboxgl from "mapbox-gl";
import { dom } from 'wheater';
import { svg } from "../common";
import { Doodle, DoodleOptions } from "../features/doodle"

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
        const doodle = new Doodle(map, {
            "onStart": () => {
                this.options.onStart?.call(this);
                that.doodle_re_draw.style.display = 'flex';
            },
            "onDrawed": polygon => {
                that.options.onDrawed!(polygon)

            }
        });



        this.stop = () => {
            this.drawing = false;
            this.doodle_switch_svg.style.display = '';
            this.doodle_re_draw.style.display = 'none';
            this.doodle_switch_span.innerText = `${this.options.name}`;

            doodle.clear();
            doodle.stop();

            this.options.onClear?.call(this);
            this.options.onExit?.call(this);


        }

        this.doodle_switch_div.addEventListener('click', () => {

            // 当前正在绘制 退出绘制
            if (this.drawing) {
                this.stop();
            } else { // 开始绘制
                this.doodle_switch_svg.style.display = 'none';
                this.doodle_switch_span.innerText = this.options.exitText!;

                doodle.start()
                this.drawing = true;
            }
        });

        /**
         * 重画
         */
        this.doodle_re_draw.addEventListener('click', () => {
            if (doodle.drawing) return;
            that.doodle_re_draw.style.display = 'none';
            doodle.clear();
            doodle.start()
            this.options.onClear?.call(this);
        });

        this.element.append(this.doodle_re_draw);
        this.element.append(this.doodle_switch_div);
        return this.element;
    }

    onRemove(map: mapboxgl.Map): void {
        this.stop();

        this.element.remove();
    }

    getDefaultPosition?: (() => string) | undefined;
}