import '../lib';
import mapboxgl from 'mapbox-gl';
import MeasureControl from '../lib/controls/MeasureControl';
import Measure2Control from '../lib/controls/Measure2Control';
import SwitchMapControl from '../lib/controls/SwitchMapControl';
import BackToOriginControl from '../lib/controls/BackToOriginControl';
import DoodleControl from '../lib/controls/DoodleControl';
import SwitchLayerControl from '../lib/controls/SwitchLayerControl';
import { ExtendControl, SetStyleProxy } from '../lib';

import '../lib/index.css';
import { createHtmlElement } from '../lib/utils';
import { LayerGroupsType } from '../lib/features/SwitchLayer/types';

const darkStyle = "mapbox://styles/mapbox/dark-v10";
const lightStyle = 'mapbox://styles/mapbox/light-v11';
let currentStyle = lightStyle;

mapboxgl.accessToken = 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w';

const map = new mapboxgl.Map({
    container: 'map',
    zoom: 10,
    center: [120.5, 31],
    pitch: 0,
    style: currentStyle,
    attributionControl: false
});

const setStyleProxy = new SetStyleProxy(map);

const layerGroups: LayerGroupsType = {
    '城市规划': {
        uiType: 'SwitchBtn',
        mutex: true,
        layers: [{
            name: '房屋管理',
            layer: [{
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
            }],
            'backgroundImage': './assets/house-user.png',
            active: true
        }, {
            name: '建筑群',
            layer: [{
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
            }],
            'backgroundImage': './assets/building.png',
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
            'backgroundImage': './assets/wetland.png',
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
            'backgroundImage': './assets/road.png',
            easeToOptions: {
                center: [120.53, 31.2]
            }
        }]
    }, '乡村建设': {
        collapse: true,
        mutex: false,
        layers: [{
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
            'backgroundImage': './assets/house-user.png',
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
            'backgroundImage': './assets/building.png',
            'backgroundImageActive': './assets/building-active.png',
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
        }, {
            name: 'fff10',
            layer: [
                {
                    id: 'fff11',
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
                    id: 'fff12',
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
};


let doodleControl: DoodleControl;
let measureControl: MeasureControl;

// 测量
measureControl = new MeasureControl({
    horizontal: true,
    geometryClick: true,
    onGeometryCopy: (geom: string) => { alert(`复制成功 : ${geom}`) },
    onFeatureDelete: (id: string) => { alert(`删除成功 : ${id}`) },
    onStart: () => { doodleControl.stop() },
    onStop: () => { console.log("measure stop") },
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
    const switchMapControl = new SwitchMapControl({
        extra: {
            layerGroups
        }
    });
    map.addControl(switchMapControl);
    switchMapControl.adaptMobile();

    // 加载多个图片
    map.addImages({ 'img1': './assets/relics.png', 'img2': './assets/relics.png' }, () => {
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

    map.addControl(measureControl);
    map.addControl(new BackToOriginControl());
    map.addControl(doodleControl);

    const content = createHtmlElement("div", "jas-ctrl-measure-mobile-operation-item");
    content.style.width = '200px';
    const titleSlot = createHtmlElement('div');
    titleSlot.innerText = 'slot';
    map.addControl(new ExtendControl({
        content,
        closeable:true,
        title: "tittle",
        titleSlot
    }));

    map.addControl(new Measure2Control({position:'top-left'}));

    map.addControl(new SwitchLayerControl({
        position: "top-left",
        layerGroups: {
            '可清除可全选': {
                uiType: 'SwitchBtn',
                layers: [{
                    name: "xxx",
                    layer: {
                        id: 'kqc_1',
                        type: 'symbol',
                        source: {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [120.54, 30.9]
                                },
                                properties: { name: '可清除' }
                            }
                        },
                        layout: {
                            "text-field": ['get', 'name']
                        }
                    }
                }, {
                    name: "xxx1",
                    layer: {
                        id: 'kqc_2',
                        type: 'symbol',
                        source: {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [120.65, 30.9]
                                },
                                properties: { name: '可清除12' }
                            }
                        },
                        layout: {
                            "text-field": ['get', 'name']
                        }
                    }
                }]
            }
        }
    }));
})