import { createConfirmModal } from "../../modal";
import SvgBuilder from "../../svg";
import { createHtmlElement } from "../../utils";
import { array, creator } from 'wheater';
import { MarkerFeatrueProperties, MarkerFeatureType, MarkerLayerProperties } from "./types";
import DrawManager from "./DrawMarker";
import mapboxgl from "mapbox-gl";
import LayerGroup from "../LayerGroup";

export default class MarkerManager {

    readonly htmlElement = createHtmlElement('div', 'jas-ctrl-marker');

    private readonly drawManger: DrawManager;
    private readonly layerContext: MarkerLayerContext;

    /**
     *
     */
    constructor(map: mapboxgl.Map) {
        this.layerContext = new MarkerLayerContext(
            map,
            {
                'type': 'FeatureCollection',
                'features': [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [120.22, 30.9]
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
                            coordinates: [[120.22, 30.93], [120.22, 30.99]]
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
                            coordinates: [120.1, 30.9]
                        },
                        properties: {
                            id: '3',
                            name: '标注3',
                            group_id: '1',
                            date: Date.now()
                        }
                    },
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[[120.1, 31], [120.1, 31.2], [120, 30.9], [120.1, 31]]]
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
            }]);

        this.drawManger = new DrawManager(map, {
            onDrawFinish: (draw, flush) => {
                draw.currentFeature!.properties.name = '绘制';
                this.layerContext.addMarker('1', draw.currentFeature!);
                flush();
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

        container.append(this.layerContext.htmlElementLayer);
        return container;
    }

    private createHeaderMenu() {
        const searchDiv = createHtmlElement('div', 'jas-flex-center');
        searchDiv.style.position = 'relative';
        const search = createHtmlElement('input');
        search.type = 'text';
        search.placeholder = "请输入标注名称";
        search.style.padding = '6px 18px 6px 6px';
        search.style.outline = 'none';
        search.style.border = '1px solid #ddd';
        search.style.borderRadius = '4px';

        const clean = new SvgBuilder('X').resize(17, 17).create('svg');
        clean.style.position = 'absolute';
        clean.style.right = '2px';
        clean.style.cursor = 'pointer';

        clean.addEventListener('click', () => {
            search.value = '';
            this.layerContext.search();
        });

        search.addEventListener('keypress', e => {
            if (e.code === 'Enter') {
                this.layerContext.search(search.value);
            }
        });

        searchDiv.append(search, clean);

        const c = createHtmlElement('div', "jas-flex-center", 'jas-ctrl-marker-menu');
        c.append(searchDiv);

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

        btnPoint.addEventListener('click', () => this.drawManger.start('Point'));
        btnLine.addEventListener('click', () => this.drawManger.start('LineString'));
        btnPolygon.addEventListener('click', () => this.drawManger.start('Polygon'));

        const c = createHtmlElement('div', "jas-flex-center", "jas-ctrl-marker-btns-container");
        c.append(btnPoint, btnLine, btnPolygon);

        return c;
    }
}

interface MarkerItemOptions {
    onCreate?(feature: MarkerFeatureType): void,
    onRemove?(feature: MarkerFeatureType): void,
    onUpdate?(feature: MarkerFeatureType): void
}

interface MarkerLayerOptions {
    onCreate?(properties: MarkerLayerProperties): void,
    onRemove?(properties: MarkerLayerProperties): void,
    onRename?(properties: MarkerLayerProperties): void,

    markerItemOptions?: MarkerItemOptions
}

class MarkerItem {
    readonly htmlElement = createHtmlElement('div', 'jas-ctrl-marker-item-container');
    /**
     *
     */
    constructor(
        readonly feature: MarkerFeatureType,
        private options: MarkerItemOptions = {}) {

        this.htmlElement.classList.add(MarkerItem.getGeometryMatchClass(feature));

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
        suffix.append(
            // this.createSuffixEditGeometry(), 
            this.createSuffixEdit(), 
            this.createSuffixExport(), 
            this.createSuffixDel());

        this.htmlElement.addEventListener('mouseenter', () => {
            suffix.classList.remove('jas-ctrl-hidden');
        });
        this.htmlElement.addEventListener('mouseleave', () => {
            suffix.classList.add('jas-ctrl-hidden');
        });

        this.htmlElement.append(prefix, content, suffix);
    }

    static getGeometryMatchClass(feature: GeoJSON.Feature) {
        return `geometry-match-${feature.geometry.type.toLocaleLowerCase()}`;
    }

    remove() {
        this.htmlElement.remove();
        this.options.onRemove?.call(undefined, this.feature);
    }

    setUIVisible(value: boolean) {
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

    private layerGroup: LayerGroup;
    private arrow = createHtmlElement('div', "jas-collapse-arrow", "jas-ctrl-switchlayer-group-header-title-collapse");
    private nameElement = createHtmlElement('div');
    private itemContainerElement = createHtmlElement('div', 'jas-ctrl-hidden');

    declare setGeometryVisible: (value: boolean) => void;

    /**
     *
     */
    constructor(
        private map: mapboxgl.Map,
        readonly properties: MarkerLayerProperties,
        private features: MarkerFeatureType[],
        private options: MarkerLayerOptions = {}) {

        const fm = array.groupBy(features, f => f.geometry.type);
        const layerFeatures =
            (fm.get('Point') || []).sort(x => x.properties.date).concat(
                (fm.get('LineString') || []).sort(x => x.properties.date)).concat(
                    (fm.get('Polygon') || []).sort(x => x.properties.date));
        this.items = layerFeatures.map(f => new MarkerItem(f, options.markerItemOptions));

        map.addSource(this.properties.id, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features
            }
        });

        this.layerGroup = new LayerGroup(creator.uuid(), map, [
            {
                id: this.properties.id + "_point",
                type: 'circle',
                source: this.properties.id,
                paint: {
                    "circle-color": ['get', 'point_color']
                },
                filter: ['==', '$type', 'Point']
            }, {
                id: this.properties.id + "_line",
                type: 'line',
                source: this.properties.id,
                paint: {
                    "line-color": ['get', 'line_color'],
                    "line-width": ['get', 'line_width']
                },
                filter: ['==', '$type', 'LineString']
            }, {
                id: this.properties.id + '_polygon',
                type: 'fill',
                source: this.properties.id,
                paint: {
                    "fill-color": ['get', 'polygon_color'],
                    "fill-opacity": ['get', 'polygon_opacity']
                },
                filter: ['==', '$type', 'Polygon']
            }, {
                id: this.properties.id + '_polygon_outline',
                type: 'line',
                source: this.properties.id,
                paint: {
                    "line-color": ['get', 'polygon_outline_color'],
                    "line-width": ['get', 'polygon_outline_width']
                },
                filter: ['==', '$type', 'Polygon']
            }, {
                id: this.properties.id + "_label",
                type: 'symbol',
                source: this.properties.id,
                layout: {
                    "text-field": ['get', 'name'],
                }
            }
        ]);

        this.nameElement.innerText = properties.name;
        this.itemContainerElement.append(...this.items.map(x => x.htmlElement));
        this.itemContainerElement.style.paddingLeft = '16px';
        this.htmlElement.append(this.createHeader(), this.itemContainerElement);
    }

    addMarker(feature: MarkerFeatureType) {
        const markerItem = new MarkerItem(feature);
        const firstNode = this.itemContainerElement.querySelector(`.${MarkerItem.getGeometryMatchClass(feature)}`)
        if (firstNode)
        this.itemContainerElement.insertBefore(markerItem.htmlElement, firstNode);
        else
        this.itemContainerElement.append(markerItem.htmlElement);

        this.features.push(feature);
        this.items.push(markerItem);

        this.updateDataSource();
    }

    remove() {
        this.htmlElement.remove();
        this.options.onRemove?.call(undefined, this.properties);

        this.layerGroup.removeAll();
        this.map.removeLayerGroup(this.layerGroup.id);
    }

    rename(name: string) {
        if (name === this.properties.name)
            return;

        this.nameElement.innerText = name;
        this.properties.name = name;
        this.options.onRename?.call(undefined, this.properties);
    }

    updateDataSource() {
        (this.map.getSource(this.properties.id) as mapboxgl.GeoJSONSource)
            .setData({ type: 'FeatureCollection', features: this.features });
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

    setUIVisible(value: boolean) {
        if (value)
            this.htmlElement.classList.remove('jas-ctrl-hidden');
        else
            this.htmlElement.classList.add('jas-ctrl-hidden');
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
            const isEye = visible.innerHTML === eye;
            visible.innerHTML = isEye ? uneye : eye;
            this.layerGroup.show = !isEye;
        });

        this.setGeometryVisible = (value: boolean) => {
            visible.innerHTML = value ? eye : uneye;
            this.layerGroup.show = value;
        }

        visible.style.cursor = "pointer";
        visible.style.marginLeft = "5px";

        return visible;
    }
}

