import { IControl, Map } from "mapbox-gl";
import { MeasureBase, MeasureLineString, MeasureLineStringOptions, MeasurePoint, MeasurePointOptions, MeasurePolygon, MeasurePolygonOptions, MeasureType } from "../features/meature";
import { Dict } from "../features/utils";

export interface MeasureControlOptions {

    /**
     * 按钮背景颜色
     */
    btnBgColor?: string

    /**
     * 按钮激活颜色
     */
    btnActiveColor?: string

    /**
     * 图标hover颜色
     */
    svgHoverColor?: string

    /**
     * 允许的测量模式，默认所有
     */
    enableModes?: MeasureType[]

    /** 
     * 测量点选项
     */
    measurePointOptions?: MeasurePointOptions

    /**
     * 测量线选项
     */
    measureLineStringOptions?: MeasureLineStringOptions

    /**
     * 测量面选项
     */
    measurePolygonOptions?: MeasurePolygonOptions
}

export default class MeasureControl implements IControl {

    private polygon = `<svg t="1659591707587" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1188" width="20" height="20"><path d="M898.56 284.672c15.36 0 27.648-12.288 27.648-27.136V126.976c0-15.36-12.288-27.648-27.648-27.648H768c-15.36 0-27.648 12.288-27.648 27.648v29.696H286.208v-29.696c0-15.36-12.288-27.648-27.648-27.648H128c-15.36 0-27.648 12.288-27.648 27.648v130.048c0 15.36 12.288 27.648 27.648 27.648h31.744v452.096H128c-15.36 0-27.648 12.288-27.648 27.648v130.56c0 15.36 12.288 27.648 27.648 27.648h130.56c14.848 0 27.136-12.288 27.648-27.648v-33.28h454.144v33.28c0 15.36 12.288 27.648 27.648 27.648h130.56c15.36 0 27.648-12.288 27.648-27.648v-130.56c0-15.36-12.288-27.648-27.648-27.648H865.28V284.672h33.28zM155.648 229.376V154.112h75.264v75.264H155.648z m75.264 637.952H155.648v-75.264h75.264v75.264z m509.44-102.912v33.28H286.208v-33.28c0-15.36-12.288-27.648-27.648-27.648h-34.816V284.672h34.816c14.848 0 27.136-12.288 27.648-27.136v-36.864h454.144v36.352c0 15.36 12.288 27.648 27.648 27.648h33.28v452.096H768c-15.36 0-27.648 12.288-27.648 27.648z m130.56 27.648v75.264h-75.264v-75.264h75.264zM795.648 229.376V154.112h75.264v75.264h-75.264z" fill="#333333" p-id="1189"></path><path d="M680.96 383.488c17.92-8.192 47.616-21.504 56.832-50.176 4.608-14.336 2.56-30.72-5.632-44.544-8.192-13.824-20.992-23.552-35.84-26.624-27.648-6.144-54.784 8.704-68.096 35.84-4.608 9.728-1.024 20.992 8.704 25.6 9.728 4.608 20.992 1.024 25.6-8.704 5.632-11.776 15.36-17.408 25.6-15.36 5.632 1.536 9.216 6.144 10.752 8.704 3.072 4.608 3.584 10.24 2.56 13.824-3.584 11.264-20.48 19.968-35.84 26.624-32.256 14.336-35.328 57.344-35.328 61.952-0.512 5.12 1.536 10.24 5.12 13.824 3.584 4.096 8.704 6.144 13.824 6.144h70.656c10.24 0 18.944-9.216 18.944-19.456s-8.192-18.944-18.944-18.944h-46.592c2.048-3.584 4.608-7.168 7.68-8.704zM516.096 377.344H355.328c-13.824 0-24.576 11.264-24.576 24.576v242.688c0 13.824 11.264 24.576 24.576 24.576 13.824 0 24.576-11.264 24.576-24.576V426.496h70.144v217.6c0 13.824 11.264 24.576 24.576 24.576 13.824 0 24.576-10.752 24.576-24.576V426.496h16.896c16.896 0 29.184 3.584 36.352 10.752 10.24 10.24 10.24 29.184 10.24 40.448v166.4c0 13.824 11.264 24.576 24.576 24.576 13.312 0 24.576-10.752 24.576-25.088V477.696c0-16.384 0-50.176-24.576-75.264-16.896-16.384-40.448-25.088-71.168-25.088z" fill="#333333" p-id="1190"></path></svg>`;
    private line = `<svg t="1659590346220" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="745" width="20" height="20"><path d="M413.583 452.419L363.1 503.368l27.576 27.576a35.548 35.548 0 0 0 50.484 0 35.548 35.548 0 0 0 0-50.483l-27.577-28.042z m-91.146 91.15l-50.483 50.484 27.576 27.576a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.483l-27.576-27.576z m-91.146 91.147L180.808 685.2l27.576 27.577a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.484l-27.576-27.576zM687.022 178.98l-50.483 50.483 27.576 27.576a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.483l-27.576-27.576zM504.73 361.272l-50.484 50.95 27.577 27.576a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.483l-27.576-28.043z" fill="#333333" p-id="746"></path><path d="M959.995 279.946L747.786 67.738a35.548 35.548 0 0 0-50.483 0L64.425 700.62a35.548 35.548 0 0 0 0 50.483l211.743 211.743a35.548 35.548 0 0 0 50.483 0l633.344-632.423c13.553-14.023 13.553-36.46 0-50.478zM301.87 887.122l-161.26-161.26 35.523-35.522 146.77-146.77 40.663-40.663 50.483-50.483 40.663-40.663 50.484-50.484 40.663-40.663 50.483-50.483 40.663-40.663 50.483-50.483 35.523-35.523 160.793 161.726L301.87 887.122z" fill="#333333" p-id="747"></path><path d="M595.876 270.126l-50.483 50.483 27.576 27.577a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.484l-27.576-27.576z" fill="#333333" p-id="748"></path></svg>`;
    private point = `<svg t="1659591725628" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1369" width="20" height="20"><path d="M512 427.023m-90 0a90 90 0 1 0 180 0 90 90 0 1 0-180 0Z" fill="" p-id="1370"></path><path d="M512 910.402c-19.14 0-37.482-5.854-53.042-16.929-14.063-10.01-24.926-23.596-31.589-39.46L255.043 585.177l-0.154-0.25C225.522 537.209 210 482.605 210 427.021c0-80.667 31.414-156.506 88.454-213.546S431.333 125.021 512 125.021s156.506 31.414 213.546 88.454C782.587 270.515 814 346.354 814 427.021c0 55.849-15.655 110.671-45.274 158.539l-0.264 0.419-172.081 268.716c-6.755 15.726-17.66 29.176-31.704 39.055-15.485 10.895-33.7 16.652-52.677 16.652zM309.246 551.141l175.494 273.78 1.194 3.197c4.149 11.107 14.381 18.284 26.066 18.284 11.584 0 21.791-7.071 26.004-18.015l1.165-3.028L714.43 551.678C737.701 513.983 750 470.884 750 427.021c0-63.572-24.756-123.339-69.709-168.292-44.952-44.951-104.719-69.708-168.291-69.708s-123.339 24.756-168.292 69.708S274 363.449 274 427.021c0 43.64 12.186 86.552 35.246 124.12z" fill="#333333" p-id="1371"></path></svg>`;
    private clean = `<svg t="1659591688886" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1015" width="20" height="20"><path fill="#333333" d="M722.53 278.1V100.49H290V278.1H98.72v43H928v-43zM333 143.49h346.53V278.1H333zM780.8 883.35H231.71V383.89h-43v542.46H823.8V392.79h-43v490.56z" p-id="1016"></path><path fill="#333333" d="M391.52 383.79h43V773.5h-43zM578 383.79h43V773.5h-43z" p-id="1017"></path></svg>`;

