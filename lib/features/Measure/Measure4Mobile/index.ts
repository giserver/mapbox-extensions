import mapboxgl from 'mapbox-gl'
import { createHtmlElement } from '../../../utils';
import MeasureBase from './MeasureBase';
import MeasureLineString from './MeasureLineString';
import MeasurePolygon from './MeasurePolygon';
import SvgBuilder from '../../../svg';

export type MeasureType = 'LineString' | 'Polygon';

export interface Measure4MobileOptions {
    show?: boolean;
    measureActiveColor?: string;
    defaultType?: MeasureType
}

interface MeasureConfig {
    measure: MeasureBase,
    measureDiv: HTMLDivElement
}

export class MeasureMobileUIBase {

    protected currentMeasure: MeasureBase | undefined;
    readonly measuresMap = new Map<MeasureType, MeasureConfig>();

    private crosshairDiv: HTMLElement;
    private operationDiv: HTMLElement;

    /**
     *
     */
    constructor(protected map:mapboxgl.Map, private operationContainer: HTMLElement, private crosshairContainer: HTMLElement) {
        this.operationDiv = this.createOperationUI();
        operationContainer.append(this.operationDiv);
        this.crosshairDiv = this.createCrosshairUI();
        crosshairContainer.append(this.crosshairDiv);
    }

    private createOperationUI() {
        const operationDiv = createHtmlElement('div', 'jas-ctrl-measure-mobile-operation');

        const revokeDiv = createHtmlElement('div', "jas-ctrl-measure-mobile-operation-item", "jas-ctrl-measure-mobile-operation-btn");
        revokeDiv.innerHTML = new SvgBuilder('revoke').create();
        revokeDiv.innerHTML += `<div>撤销</div>`;
        revokeDiv.addEventListener('click', () => {
            this.currentMeasure?.revokePoint();
        });

        const finishDiv = createHtmlElement('div', "jas-ctrl-measure-mobile-operation-item", "jas-ctrl-measure-mobile-operation-btn");
        finishDiv.innerHTML = new SvgBuilder('finish').create();
        finishDiv.innerHTML += `<div>完成</div>`;
        finishDiv.addEventListener('click', () => {
            this.currentMeasure?.finish();
        })

        const addPointDiv = createHtmlElement('div', "jas-ctrl-measure-mobile-operation-item", "jas-ctrl-measure-mobile-operation-add-point", "jas-flex-center");
        addPointDiv.innerHTML = "<div>定点</div>"
        addPointDiv.addEventListener('click', () => {
            this.currentMeasure?.addPoint(this.getCurrentPosition(this.map));
        })

        operationDiv.appendChild(revokeDiv);
        operationDiv.appendChild(addPointDiv);
        operationDiv.appendChild(finishDiv);

        return operationDiv;
    }

    private createCrosshairUI() {
        const div = createHtmlElement('div', "jas-ctrl-measure-mobile-crosshair");
        div.innerHTML = new SvgBuilder('crosshair').create();
        return div;
    }

    show(value: boolean) {
        if (value) {
            this.crosshairContainer.append(this.crosshairDiv);
            this.operationContainer.append(this.operationDiv);
            this.currentMeasure?.start();
        } else {
            this.crosshairContainer.removeChild(this.crosshairDiv);
            this.operationContainer.removeChild(this.operationDiv);
            this.currentMeasure?.finish();
            this.currentMeasure?.stop();
        }
    }

    clear() {
        this.measuresMap.forEach(v => {
            v.measure.clear();
        })
    }

    changeMeasureType(type: MeasureType) {
        const { measure, measureDiv } = this.measuresMap.get(type)!;
        this.currentMeasure?.finish();
        this.currentMeasure?.stop();
        this.currentMeasure = measure;
        this.currentMeasure.start();

        // UI 选择背景颜色变换
        this.measuresMap.forEach(x => {
            x.measureDiv.style.backgroundColor = "";
        })

        measureDiv.style.backgroundColor = "rgb(211,211,211)";
    }

    getCurrentPosition(map: mapboxgl.Map) {
        const x = this.crosshairDiv.getBoundingClientRect().left + this.crosshairDiv.clientWidth / 2 - map.getContainer().getBoundingClientRect().left;
        const y = this.crosshairDiv.getBoundingClientRect().top + this.crosshairDiv.clientHeight / 2 - map.getContainer().getBoundingClientRect().top;

        return map.unproject([x, y]);
    }

