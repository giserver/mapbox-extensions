import { createConfirmModal } from "../../modal";
import SvgBuilder from "../../svg";
import { createHtmlElement } from "../../utils";
import { array } from 'wheater';
import { MarkerFeatrueProperties, MarkerFeatureType, MarkerLayerProperties } from "./types";
import DrawManager from "./DrawMarker";
import mapboxgl from "mapbox-gl";

export default class MarkerManager {

    readonly htmlElement = createHtmlElement('div', 'jas-ctrl-marker');

    private readonly drawManger : DrawManager;
    private readonly pageLayer : HTMLDivElement;

    /**
     *
     */
    constructor(map:mapboxgl.Map) {
        this.pageLayer = new MarkerLayerContext({
            'type': 'FeatureCollection',
            'features': [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [1, 1]
                    },
                    properties: {
                        id: '1',
                        name: '标注1',
                        group_id: '1',
                        date: Date.now()
                    }
                }, {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[0, 0], [1, 1]]
                    },
                    properties: {
                        id: '2',
                        name: '标注2',
                        group_id: '1',
                        date: Date.now(),
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [1, 1]
                    },
                    properties: {
                        id: '3',
                        name: '标注3',
                        group_id: '1',
                        date: Date.now()
                    }
                }
            ]
        }, [{
            id: '1',
            name: '测试图层',
            date: Date.now(),
        }, {
            id: '2',
            name: '测试图层2',
            date: Date.now(),
        }]).htmlElementLayer;

        this.drawManger = new DrawManager(map,{
            onDrawFinish:(draw,flush)=>{
                console.log(draw.currentFeature);
                // flush();
            }
        })

        this.htmlElement.append(this.createHeader(), this.createDataContainer());
    }

    private createHeader() {
        const header = createHtmlElement('div', 'jas-ctrl-marker-header');
        header.append(this.createHeaderMenu(), this.createHeaderDrawBtn());
        return header;
    }

    private createDataContainer() {
        const container = createHtmlElement('div', 'jas-ctrl-marker-data');

        container.append(this.pageLayer);
        return container;
    }

    private createHeaderMenu() {

        const search = createHtmlElement('input');
        search.type = 'text'

        const c = createHtmlElement('div', "jas-flex-center", 'jas-ctrl-marker-menu');
        c.append(search);

        return c;
    }

    private createHeaderDrawBtn() {
        const btnPoint = createHtmlElement('div', "jas-ctrl-marker-item-btn");
        const btnLine = createHtmlElement('div', "jas-ctrl-marker-item-btn");
        const btnPolygon = createHtmlElement('div', "jas-ctrl-marker-item-btn");

        const svgBuilder = new SvgBuilder('marker_point');
        btnPoint.innerHTML = svgBuilder.resize(22, 22).create();
        btnLine.innerHTML = svgBuilder.change('marker_line').create();
        btnPolygon.innerHTML = svgBuilder.resize(21, 21).change('marker_polygon').create();

        btnPoint.addEventListener('click',()=>this.drawManger.start('Point'));
        btnLine.addEventListener('click',()=>this.drawManger.start('LineString'));
        btnPolygon.addEventListener('click',()=>this.drawManger.start('Polygon'));

        const c = createHtmlElement('div', "jas-flex-center", "jas-ctrl-marker-btns-container");
        c.append(btnPoint, btnLine, btnPolygon);

        return c;
    }
}

interface MarkerItemOptions {
    onRemove?(id: string): void
}

interface MarkerLayerOptions {
    onRemove?(id: string): void,
    onRename?(id: string, name: string): void,
}

