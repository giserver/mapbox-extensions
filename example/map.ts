import '../lib';
import mapboxgl from 'mapbox-gl';
import MeasureControl from '../lib/controls/MeasureControl';
import SwitchMapControl from '../lib/controls/SwitchMapControl';
import BackToOriginControl from '../lib/controls/BackToOriginControl';
import DoodleControl from '../lib/controls/DoodleControl';
import { Measure4Mobile } from '../lib';

const darkStyle = "mapbox://styles/mapbox/dark-v10";
const lightStyle = 'mapbox://styles/mapbox/light-v11';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w';

const map = new mapboxgl.Map({
    container: 'map',
    zoom: 10,
    center: [120.5, 31],
    pitch: 0,
    style: lightStyle
});

const is_mobile = getQueryVariable("mobile");

if (is_mobile) {
    let show = false;

    map.on('load', () => {
        const measureMobile = new Measure4Mobile(map, document.body, { show });

        const changeMeasureShowBtn = document.createElement('button');
        changeMeasureShowBtn.innerText = "change"
        const style = changeMeasureShowBtn.style;
        style.position = "absolute";
        style.zIndex = "99";
        style.top = '0';

        changeMeasureShowBtn.addEventListener('click', () => {
            show = !show;
            measureMobile.show(show);
        })
        document.body.append(changeMeasureShowBtn);
    })
} else {
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
        onStart: () => { measureControl.stop() },
        onDrawed: polygon => { setTimeout(() => { alert(JSON.stringify(polygon)) }, 200) }
    })

    map.on('load', () => {

        // 切换卫星影像 可以自定义图层
        map.addControl(new SwitchMapControl({
            satelliteOption: {
                textColor: 'white',
                //backgroundImage: '/relics.png'
            },
            extra: {
                layerGroups: {
                    '城市规划': {
                        uiType: 'SwitchBtn',
                        mutex: true, layers: [{
                            name: '房屋管理',
                            layer: {
                                id: 'fff',
                                type: 'symbol',
                                source: {
                                    type: 'geojson',
                                    data: {
                                        type: 'Feature',
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [120.5, 31.1]
                                        },
                                        properties: { name: '房屋1' }
                                    }
                                },
                                layout: {
                                    'text-field': ['get', 'name']
                                }
                            },
                            'backgroundImage': '/house-user.png',
                            active: true
                        }, {
                            name: '建筑群',
                            layer: {
                                id: 'fff1',
                                type: 'symbol',
                                source: {
                                    type: 'geojson',
                                    data: {
                                        type: 'Feature',
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [120.51, 31.2]
                                        },
                                        properties: { name: '建筑群1' }
                                    }
                                },
                                layout: {
                                    "text-field": ['get', 'name']
                                }
                            },
                            'backgroundImage': '/building.png',
                        }, {
                            name: '水路规划',
                            layer: {
                                id: 'fff2',
                                type: 'symbol',
                                source: {
                                    type: 'geojson',
                                    data: {
                                        type: 'Feature',
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [120.52, 31.1]
                                        },
                                        properties: { name: '水路1' }
                                    }
                                },
                                layout: {
                                    "text-field": ['get', 'name']
                                }
                            },
                            'backgroundImage': '/wetland.png',
                        }, {
                            name: '公路规划',
                            layer: {
                                id: 'fff3',
                                type: 'symbol',
                                source: {
                                    type: 'geojson',
                                    data: {
                                        type: 'Feature',
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [120.53, 31.2]
                                        },
                                        properties: { name: '公路1' }
                                    }
                                },
                                layout: {
                                    "text-field": ['get', 'name']
                                }
                            },
                            'backgroundImage': '/road.png',
                            easeToOptions: {
                                center: [120.53, 31.2]
                            }
                        }]
                    }, '乡村建设': {
                        mutex: false, layers: [{
                            name: 'fff4',
                            layer: {
                                id: 'fff4',
                                type: 'symbol',
                                source: {
                                    type: 'geojson',
                                    data: {
                                        type: 'Feature',
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [120.54, 31.1]
                                        },
                                        properties: { name: 'fff4' }
                                    }
                                },
                                layout: {
                                    "text-field": ['get', 'name']
                                }
                            },
                            'backgroundImage': '',
                            mutex: true
                        }, {
                            name: 'fff5',
                            layer: {
                                id: 'fff5',
                                type: 'symbol',
                                source: {
                                    type: 'geojson',
                                    data: {
                                        type: 'Feature',
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [120.6, 31.2]
                                        },
                                        properties: { name: 'fff5' }
                                    }
                                },
                                layout: {
                                    "text-field": ['get', 'name'],
                                    'text-size': 30,
                                }
                            },
                            'backgroundImage': '',
                            active: true,
                        }, {
                            name: 'fff6',
                            layer: {
                                id: 'fff6',
                                type: 'symbol',
                                source: {
                                    type: 'geojson',
                                    data: {
                                        type: 'Feature',
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [120.6, 31.1]
                                        },
                                        properties: { name: 'fff6' }
                                    }
                                },
                                layout: {
                                    "text-field": ['get', 'name'],
                                    'text-size': 30
                                }
                            },
                            'backgroundImage': '',
                            active: true,
                        }, {
                            name: 'fff7',
                            layer: [
                                {
                                    id: 'fff7',
                                    type: 'symbol',
                                    source: {
                                        type: 'geojson',
                                        data: {
                                            type: 'Feature',
                                            geometry: {
                                                type: 'Point',
                                                coordinates: [120.64, 31.2]
                                            },
                                            properties: { name: 'fff7' }
                                        }
                                    },
                                    layout: {
                                        "text-field": ['get', 'name'],
                                        'text-size': 30
                                    },
                                    paint: {
                                        "text-color": 'red'
                                    }
                                }, {
                                    id: 'fff8',
                                    type: 'symbol',
                                    source: {
                                        type: 'geojson',
                                        data: {
                                            type: 'Feature',
                                            geometry: {
                                                type: 'Point',
                                                coordinates: [120.64, 31.1]
                                            },
                                            properties: { name: 'fff8' }
                                        }
                                    },
                                    layout: {
                                        "text-field": ['get', 'name'],
                                        'text-size': 30
                                    },
                                    paint: {
                                        "text-color": 'red'
                                    }
                                }
                            ],
                            'backgroundImage': '',
                            active: true
                        }]
                    }
                }
            }
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

        //map.addControl(new mapboxgl.NavigationControl())

        map.addControl(doodleControl);
    })

    map.addControl(measureControl);
    map.addControl(new BackToOriginControl());
}



function getQueryVariable(variable: string) {
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] === variable)
            return pair[1];
    }
}