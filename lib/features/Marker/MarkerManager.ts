import { createConfirmModal } from "../../modal";
import SvgBuilder from "../../svg";
import { createHtmlElement } from "../../utils";
import { array } from 'wheater';

export default class MarkerManager {

    private static _instance: MarkerManager;

    readonly htmlElement = createHtmlElement('div', 'jas-ctrl-marker');

    private readonly pageLayer;
    private readonly pageSearch = createHtmlElement('div', 'jas-ctrl-hidden');

    /**
     *
     */
    private constructor() {
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
                        style: {

                        }
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
                        style: {}
                    }
                }
            ]
        }, [{
            id: '1',
            name: '测试图层'
        }, {
            id: '2',
            name: '测试图层2'
        }]).htmlElementLayer;

        this.htmlElement.append(this.createHeader(), this.createDataContainer());
    }

    static get Instance() {
        return this._instance ??= new MarkerManager();
    }

    private createHeader() {
        const header = createHtmlElement('div', 'jas-ctrl-marker-header');
        header.append(this.createHeaderMenu(), this.createHeaderDrawBtn());
        return header;
    }

    private createDataContainer() {
        const container = createHtmlElement('div', 'jas-ctrl-marker-data');

        container.append(this.pageLayer, this.pageSearch);
        return container;
    }

    private createHeaderMenu() {
        const btnLayer = createHtmlElement('button', 'jas-btn', 'jas-btn-active');
        const btnSearch = createHtmlElement('button', 'jas-btn', 'jas-btn-default');
        btnLayer.innerText = "图层";
        btnSearch.innerText = '搜索';

        const changeBtnActiveHandler = () => {
            btnLayer.classList.toggle('jas-btn-active');
            btnLayer.classList.toggle('jas-btn-default');
            btnSearch.classList.toggle('jas-btn-active');
            btnSearch.classList.toggle('jas-btn-default');

            this.pageLayer.classList.toggle("jas-ctrl-hidden");
            this.pageSearch.classList.toggle("jas-ctrl-hidden");
        }

        btnLayer.addEventListener('click', changeBtnActiveHandler);
        btnSearch.addEventListener('click', changeBtnActiveHandler);

        const c = createHtmlElement('div', "jas-flex-center", 'jas-ctrl-marker-menu');
        c.append(btnLayer, btnSearch);

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

        const c = createHtmlElement('div', "jas-flex-center", "jas-ctrl-marker-btns-container");
        c.append(btnPoint, btnLine, btnPolygon);

        return c;
    }
}

interface MarkerFeatrueProperties {
    id: string,
    name: string,
    group_id: string,
    style: {
        Point?: {

        },
        LineString?: {

        },
        Polygon?: {

        }
    }
}

interface MarkerLayerProperties {
    id: string,
    name: string,
}

type MarkerFeatureType = GeoJSON.Feature<GeoJSON.Geometry, MarkerFeatrueProperties>;

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

    private createSuffixEdit() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('edit').create('svg'));

        return div;
    }
    private createSuffixEditGeometry() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('remake').create('svg'));

        return div;
    }

    private createSuffixExport() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('export').resize(17, 17).create('svg'));

        return div;
    }

    private createSuffixDel() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('clean').resize(17, 17).create('svg'));

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
        exp.innerHTML = new SvgBuilder('export').resize(18, 18).create();

        return exp
    }

    private createSuffixEdit() {
        const edit = createHtmlElement('div');
        edit.innerHTML = new SvgBuilder('edit').create();
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
        del.innerHTML = new SvgBuilder('clean').resize(18, 18).create();
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
        const svgBuilder = new SvgBuilder('eye');
        const eye = svgBuilder.create();
        const uneye = svgBuilder.change('uneye').create();

        const visible = createHtmlElement('div');
        visible.innerHTML = eye;

        visible.addEventListener('click', () => {
            visible.innerHTML = visible.innerHTML === eye ? uneye : eye;
        });

        visible.style.cursor= "pointer";
        visible.style.marginLeft = "5px";

        return visible;
    }
}

class MarkerLayerContext {
    readonly items: MarkerLayer[] = [];
    readonly htmlElementLayer = createHtmlElement('div');
    readonly htmlElementSearch = createHtmlElement('div');

    constructor(
        fc: GeoJSON.FeatureCollection<GeoJSON.Geometry, MarkerFeatrueProperties>,
        layers: MarkerLayerProperties[]) {
        const values = array.groupBy(fc.features, f => f.properties.group_id);

        layers.forEach(l => {
            this.items.push(new MarkerLayer(l, values.get(l.id) || []))
        })

        this.htmlElementLayer.append(...this.items.map(x => x.htmlElement));
    }
}