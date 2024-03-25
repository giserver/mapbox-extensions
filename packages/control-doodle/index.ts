import { dom } from 'wheater';
import { Doodle, DoodleOptions } from './doodle';

export interface DoodleControlOptions extends DoodleOptions {
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
    readonly element = dom.createHtmlElement('div', ["giserver-ctrl-doodle", "maplibregl-ctrl", "mapboxgl-ctrl"]);

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

        const onStart = this.options.onStart;
        this.options.onStart = () => {
            onStart?.();
            this.doodle_re_draw.style.display = 'flex';
        }

        this.doodle_switch_svg = dom.createHtmlElement('div', ["giserver-ctrl-doodle-switch-svg"], [], {
            onInit: e => {
                e.innerHTML = `<svg  width="20" height="20" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2828">
                <path d="M745.76 369.86l-451 537.48a18.693 18.693 0 0 1-8.46 5.74l-136.58 45.27c-13.24 4.39-26.46-6.71-24.43-20.5l20.86-142.36c0.5-3.44 1.95-6.67 4.19-9.33l451-537.48c6.65-7.93 18.47-8.96 26.4-2.31l115.71 97.1c7.92 6.64 8.96 18.46 2.31 26.39zM894.53 192.56l-65.9 78.53c-6.65 7.93-18.47 8.96-26.4 2.31l-115.71-97.1c-7.93-6.65-8.96-18.47-2.31-26.4l65.9-78.53c6.65-7.93 18.47-8.96 26.4-2.31l115.71 97.1c7.93 6.65 8.96 18.47 2.31 26.4z" fill="#6C6D6E" p-id="2829">
                </path></svg>`
            }
        });
        this.doodle_switch_span = dom.createHtmlElement('span', [], [this.options.name!]);

        this.doodle_switch_div = dom.createHtmlElement('div',
            ["flex-center", "giserver-ctrl-doodle-switch", "mapboxgl-ctrl-group", "maplibregl-ctrl-group"],
            [
                this.doodle_switch_svg,
                this.doodle_switch_span
            ]);

        this.doodle_re_draw = dom.createHtmlElement('div',
            ["flex-center", "mapboxgl-ctrl-group", "maplibregl-ctrl-group"],
            [dom.createHtmlElement('span', [], [this.options.reName])]);
        this.doodle_re_draw.style.display = 'none';

    }

    onAdd(map: mapboxgl.Map): HTMLElement {

        const that = this;
        const doodle = new Doodle(map, this.options);

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