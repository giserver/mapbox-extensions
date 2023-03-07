import mapboxgl from "mapbox-gl";

export default class SetStyleProxy {

    private cacheLayers = new Array<mapboxgl.AnyLayer>();

    private customLayers = new Array<mapboxgl.AnyLayer>();
    private customSources = new Map<string, mapboxgl.AnySourceData>();

    constructor(private map: mapboxgl.Map) {
        map.on('style.load', () => {
            this.cacheAndResoreLayerAndSource();
        })
    }

    setStyle(style: string) {
        this.customLayers = new Array<mapboxgl.AnyLayer>();
        this.customSources = new Map<string, mapboxgl.AnySourceData>();

        this.map.getStyle().layers.forEach(l => {
            if (this.cacheLayers.some(cl => cl.id === l.id))
                return;

            this.customLayers.push(l);
            const sourceId = (l as any).source as string;

            if (!this.customSources.get(sourceId))
                this.customSources.set(sourceId, (this.map.getSource(sourceId) as any).serialize())
        })

        this.map.setStyle(style);
    }

    private cacheAndResoreLayerAndSource() {
        this.cacheLayers = this.map.getStyle().layers;

        this.customSources.forEach((v, k) => this.map.addSource(k, v));
        this.customLayers.forEach(l => this.map.addLayer(l));
    }
}