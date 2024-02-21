import mapboxgl from "mapbox-gl";
import { dom } from 'wheater';

export interface EyeControlOptions {
    /**
     * 控件默认位置
     */
    defaultPosition?: string;
    /**
     * 大小地图 zoom 之差
     */
    zoomDiff?: number;
    /**
     * 方框边框颜色
     */
    overviewBoxColor?: string;
    /**
     * 大地图切换的时候小地图是否同步切换？
     */
    layoutSync?: boolean;
}

/**
 * 鹰眼控件
 */
export class EyeControl implements mapboxgl.IControl {

    readonly element = dom.createHtmlElement('div', ["jas-ctrl-eye", "mapboxgl-ctrl"]);
    readonly overviewBoxSourceId = "overviewBox";
    private get currentPolygon(): GeoJSON.Feature<GeoJSON.Polygon, null> {
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: []
            },
            properties: null
        }
    };

    constructor(private map: mapboxgl.Map, private options: EyeControlOptions = {}) {
        this.options.defaultPosition ??= "top-left";
        this.options.zoomDiff ??= 4;
        this.options.overviewBoxColor ??= "blue";
        this.options.layoutSync ??= false;

        this.element.setAttribute("id", "overview");
        this.map.getContainer().appendChild(this.element);
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        let that = this;
        var overviewMap = new mapboxgl.Map({
            container: this.element.id,
            style: map.getStyle(),
            center: map.getCenter(),
            zoom: map.getZoom() - that.options.zoomDiff!,
            attributionControl: false,
            preserveDrawingBuffer: true
        });

        overviewMap.on('load', () => {
            overviewMap.addSource(this.overviewBoxSourceId, {
                type: 'geojson',
                data: this.currentPolygon
            });
            overviewMap.addLayer({
                id: this.overviewBoxSourceId,
                type: 'line',
                source: this.overviewBoxSourceId,
                paint: {
                    "line-color": this.options.overviewBoxColor,
                    "line-width": 1,
                },
                layout: {
                    visibility: "visible"
                }
            });

            overviewBox();
        });

        function overviewBox() {
            var sw = map.getBounds().getSouthWest();
            var ne = map.getBounds().getNorthEast();
            (overviewMap.getSource(that.overviewBoxSourceId) as mapboxgl.GeoJSONSource).setData({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [sw.lng, ne.lat],
                        [ne.lng, ne.lat],
                        [ne.lng, sw.lat],
                        [sw.lng, sw.lat],
                        [sw.lng, ne.lat]
                    ]]
                },
                properties: null
            });
        }

        function mapdrag() {
            overviewMap.setCenter(map.getCenter());
            overviewBox();
        }
        function mapzoom() {
            overviewMap.setCenter(map.getCenter());
            overviewMap.setZoom(map.getZoom() - that.options.zoomDiff!);
            overviewBox();
        }
        function overviewdrag() {
            map.setCenter(overviewMap.getCenter());
            overviewBox();
        }
        function overviewzoom() {
            map.setCenter(overviewMap.getCenter());
            map.setZoom(overviewMap.getZoom() + that.options.zoomDiff!);
            overviewBox();
        }

        map.on("drag", mapdrag);
        map.on("zoom", mapzoom);
        map.on('idle', () => {
            if (!this.options.layoutSync)
                return;
            var maplayers = map.getStyle().layers;
            var ovmaplayers = overviewMap.getStyle().layers;
            for (let layer of maplayers) {
                if (ovmaplayers.find(l => l.id == layer.id))
                    overviewMap.setLayoutProperty(layer.id, "visibility", map.getLayoutProperty(layer.id, "visibility"));
            }
        });
        overviewMap.on("drag", overviewdrag);
        overviewMap.on("zoom", overviewzoom);

        return this.element!;
    }

    onRemove(map: mapboxgl.Map): void {
        this.element.remove();
    }

    getDefaultPosition(): string { return this.options.defaultPosition! };
}