    onRemove(){
        this.crosshairDiv.remove();
        this.operationDiv.remove();

        this.currentMeasure?.stop();
        this.measuresMap.forEach(m=>{
            m.measure.remove();
        });
    }
}

export default class Measure4Mobile extends MeasureMobileUIBase {

    //#region svg icons

    private readonly img_polygon = `<svg t="1659591707587" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1188" width="20" height="20">
    <g fill="none" stroke="black">
        <path stroke-width="18" d="M898.56 284.672c15.36 0 27.648-12.288 27.648-27.136V126.976c0-15.36-12.288-27.648-27.648-27.648H768c-15.36 0-27.648 12.288-27.648 27.648v29.696H286.208v-29.696c0-15.36-12.288-27.648-27.648-27.648H128c-15.36 0-27.648 12.288-27.648 27.648v130.048c0 15.36 12.288 27.648 27.648 27.648h31.744v452.096H128c-15.36 0-27.648 12.288-27.648 27.648v130.56c0 15.36 12.288 27.648 27.648 27.648h130.56c14.848 0 27.136-12.288 27.648-27.648v-33.28h454.144v33.28c0 15.36 12.288 27.648 27.648 27.648h130.56c15.36 0 27.648-12.288 27.648-27.648v-130.56c0-15.36-12.288-27.648-27.648-27.648H865.28V284.672h33.28zM155.648 229.376V154.112h75.264v75.264H155.648z m75.264 637.952H155.648v-75.264h75.264v75.264z m509.44-102.912v33.28H286.208v-33.28c0-15.36-12.288-27.648-27.648-27.648h-34.816V284.672h34.816c14.848 0 27.136-12.288 27.648-27.136v-36.864h454.144v36.352c0 15.36 12.288 27.648 27.648 27.648h33.28v452.096H768c-15.36 0-27.648 12.288-27.648 27.648z m130.56 27.648v75.264h-75.264v-75.264h75.264zM795.648 229.376V154.112h75.264v75.264h-75.264z" fill="#333333" p-id="1189"></path>
        <path stroke-width="18" d="M680.96 383.488c17.92-8.192 47.616-21.504 56.832-50.176 4.608-14.336 2.56-30.72-5.632-44.544-8.192-13.824-20.992-23.552-35.84-26.624-27.648-6.144-54.784 8.704-68.096 35.84-4.608 9.728-1.024 20.992 8.704 25.6 9.728 4.608 20.992 1.024 25.6-8.704 5.632-11.776 15.36-17.408 25.6-15.36 5.632 1.536 9.216 6.144 10.752 8.704 3.072 4.608 3.584 10.24 2.56 13.824-3.584 11.264-20.48 19.968-35.84 26.624-32.256 14.336-35.328 57.344-35.328 61.952-0.512 5.12 1.536 10.24 5.12 13.824 3.584 4.096 8.704 6.144 13.824 6.144h70.656c10.24 0 18.944-9.216 18.944-19.456s-8.192-18.944-18.944-18.944h-46.592c2.048-3.584 4.608-7.168 7.68-8.704zM516.096 377.344H355.328c-13.824 0-24.576 11.264-24.576 24.576v242.688c0 13.824 11.264 24.576 24.576 24.576 13.824 0 24.576-11.264 24.576-24.576V426.496h70.144v217.6c0 13.824 11.264 24.576 24.576 24.576 13.824 0 24.576-10.752 24.576-24.576V426.496h16.896c16.896 0 29.184 3.584 36.352 10.752 10.24 10.24 10.24 29.184 10.24 40.448v166.4c0 13.824 11.264 24.576 24.576 24.576 13.312 0 24.576-10.752 24.576-25.088V477.696c0-16.384 0-50.176-24.576-75.264-16.896-16.384-40.448-25.088-71.168-25.088z" fill="#333333" p-id="1190"></path>
    </g></svg>`;
    private readonly img_line = `<svg t="1659590346220" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="745" width="20" height="20">
    <g fill="none" stroke="black">
    <path stroke-width="20" d="M413.583 452.419L363.1 503.368l27.576 27.576a35.548 35.548 0 0 0 50.484 0 35.548 35.548 0 0 0 0-50.483l-27.577-28.042z m-91.146 91.15l-50.483 50.484 27.576 27.576a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.483l-27.576-27.576z m-91.146 91.147L180.808 685.2l27.576 27.577a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.484l-27.576-27.576zM687.022 178.98l-50.483 50.483 27.576 27.576a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.483l-27.576-27.576zM504.73 361.272l-50.484 50.95 27.577 27.576a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.483l-27.576-28.043z" fill="#333333" p-id="746"></path>
    <path stroke-width="20" d="M959.995 279.946L747.786 67.738a35.548 35.548 0 0 0-50.483 0L64.425 700.62a35.548 35.548 0 0 0 0 50.483l211.743 211.743a35.548 35.548 0 0 0 50.483 0l633.344-632.423c13.553-14.023 13.553-36.46 0-50.478zM301.87 887.122l-161.26-161.26 35.523-35.522 146.77-146.77 40.663-40.663 50.483-50.483 40.663-40.663 50.484-50.484 40.663-40.663 50.483-50.483 40.663-40.663 50.483-50.483 35.523-35.523 160.793 161.726L301.87 887.122z" fill="#333333" p-id="747"></path>
    <path stroke-width="20" d="M595.876 270.126l-50.483 50.483 27.576 27.577a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.484l-27.576-27.576z" fill="#333333" p-id="748"></path>
    </g></svg>`;
    private readonly img_clean = `<svg t="1659591688886" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1015" width="20" height="20">
    <g fill="none" stroke="black">
    <path stroke-width="40" d="M722.53 278.1V100.49H290V278.1H98.72v43H928v-43zM333 143.49h346.53V278.1H333zM780.8 883.35H231.71V383.89h-43v542.46H823.8V392.79h-43v490.56z" p-id="1016"></path>
    <path stroke-width="40" d="M391.52 383.79h43V773.5h-43zM578 383.79h43V773.5h-43z" p-id="1017"></path>
    </g></svg>`;

