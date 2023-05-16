import mapboxgl from "mapbox-gl";
import * as turf from '@turf/turf';
import MeasureBase, { MeasureType } from "../features/Measure/MeasureBase";
import MeasurePoint, { MeasurePointOptions } from "../features/Measure/MeasurePoint";
import MeasureLineString, { MeasureLineStringOptions } from "../features/Measure/MeasureLineString";
import MeasurePolygon, { MeasurePolygonOptions } from "../features/Measure/MeasurePolygon";
import { copyToClipboard, createHtmlElement } from "../utils";
import svgs from '../svg';

export interface MeasureControlOptions {

    /**
     * 控件是否横置(default false)
     */
    horizontal?: boolean;

    /**
     * 按钮背景颜色
     */
    btnBgColor?: string;

    /**
     * 按钮激活颜色
     */
    btnActiveColor?: string;

    /**
     * 图形是否可以点击
     */
    geometryClick?: boolean;

    /**
     * 允许的测量模式，默认所有
     */
    enableModes?: MeasureType[];

    /**
     * 删除feature回调
     */
    onFeatureDelete?: (id: string) => void;

    /**
     * 复制完成
     */
    onGeometryCopy?: (geometry: string) => void;

    onStart?: () => void;
    onStop?: () => void;

    /** 
     * 测量点选项
     */
    measurePointOptions?: MeasurePointOptions;

    /**
     * 测量线选项
     */
    measureLineStringOptions?: MeasureLineStringOptions;

    /**
     * 测量面选项
     */
    measurePolygonOptions?: MeasurePolygonOptions;
}

export default class MeasureControl implements mapboxgl.IControl {

    private measures = new Map<MeasureType, { measure: MeasureBase, svg: string, controlElement?: HTMLElement | undefined }>();
    private currentMeasure: MeasureBase | undefined;
    private popup = new mapboxgl.Popup({ closeButton: false, className: 'jas-mapbox-popup' });