    private measures = new Dict<MeasureType, { measure: MeasureBase, svg: string, controlElement?: HTMLElement | undefined }>();
    private currentMeasure: MeasureBase | undefined;

    private btnBgColor: string;
    private btnActiveColor: string;
    private svgHoverColor: string;
    private enableModes?: MeasureType[];
    public measurePointOptions: MeasurePointOptions
    public measureLineStringOptions: MeasureLineStringOptions
    public measurePolygonOptions: MeasurePolygonOptions

    constructor(options?: MeasureControlOptions) {
        this.btnBgColor = options?.btnBgColor || "#ffffff";
        this.btnActiveColor = options?.btnActiveColor || "#7F7F7F";
        this.svgHoverColor = options?.svgHoverColor || "#8A2BE2";
        this.enableModes = options?.enableModes || ['Point', 'LineString', 'Polygon']
        this.measurePointOptions = options?.measurePointOptions || new MeasurePointOptions();
        this.measureLineStringOptions = options?.measureLineStringOptions || new MeasureLineStringOptions();
        this.measurePolygonOptions = options?.measurePolygonOptions || new MeasurePolygonOptions();
    }

    get isDrawing() {
        return this.currentMeasure !== undefined;
    }

    get layerIds() {
        let ids = new Array<string>();
        this.measures.forEach(m => {
            ids = ids.concat(m.measure.layerGroup.layerIds);
        })
        return ids;
    }