    //#endregion

    readonly show: (value: boolean) => void;

    /**
     * 
     * @param map mapboxgl map instance
     * @param container dom whitch ui insert into
     * @param show init show ui (default flase)
     */
    constructor(map: mapboxgl.Map, container: string | HTMLElement, options: Measure4MobileOptions = {}) {
        options.show ??= false;
        options.measureActiveColor ??= "rgb(211,211,211)";
        options.defaultType ??= "LineString";

        const parentDiv = typeof container === "string" ? document.getElementById(container)! : container;
        const containerWapper = createHtmlElement('div');

        super(map,containerWapper, containerWapper);

        containerWapper.append(this.createMeasureSwitchUI());
        parentDiv.append(containerWapper)

        this.show = (value: boolean) => {
            this.measuresMap.forEach(v => {
                v.measure.clear();
            })

            containerWapper.style.display = value ? '' : 'none';

            if (value)
                this.changeMeasureType(options.defaultType!);
        }

        this.show(options.show);
    }

    private createMeasureSwitchUI() {

        const measureSwitchDiv = createHtmlElement('div', "jas-ctrl-measure-mobile-switch");

        const measureLineStringDiv = createHtmlElement('div', "jas-ctrl-measure-mobile-switch-item");
        measureLineStringDiv.innerHTML = this.img_line;
        measureLineStringDiv.addEventListener('click', () => {
            this.changeMeasureType('LineString');
        });
        this.measuresMap.set('LineString', {
            measure: new MeasureLineString(this.map),
            measureDiv: measureLineStringDiv
        });

        const measurePolygonDiv = createHtmlElement('div', "jas-ctrl-measure-mobile-switch-item");
        measurePolygonDiv.innerHTML = this.img_polygon;
        measurePolygonDiv.addEventListener('click', () => {
            this.changeMeasureType('Polygon');
        });
        this.measuresMap.set('Polygon', {
            measure: new MeasurePolygon(this.map),
            measureDiv: measurePolygonDiv
        });

        const clearDiv = createHtmlElement('div', "jas-ctrl-measure-mobile-switch-item");
        clearDiv.innerHTML = this.img_clean;
        clearDiv.addEventListener('click', () => {
            this.clear();
        })

        measureSwitchDiv.appendChild(measureLineStringDiv);
        measureSwitchDiv.appendChild(measurePolygonDiv);
        measureSwitchDiv.appendChild(clearDiv);

        return measureSwitchDiv;
    }
}

