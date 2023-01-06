import '../lib';
import mapboxgl from 'mapbox-gl';
import MeasureControl from '../lib/controls/MeasureControl';
import SwitchMapControl from '../lib/controls/SwitchMapControl';
import BackToOriginControl from '../lib/controls/BackToOriginControl';
import DoodleControl from '../lib/controls/DoodleControl';

const darkStyle = "mapbox://styles/mapbox/dark-v10";
const lightStyle = 'mapbox://styles/mapbox/streets-v11';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w';

const map = new mapboxgl.Map({
    container: 'map',
    zoom: 8,
    center: [120.5, 31],
    pitch: 0,
    style: lightStyle
});

let doodleControl: DoodleControl;
let measureControl: MeasureControl;

// 测量
measureControl = new MeasureControl({
    horizontal: true,
    geometryClick: true,
    onGeometryCopy: (geom: string) => { alert(`复制成功 : ${geom}`) },
    onFeatureDelete: (id: string) => { alert(`删除成功 : ${id}`) },
    onStart: () => { doodleControl.stop() },
    measurePolygonOptions: {
        onDrawed: (id, geometry) => { console.log(id, JSON.stringify(geometry)) }
    }
});

doodleControl = new DoodleControl({
    onStart: () => { measureControl.stop() }
})

map.on('load', () => {

    // 切换卫星影像
    map.addControl(new SwitchMapControl({
        satelliteOption: {
            textColor: 'white',
            //backgroundImage: '/relics.png'
        },
        extraLayers:{foo:{mutex:true,layers:[{
            name:'foo',
            layer:{
                id:'fff',
                type:'fill',
                source:''
            },
            'backgroundImage':'',
        },{
            name:'foo',
            layer:{
                id:'fff',
                type:'fill',
                source:''
            },
            'backgroundImage':'',
        },{
            name:'foo',
            layer:{
                id:'fff',
                type:'fill',
                source:''
            },
            'backgroundImage':'',
        }]},'foo2':{mutex:false,layers:[]}}
    }));

    // 加载多个图片
    map.addImages({ 'img1': '/relics.png', 'img2': '/relics.png' }, () => {
        map.addLayer({
            id: 'images',
            type: 'symbol',
            source: {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {
                                img: 'img1'
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: [120.5, 31]
                            }
                        },
                        {
                            type: 'Feature',
                            properties: {
                                img: 'img2'
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: [120.6, 31]
                            }
                        }
                    ]
                }
            },
            layout: {
                'icon-image': ['get', 'img']
            }
        })
    });

    map.addControl(new mapboxgl.NavigationControl())

    map.addControl(doodleControl);
})

map.addControl(measureControl);
map.addControl(new BackToOriginControl());