    stop() {
        if (this.currentMeasure) {
            const type = this.currentMeasure.type;

            // 停止测量
            this.currentMeasure.stop();
            // 颜色恢复默认
            this.measures.get(this.currentMeasure.type)!.controlElement!.style.background = this.btnBgColor!

            this.currentMeasure = undefined;

            return type;
        }
    }

    onAdd(map: Map): HTMLElement {
        this.measures.set('Point', { measure: new MeasurePoint(map, this.measurePointOptions), svg: this.point });
        this.measures.set('LineString', { measure: new MeasureLineString(map, this.measureLineStringOptions), svg: this.line });
        this.measures.set('Polygon', { measure: new MeasurePolygon(map, this.measurePolygonOptions), svg: this.polygon });

        this.measures.forEach((_, k) => {
            if (this.enableModes?.indexOf(k) === -1)
                this.measures.delete(k);
        })

        const div = document.createElement('div');
        div.style.pointerEvents = 'auto';

        const createClickMeasureButtonHandler = (measureType: MeasureType) => {
            return () => {

                // 停止测量 如果当前测量类型按钮再次点击 则取消测量
                if (this.stop() === measureType)
                    return;

                // 根据类型获取测量模式
                // 将这个测量模式的按钮设置为激活状态样式
                // 设置当前的测量模式
                // 测量开始
                const measureProps = this.measures.get(measureType)!;
                measureProps.controlElement!.style.background = this.btnActiveColor!;
                this.currentMeasure = measureProps.measure;
                this.currentMeasure?.start();
            }
        }

        this.measures.forEach((value, key) => {
            const btn = this.createButton(value.svg, createClickMeasureButtonHandler(key));
            value.controlElement = btn;
            div.append(btn);
        })

        div.append(this.createButton(this.clean, () => {
            this.measures.forEach(m => m.measure.clear());
        }));
        return div;
    }

    onRemove(map: Map): void {
        this.measures.forEach(m => m.measure.destroy());
    }

    getDefaultPosition?: (() => string) | undefined;

    private createButton(svg: string, onclick: () => (boolean | void)) {
        const div = document.createElement('div');
        div.id = "jas-measures";
        const style = div.style;
        style.display = 'flex';
        style.justifyContent = 'center';
        style.alignItems = 'center';
        style.background = this.btnBgColor;
        style.cursor = 'pointer';
        style.borderRadius = '4px';
        style.height = '29px';
        style.width = '29px';
        div.innerHTML += svg;
        div.onclick = (e) => {
            onclick();
        }

        const changeSvgColor = (color: string) => {
            const svg = div.children[0] as SVGElement;
            for (let i = 0; i < svg.children.length; i++) {
                const path = svg.children[i];
                const attr = path.attributes.getNamedItem("fill");
                if (attr)
                    attr.value = color;
            }
        }

        div.onmouseenter = e => {
            changeSvgColor(this.svgHoverColor);
        }

        div.onmouseleave = e => {
            changeSvgColor("#333333");
        }


        return div;
    }
}