class MarkerItem {
    readonly htmlElement = createHtmlElement('div', 'jas-ctrl-marker-item-container');
    /**
     *
     */
    constructor(
        readonly feature: MarkerFeatureType,
        private options: MarkerItemOptions = {}) {

        const prefix = createHtmlElement('div', 'jas-flex-center');
        const suffix = createHtmlElement('div', 'jas-ctrl-marker-suffix', 'jas-ctrl-hidden');
        const content = createHtmlElement('div', 'jas-ctrl-marker-item-container-content');
        content.innerText = feature.properties.name;

        const svgBuilder = new SvgBuilder('marker_point').resize(16, 16);
        const geometryType = feature.geometry.type === 'Point' ?
            svgBuilder.create('svg') :
            feature.geometry.type === 'LineString' ?
                svgBuilder.change('marker_line').create('svg') :
                svgBuilder.change('marker_polygon').create('svg');
        prefix.append(geometryType);

        suffix.append(this.createSuffixEditGeometry(), this.createSuffixEdit(), this.createSuffixExport(), this.createSuffixDel());

        this.htmlElement.addEventListener('mouseenter', () => {
            suffix.classList.remove('jas-ctrl-hidden');
        });
        this.htmlElement.addEventListener('mouseleave', () => {
            suffix.classList.add('jas-ctrl-hidden');
        });

        this.htmlElement.append(prefix, content, suffix);
    }

    remove() {
        this.htmlElement.remove();
        this.options.onRemove?.call(undefined, this.feature.properties.id);
    }

    setVisible(value: boolean) {
        if (value)
            this.htmlElement.classList.remove('jas-ctrl-hidden');
        else
            this.htmlElement.classList.add('jas-ctrl-hidden');

        this.feature.properties.visible = value;
    }

    private createSuffixEdit() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('edit').resize(17, 17).create('svg'));

        return div;
    }
    private createSuffixEditGeometry() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('remake').resize(17, 17).create('svg'));

        return div;
    }

    private createSuffixExport() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('export').resize(15, 15).create('svg'));

        return div;
    }

    private createSuffixDel() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('delete').resize(15, 15).create('svg'));

        return div;
    }
}

class MarkerLayer {
    readonly items: MarkerItem[];
    readonly htmlElement = createHtmlElement('div');

    private arrow = createHtmlElement('div', "jas-collapse-arrow", "jas-ctrl-switchlayer-group-header-title-collapse");
    private nameElement = createHtmlElement('div');
    private itemContainerElement = createHtmlElement('div', 'jas-ctrl-hidden');

    /**
     *
     */
    constructor(
        readonly properties: MarkerLayerProperties,
        features: MarkerFeatureType[],
        private options: MarkerLayerOptions = {}) {

        this.items = features.map(f => new MarkerItem(f));

        this.nameElement.innerText = properties.name;
        this.itemContainerElement.append(...this.items.map(x => x.htmlElement));
        this.itemContainerElement.style.paddingLeft = '16px';
        this.htmlElement.append(this.createHeader(), this.itemContainerElement);
    }

    remove() {
        this.htmlElement.remove();
        this.options.onRemove?.call(undefined, this.properties.id);
    }

    rename(name: string) {
        if (name === this.properties.name)
            return;

        this.nameElement.innerText = name;
        this.properties.name = name;
        this.options.onRename?.call(undefined, this.properties.id, name);
    }

    collapse(value: boolean) {
        if (value) {
            this.arrow.classList.remove("jas-collapse-active");
            this.itemContainerElement.classList.add("jas-ctrl-hidden");
        } else {
            this.arrow.classList.add("jas-collapse-active");
            this.itemContainerElement.classList.remove("jas-ctrl-hidden");
        }
    }

    setVisible(value:boolean){
        if(value)
            this.htmlElement.classList.remove('jas-ctrl-hidden');
        else
            this.htmlElement.classList.remove('jas-ctrl-hidden');
    }

