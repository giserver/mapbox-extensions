import { LineString, Polygon } from "@turf/turf";
import { EventData, GeoJSONSource, IControl, LngLat, Map, MapEventType } from "mapbox-gl";
import { setDefaultValue } from "../utils";

export interface DoodleControlOptions {
    /**
     * 名字(默认：画圈)
     */
    name?: string;

    /**
     * 绘制完成
     * @param polygon 绘制的多边形
     */
    onDrawed?(polygon: Polygon): void;

    /**
     * 清空当前绘制回调
     */
    onClear?():void;

    /**
     * 退出绘制
     */
    onExit?(): void;
}

export default class DoodleControl implements IControl {

    private penImage = `<svg t="1672824007026" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2828" width="20" height="20">
    <path d="M745.76 369.86l-451 537.48a18.693 18.693 0 0 1-8.46 5.74l-136.58 45.27c-13.24 4.39-26.46-6.71-24.43-20.5l20.86-142.36c0.5-3.44 1.95-6.67 4.19-9.33l451-537.48c6.65-7.93 18.47-8.96 26.4-2.31l115.71 97.1c7.92 6.64 8.96 18.46 2.31 26.39zM894.53 192.56l-65.9 78.53c-6.65 7.93-18.47 8.96-26.4 2.31l-115.71-97.1c-7.93-6.65-8.96-18.47-2.31-26.4l65.9-78.53c6.65-7.93 18.47-8.96 26.4-2.31l115.71 97.1c7.93 6.65 8.96 18.47 2.31 26.4z" fill="#6C6D6E" p-id="2829">
    </path></svg>`

    private drawing = false;
    private div_doodle_switch : HTMLDivElement;
    private svg_doodle_switch : HTMLDivElement;
    private span_doodle_switch : HTMLSpanElement;

    private div_redraw : HTMLDivElement;

    private currentLine : LineString = {type:'LineString',coordinates:[]};

    /**
     *
     */
    constructor(private options: DoodleControlOptions = {}) {
        setDefaultValue(this.options, 'name', "画圈");

        this.div_doodle_switch = document.createElement('div');
        this.div_doodle_switch.className = "jas-ctrl mapboxgl-ctrl-group"
        let style = this.div_doodle_switch.style;
        style.pointerEvents = 'auto';
        style.cursor = 'pointer';
        style.display = 'flex';
        style.justifyContent = 'center';
        style.alignItems = 'center';
        style.height = '36px';
        style.padding = '0 5px'
        style.fontSize = '13px';
        style.fontWeight = '500';
        style.marginLeft = '10px';

        this.svg_doodle_switch = document.createElement('div');
        this.svg_doodle_switch.innerHTML = this.penImage;
        this.span_doodle_switch = document.createElement('span');
        this.span_doodle_switch.innerText = this.options.name!;

        this.div_doodle_switch.append(this.svg_doodle_switch);
        this.div_doodle_switch.append(this.span_doodle_switch);

        this.div_redraw = document.createElement('div');
        this.div_redraw.className = "jas-ctrl mapboxgl-ctrl-group";
        style = this.div_redraw.style;
        style.pointerEvents = 'auto';
        style.display = 'flex';
        style.justifyContent = 'center';
        style.alignItems = 'center';
        style.cursor = 'pointer';
        style.height = '36px';
        style.padding = '0 5px';
        style.fontSize = '13px';
        style.fontWeight = '500';

        this.div_redraw.innerHTML = `<span>重画</span>`;
        this.div_redraw.style.display = 'none';
    }

    onAdd(map: Map): HTMLElement {
        const div = document.createElement('div');
        div.className = "jas-ctrl-doodle mapboxgl-ctrl";
        div.style.display = 'flex'
        
        div.innerHTML =`<style>
            .jas-ctrl:hover{
                background-color : #ddd !important;
            }
        </style>`;

        const that = this;
        map.addSource('doodle-line',{
            type:'geojson',
            data:{
                type:'Feature',
                geometry:{
                    type:'LineString',
                    coordinates:[],
                },
                properties:{}
            }
        })
        map.addSource('doodle-polygon',{
            type:'geojson',
            data:{
                type:'Feature',
                geometry:{
                    type:'Polygon',
                    coordinates:[],
                },
                properties:{}
            }
        })
        map.addLayer({
            id:'doodle-line',
            type:'line',
            source:'doodle-line',
            layout:{},
            paint:{
                "line-width" : 5,
                "line-color" : 'blue'
            }
        })

        map.addLayer({
            id:'doodle-polygon',
            type:'fill',
            source:'doodle-polygon',
            layout:{},
            paint:{
                'fill-color':'cyan',
                'fill-opacity' : 0.5
            }
        })

        function onMouseDown<T extends keyof MapEventType>(e: MapEventType[T] & EventData) {
            e.preventDefault();
            that.div_redraw.style.display = 'flex';

            const lnglat = [e.lngLat.lng,e.lngLat.lat];
            that.currentLine.coordinates.push(lnglat);
            updateDataSource();
        
            map.on('mousemove',onMouseMove);
            map.once('mouseup',onMouseUp);
        }

        function onMouseMove<T extends keyof MapEventType>(e: MapEventType[T] & EventData){
            const lnglat = [e.lngLat.lng,e.lngLat.lat];
            that.currentLine.coordinates.push(lnglat);
            updateDataSource();
        }

        function onMouseUp<T extends keyof MapEventType>(e: MapEventType[T] & EventData){
            map.getCanvas().style.cursor = '';
            updateDataSource(true);
            map.off('mousemove',onMouseMove);
        }

        function updateDataSource(polygon:boolean = false){
            if(polygon){
                (map.getSource('doodle-polygon') as GeoJSONSource).setData({type:'Feature',geometry:{
                    type:'Polygon',
                    coordinates:that.currentLine.coordinates.length === 0 ? [] : [[...that.currentLine.coordinates,that.currentLine.coordinates[0]]]
                },properties:{}});

                (map.getSource('doodle-line') as GeoJSONSource).setData({type:'Feature',geometry:{
                    type:'LineString',
                    coordinates:that.currentLine.coordinates.length === 0 ? [] : [...that.currentLine.coordinates,that.currentLine.coordinates[0]]
                },properties:{}});

                that.currentLine.coordinates.length = 0;
            }else{
                (map.getSource('doodle-line') as GeoJSONSource).setData({type:'Feature',geometry:that.currentLine,properties:{}});
            }
        }

        this.div_doodle_switch.addEventListener('click',()=>{
            
            // 当前正在绘制 退出绘制
            if(this.drawing){
                this.svg_doodle_switch.style.display = '';
                this.div_redraw.style.display = 'none';
                this.span_doodle_switch.innerText = `${this.options.name}`;
                
                that.currentLine.coordinates.length = 0;
                updateDataSource(true);

                this.options.onClear?.call(this);
                this.options.onExit?.call(this);
            }else{ // 开始绘制
                this.svg_doodle_switch.style.display = 'none';
                this.span_doodle_switch.innerText = `退出${this.options.name}`;

                map.once('mousedown',onMouseDown);
            }

            this.drawing = !this.drawing;
        });

        /**
         * 重画
         */
        this.div_redraw.addEventListener('click',()=>{
            that.div_redraw.style.display = 'none';
            that.currentLine.coordinates.length = 0;
            updateDataSource(true);
            this.options.onClear?.call(this);
            map.once('mousedown',onMouseDown);
        });

        div.append(this.div_redraw);
        div.append(this.div_doodle_switch);
        return div;
    }
    onRemove(map: Map): void {
    }
    getDefaultPosition?: (() => string) | undefined;

}