    constructor(private options: MeasureControlOptions = {}) {
        options.horizontal ??= false;

        options.horizontal ??= false;
        options.btnBgColor ??= "#ffffff";
        options.btnActiveColor ??= '#ddd';
        options.enableModes ??= ['Point', 'LineString', 'Polygon'];
        options.geometryClick ??= false;
        options.measurePointOptions ??= {};
        options.measureLineStringOptions ??= {};
        options.measurePolygonOptions ??= {};
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

    onAdd(map: mapboxgl.Map): HTMLElement {
        this.measures.set('Point', { measure: new MeasurePoint(map, this.options.measurePointOptions), svg: svgs.point });
        this.measures.set('LineString', { measure: new MeasureLineString(map, this.options.measureLineStringOptions), svg: svgs.line });
        this.measures.set('Polygon', { measure: new MeasurePolygon(map, this.options.measurePolygonOptions), svg: svgs.polygon });

        this.measures.forEach((_, k) => {
            if (this.options.enableModes?.indexOf(k) === -1)
                this.measures.delete(k);
        })

        const div = createHtmlElement('div', "jas-ctrl-measure", "mapboxgl-ctrl", "mapboxgl-ctrl-group", this.options.horizontal ? "hor" : "ver");

        this.measures.forEach((value, key) => {
            const btn = this.createButton(value.svg, this.createClickMeasureButtonHandler(map, key));
            value.controlElement = btn;
            div.append(btn);
        })

        div.append(this.createButton(svgs.clean, () => {
            this.measures.forEach(m => m.measure.clear());
        }));

        return div;
    }

    onRemove(map: mapboxgl.Map): void {
        this.stop();
        this.measures.forEach(m => m.measure.destroy());
    }

    getDefaultPosition?: (() => string) | undefined;

    stop() {
        if (this.currentMeasure) {
            const type = this.currentMeasure.type;

            // 停止测量
            this.currentMeasure.stop();
            // 颜色恢复默认
            this.measures.get(this.currentMeasure.type)!.controlElement!.style.background = this.options.btnBgColor!

            this.currentMeasure = undefined;

            return type;
        }
    }

    private createClickMeasureButtonHandler(map: mapboxgl.Map, measureType: MeasureType) {
        return () => {

            // 停止测量 如果当前测量类型按钮再次点击 则取消测量
            if (this.stop() === measureType) {
                this.changeGeometryEvent(map, true);
                this.options.onStop?.call(this);
                return;
            }

            this.options.onStart?.call(this);
            this.changeGeometryEvent(map, false);

            // 根据类型获取测量模式
            // 将这个测量模式的按钮设置为激活状态样式
            // 设置当前的测量模式
            // 测量开始
            const measureProps = this.measures.get(measureType)!;
            measureProps.controlElement!.style.background = this.options.btnActiveColor!;
            this.currentMeasure = measureProps.measure;
            this.currentMeasure?.start();
        }
    }

    private createButton(svg: string, onclick: () => void) {
        const div = createHtmlElement('div', 'jas-btn-hover', 'jas-flex-center', 'jas-ctrl-measure-item');
        div.innerHTML += svg;
        div.onclick = onclick;
        return div;
    }

    private changeGeometryEvent(map: mapboxgl.Map, on: boolean) {
        if (!this.options.geometryClick)
            return;

        this.measures.forEach(mp => {
            if (on) {
                map.on('mouseover', mp.measure.layerGroup.layerIds, this.geometryMouseoverHandler);
                map.on('mouseout', mp.measure.layerGroup.layerIds, this.geometryMouseoutHandler);
                map.on('click', mp.measure.layerGroup.layerIds, this.geometryClickHandler);
            } else {
                this.popup.remove();
                map.off('mouseover', mp.measure.layerGroup.layerIds, this.geometryMouseoverHandler);
                map.off('mouseout', mp.measure.layerGroup.layerIds, this.geometryMouseoutHandler);
                map.off('click', mp.measure.layerGroup.layerIds, this.geometryClickHandler);
            }
        });
    }

    private geometryMouseoverHandler = (ev: mapboxgl.MapLayerEventType['mouseover'] & mapboxgl.EventData) => {
        ev.target.getCanvas().style.cursor = "pointer";
    };

    private geometryMouseoutHandler = (ev: mapboxgl.MapLayerEventType['mouseout'] & mapboxgl.EventData) => {
        ev.target.getCanvas().style.cursor = "grab";
    }

    private geometryClickHandler = (ev: mapboxgl.MapLayerEventType['click'] & mapboxgl.EventData) => {
        const feature = ev.features?.at(0);
        if (!feature) return;

        try {
            this.measures.forEach(mp => {
                const pf = mp.measure.getFeatrue(feature.properties!['id'].toString());
                if (pf) {
                    const center = turf.center(pf.geometry as turf.AllGeoJSON).geometry.coordinates;
                    this.popup.setHTML(`<div style="display:flex;align-items:center;">
                                                <div id="popup-btn-copy" class='jas-ctrl' style="margin:0 5px 0 0;cursor:pointer;">${svgs.copy}</div>
                                                <div id="popup-btn-clean" class='jas-ctrl' style="cursor:pointer;">${svgs.clean}</div>
                                            </div>`).setLngLat(ev.lngLat).addTo(ev.target);

                    const copyBtn = document.getElementById("popup-btn-copy")!;
                    const cleanBtn = document.getElementById("popup-btn-clean")!;

                    copyBtn.addEventListener('click', e => {
                        const geometry = JSON.stringify(pf.geometry);
                        this.options.onGeometryCopy?.call(this, geometry);
                        copyToClipboard(geometry);
                    });

                    cleanBtn.addEventListener('click', e => {
                        const id = pf.id!.toString();
                        mp.measure.deleteFeature(id);
                        this.popup.remove();
                        this.options.onFeatureDelete?.call(this, id);
                    });

                    ev.target.flyTo({ center: [center[0], center[1]] });
                    throw new Error("break");
                }
            });
        } catch (error) {

        }
    }
}