    private createHeader() {
        const header = createHtmlElement('div', 'jas-ctrl-marker-layer-header');

        const content = createHtmlElement('div', 'jas-ctrl-marker-layer-header-content');
        content.append(this.arrow, this.nameElement);

        content.addEventListener('click', () => {
            this.arrow.classList.toggle("jas-collapse-active");
            this.itemContainerElement.classList.toggle("jas-ctrl-hidden");
        });

        const suffix = createHtmlElement('div', 'jas-ctrl-marker-suffix', 'jas-ctrl-hidden');

        suffix.append(
            this.createSuffixEdit(),
            this.createSuffixExp(),
            this.createSuffixDel());

        header.addEventListener('mouseenter', () => {
            suffix.classList.remove('jas-ctrl-hidden');
        });
        header.addEventListener('mouseleave', () => {
            suffix.classList.add('jas-ctrl-hidden');
        });

        header.append(content, suffix, this.createSuffixVisible());
        return header;
    }

    private createSuffixExp() {
        const exp = createHtmlElement('div');
        exp.innerHTML = new SvgBuilder('export').resize(15, 15).create();

        return exp
    }

    private createSuffixEdit() {
        const edit = createHtmlElement('div');
        edit.innerHTML = new SvgBuilder('edit').resize(18, 18).create();
        edit.addEventListener('click', () => {
            const content = createHtmlElement('div', 'jas-flex-center');
            const label = createHtmlElement('div');
            label.innerText = "名称 ";
            const input = createHtmlElement('input');
            input.type = 'text';
            input.value = this.properties.name;
            content.append(label, input);
            createConfirmModal({
                title: '修改图层',
                content,
                onCancle: () => { },
                onConfirm: () => {
                    this.rename(input.value.trim());
                }
            });
        });
        return edit;
    }

    private createSuffixDel() {
        const del = createHtmlElement('div');
        del.innerHTML = new SvgBuilder('delete').resize(15, 15).create();
        del.addEventListener('click', () => {
            createConfirmModal({
                title: '确认',
                content: `删除图层 : ${this.properties.name}`,
                onCancle: () => { },
                onConfirm: () => {
                    this.remove();
                }
            });
        });

        return del;
    }

    private createSuffixVisible() {
        const svgBuilder = new SvgBuilder('eye').resize(18, 18);
        const eye = svgBuilder.create();
        const uneye = svgBuilder.change('uneye').create();

        const visible = createHtmlElement('div');
        visible.innerHTML = eye;

        visible.addEventListener('click', () => {
            visible.innerHTML = visible.innerHTML === eye ? uneye : eye;
        });

        visible.style.cursor = "pointer";
        visible.style.marginLeft = "5px";

        return visible;
    }
}

class MarkerLayerContext {
    readonly items: MarkerLayer[] = [];
    readonly htmlElementLayer = createHtmlElement('div');

    constructor(
        fc: GeoJSON.FeatureCollection<GeoJSON.Geometry, MarkerFeatrueProperties>,
        layers: MarkerLayerProperties[]) {
        const values = array.groupBy(fc.features, f => f.properties.group_id);

        layers.forEach(l => {
            const features = values.get(l.id) || [];
            const fm = array.groupBy(features, f => f.geometry.type);
            const layerFeatures =
                (fm.get('Point') || []).sort(x => x.properties.date).concat(
                    (fm.get('LineString') || []).sort(x => x.properties.date)).concat(
                        (fm.get('Polygon') || []).sort(x => x.properties.date));

            this.items.push(new MarkerLayer(l, layerFeatures));
        });

        this.htmlElementLayer.append(...this.items.map(x => x.htmlElement));
    }

    search(value?: string) {
        this.items.forEach(l => {
            if (value) {
                let hitCount = 0;
                l.items.forEach(m=>{
                    const isHit = m.feature.properties.name.includes(value);
                    m.setVisible(isHit);
                    hitCount++;
                });
                l.setVisible(hitCount > 0);
            } else {
                // 复原操作
                l.setVisible(true);
                l.collapse(true);
                l.items.forEach(m => {
                    m.setVisible(true);
                });
            }
        });
    }
}