class MarkerLayerContext {
    readonly items: MarkerLayer[] = [];
    readonly htmlElementLayer = createHtmlElement('div');

    private lastSearchValue?: string;

    constructor(
        map: mapboxgl.Map,
        fc: GeoJSON.FeatureCollection<GeoJSON.Geometry, MarkerFeatrueProperties>,
        layers: MarkerLayerProperties[],
        options?: MarkerLayerOptions) {

        const values = array.groupBy(fc.features, f => f.properties.group_id);
        layers.sort(x => x.date).forEach(l => {
            const features = values.get(l.id) || [];
            this.items.push(new MarkerLayer(map, l, features, options));
        });

        this.htmlElementLayer.append(...this.items.map(x => x.htmlElement));
    }

    search(value?: string) {
        if (this.lastSearchValue === value)
            return;

        this.items.forEach(l => {
            if (value) {
                let hitCount = 0;
                l.items.forEach(m => {
                    const isHit = m.feature.properties.name.includes(value);
                    m.setUIVisible(isHit);
                    hitCount++;
                });
                l.setUIVisible(hitCount > 0);
                l.collapse(hitCount === 0)
            } else {
                // 复原操作
                l.setUIVisible(true);
                l.collapse(true);
                l.items.forEach(m => {
                    m.setUIVisible(true);
                });
            }
        });

        this.lastSearchValue = value;
    }

    addLayer(name: string) {

    }

    addMarker(layerId: string, feature: MarkerFeatureType) {
        const layer = array.first(this.items, x => x.properties.id === layerId);
        if (!layer) throw Error(`layer id : ${layerId} not found`);

        layer.addMarker(feature);
    }

    setGeometryVisible(value: boolean) {
        this.items.forEach(l => l.setGeometryVisible(value));
    }
}