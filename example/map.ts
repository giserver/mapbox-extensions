import '../lib';
import { MeasureLineString, MeasurePoint } from '../lib/features/Meature'
import mapboxgl from 'mapbox-gl';

const darkStyle = "mapbox://styles/mapbox/dark-v10";
const lightStyle = 'mapbox://styles/mapbox/streets-v11';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w';

const map = new mapboxgl.Map({
    container: 'map',
    zoom: 5,
    center: [-68.13734351262877, 45.137451890638886],
    pitch: 0,
    style: lightStyle
});

map.on('load', () => {
    map.addSource("source-polygon", {
        type: 'geojson',
        data: {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [[[-67.13734351262877, 45.137451890638886],
                [-66.96466, 44.8097],
                [-68.03252, 44.3252],
                [-69.06, 43.98],
                [-70.11617, 43.68405],
                [-70.64573401557249, 43.090083319667144],
                [-70.75102474636725, 43.08003225358635],
                [-70.79761105007827, 43.21973948828747],
                [-70.98176001655037, 43.36789581966826],
                [-70.94416541205806, 43.46633942318431],
                [-71.08482, 45.3052400000002],
                [-70.6600225491012, 45.46022288673396],
                [-70.30495378282376, 45.914794623389355],
                [-70.00014034695016, 46.69317088478567],
                [-69.23708614772835, 47.44777598732787],
                [-68.90478084987546, 47.184794623394396],
                [-68.23430497910454, 47.35462921812177],
                [-67.79035274928509, 47.066248887716995],
                [-67.79141211614706, 45.702585354182816],
                [-67.13734351262877, 45.137451890638886]]]
            },
            'properties': {
                title: 'mapbox'
            }
        } as any
    });
})

const group = map.addLayerGroup('polygon-group');
group.add({
    'id': 'maine',
    'type': 'fill',
    'source': 'source-polygon',
    'layout': {},
    'paint': {
        'fill-color': '#088',
        'fill-opacity': 0.8
    }
});

group.add({
    'id': 'maine-line',
    type: 'line',
    source: 'source-polygon',
    layout: {},
    paint: {
        "line-color": 'red',
        "line-width": 3
    }
})

group.add({
    id: 'maine-symble',
    type: 'symbol',
    source: 'source-polygon',
    layout: {
        "text-field": ['get', 'title']
    },
    paint: {
    }
})

let pointMeasure = new MeasureLineString(map);
document.getElementById("measure-close")?.addEventListener('click', e => {
    pointMeasure.stop();
})

document.getElementById("measure-point")?.addEventListener('click', e => {
    pointMeasure.start();
})

document.getElementById("measure-clear")?.addEventListener('click', e => {
    pointMeasure.clear();
})