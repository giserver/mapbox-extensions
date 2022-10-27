import '../lib';
import mapboxgl from 'mapbox-gl';
import MeasureControl from '../lib/controls/MeasureControl';

const darkStyle = "mapbox://styles/mapbox/dark-v10";
const lightStyle = 'mapbox://styles/mapbox/streets-v11';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w';

const map = new mapboxgl.Map({
    container: 'map',
    zoom: 5,
    center: [0, 0],
    pitch: 0,
    style: lightStyle
});

map.on('load', () => {
    map.addSource("polygon1", {
        type: 'geojson',
        data: {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [[
                    [0, 0],
                    [0, 2],
                    [-3, 2],
                    [-3, 0],
                ]]
            },
            'properties': {
                title: 'mapbox'
            }
        } as any
    });

    map.addSource("polygon2", {
        type: 'geojson',
        data: {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [[
                    [0, -1],
                    [0, 1],
                    [-2, 1],
                    [-2, -1],
                ]]
            },
            'properties': {
                title: 'mapbox'
            }
        } as any
    });

    map.addSource("polygon3", {
        type: 'geojson',
        data: {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [[
                    [2, -2],
                    [2, 1],
                    [-1, 1],
                    [-1, -2],
                ]]
            },
            'properties': {
                title: 'mapbox'
            }
        } as any
    });

    map.addLayer({
        'id': 'red',
        'type': 'fill',
        'source': 'polygon1',
        'layout': {},
        'paint': {
            'fill-color': 'red',
            'fill-opacity': 0.8
        }
    })

    map.addLayer({
        'id': 'green',
        'type': 'fill',
        'source': 'polygon2',
        'layout': {},
        'paint': {
            'fill-color': 'green',
            'fill-opacity': 0.8
        }
    })

    map.addLayer({
        'id': 'blue',
        'type': 'fill',
        'source': 'polygon3',
        'layout': {},
        'paint': {
            'fill-color': 'blue',
            'fill-opacity': 0.8
        }
    })

    map.addLayer({
        'id': 'yellow',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [5, 5],
                        [5, 6],
                        [4, 6],
                        [4, 5],
                    ]]
                },
                'properties': {
                    title: 'mapbox'
                }
            } as any
        },
        'layout': {},
        'paint': {
            'fill-color': 'yellow',
            'fill-opacity': 0.8
        }
    })
})

const layerIds = ['red', 'green', 'blue', 'yellow'];
map.on('click', layerIds, e => {
    let maxIndex = 0;
    let maxId = "";

    e.features?.forEach(x => {
        const li = x.layer.id;
        const index = map.getStyle().layers.findIndex(y => y.id === li);

        if (index > maxIndex) {
            maxId = li;
            maxIndex = index;
        }
    });

    console.log(maxId);
});

let changed = false;

document.getElementById("ctrl-change")?.addEventListener('click', () => {

    if (changed) {
        map.moveLayer('blue');
    }
    else {
        map.moveLayer('red');
    }

    changed = !changed;
});

const measureControl = new MeasureControl({
    geometryClick: true,
    measurePolygonOptions: {
        onDrawed: (id, geometry) => { console.log(id, JSON.stringify(geometry)) }
    }
});

map.addControl(measureControl);