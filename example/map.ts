import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { dom } from 'wheater';
import calLength from '@turf/length';
import calArea from '@turf/area';

import {
    MeasureControl, Measure2Control, SwitchMapControl, BackToOriginControl, DoodleControl, SwitchLayerControl, MarkerControl, ExtendControl,
    SetStyleProxy, MBtnRoate, ExtendControlsWrapper, SwitchLayerGroupsType, LocationControl, ZoomControl, EyeControl, GridControl
} from '../lib';
import '../lib/index.css';

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
const mbtnRoate = new MBtnRoate(map);

const layerGroups: SwitchLayerGroupsType = {
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
            mutexIdentity: "mutex_test",
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
            mutexIdentity: "mutex_test",
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
            name: '测试7',
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
                            properties: { name: '测试7' }
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
    map.addControl(new LocationControl({ fractionDigits: 4 }));
    map.addControl(new ZoomControl());
    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric',//imperial'
    }), "top-left");
    map.addControl(new EyeControl(map, { layoutSync: true }));
    map.addControl(new GridControl({ show: true }));

    const content = dom.createHtmlElement("div", ["jas-ctrl-measure-mobile-operation-item"]);
    content.style.width = '200px';
    const titleSlot = dom.createHtmlElement('div');
    titleSlot.innerText = 'slot';
    map.addControl(new ExtendControl({
        content,
        closeable: true,
        title: "tittle",
        titleSlot
    }));

    const measure2Control = new Measure2Control({
        position: 'top-left', measureLineStringOptions: {
            tip: {
                message_drawing: "单击继续, 右击后退, 双击完成测量",
                message_before_drawing: `<div style="background-color:#ccc;color:red">单击开始测量</div>`
            }
        }
    });
    const switchLayerControl = new SwitchLayerControl({
        position: "top-left",
        layerGroups: {
            '可清除可全选': {
                uiType: 'SwitchBtn',
                collapse: true,
                defaultCollapsed: true,
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
            },
            "经纬度网格": {

                uiType: 'SwitchBtn',
                collapse: true,
                defaultCollapsed: false,
                layers: [{
                    name: "网格线",
                    layer: {
                        id: 'grid-layer',
                        'type': 'line',
                        "source": undefined
                    }
                }, {
                    name: "左侧纬度标签",
                    layer: {
                        'id': 'grid-text-left-layer',
                        'type': 'symbol',
                        "source": undefined
                    }
                }, {
                    name: "右侧纬度标签",
                    layer: {
                        'id': 'grid-text-right-layer',
                        'type': 'symbol',
                        "source": undefined
                    }
                }, {
                    name: "顶部经度标签",
                    layer: {
                        'id': 'grid-text-top-layer',
                        'type': 'symbol',
                        "source": undefined
                    }
                }, {
                    name: "底部经度标签",
                    layer: {
                        'id': 'grid-text-bottom-layer',
                        'type': 'symbol',
                        "source": undefined
                    }
                }]
            }
        }
    });

    map.addControl(measure2Control);
    map.addControl(switchLayerControl);

    const markerControl = new MarkerControl({
        markerOptions: {
            layers: [{
                id: "35ebd84f-1c75-42b3-ba76-568cac847cf5",
                name: "test",
                date: Date.now()
            }],
            featureCollection: { "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [[[120.33795166015392, 31.155843389096844], [120.33245849609165, 30.95466933754993], [120.68470764159827, 30.975865573909786], [120.64350891112883, 31.155843389096844], [120.33795166015392, 31.155843389096844]]] }, "properties": { "id": "2dae1cb3-f2f9-4c34-b500-8288ed258639", "name": "标注", "layerId": "35ebd84f-1c75-42b3-ba76-568cac847cf5", "date": 1703034323051, "style": { "textSize": 14, "textColor": "black", "textHaloColor": "white", "textHaloWidth": 1, "pointIcon": "标1.png", "pointIconColor": "#ff0000", "pointIconSize": 0.3, "lineColor": "#0000ff", "lineWidth": 3, "polygonColor": "#0000ff", "polygonOpacity": 0.5, "polygonOutlineColor": "#000000", "polygonOutlineWidth": 2 } }, "id": "2dae1cb3-f2f9-4c34-b500-8288ed258639" }, { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[120.2605379098901, 30.869971361182337], [120.38410169141792, 30.8711497871234], [120.48501211299799, 30.88764622882202], [120.57974434550329, 30.878220038493666], [120.66212019985676, 30.84581043692205], [120.72184269426003, 30.848167868226483]] }, "properties": { "id": "04abb291-814c-4ad1-9f98-6277cdcefd27", "name": "标注", "layerId": "35ebd84f-1c75-42b3-ba76-568cac847cf5", "date": 1703036360925, "style": { "textSize": 19, "textColor": "#00ffff", "textHaloColor": "#000000", "textHaloWidth": 1, "pointIcon": "标1.png", "pointIconColor": "#ff0000", "pointIconSize": 0.3, "lineColor": "#ff0000", "lineWidth": 6, "polygonColor": "#0000ff", "polygonOpacity": 0.5, "polygonOutlineColor": "#000000", "polygonOutlineWidth": 2 } }, "id": "04abb291-814c-4ad1-9f98-6277cdcefd27" }, { "type": "Feature", "geometry": { "type": "Point", "coordinates": [120.2530240890847, 31.09089416247764] }, "properties": { "id": "55942abd-dc73-4f45-9247-2a7926339bde", "name": "标注", "layerId": "35ebd84f-1c75-42b3-ba76-568cac847cf5", "date": 1703036400053, "style": { "textSize": 19, "textColor": "#00ffff", "textHaloColor": "#000000", "textHaloWidth": 1, "pointIcon": "标1.png", "pointIconColor": "#ff0000", "pointIconSize": 0.3, "lineColor": "#ff0000", "lineWidth": 6, "polygonColor": "#0000ff", "polygonOpacity": 0.5, "polygonOutlineColor": "#000000", "polygonOutlineWidth": 2 } }, "id": "55942abd-dc73-4f45-9247-2a7926339bde" }] },
            layerOptions: {
                extraInfo: f => {
                    const g = f.geometry;
                    if (g.type === 'LineString' || g.type === 'MultiLineString') {
                        let length = calLength(f, { units: 'meters' });
                        let units = 'm';
                        if (length > 1000) {
                            length = length / 1000;
                            units = 'km';
                        }
                        return `长度 : ${length.toFixed(2)} ${units}`;
                    } else if (g.type === 'Polygon' || g.type === 'MultiPolygon') {
                        let area = calArea(f);
                        let units = 'm²';
                        if (area > 1000000) {
                            area = area / 1000000;
                            units = 'km²';
                        }
                        return `面积 : ${area.toFixed(2)} ${units}`
                    }
                }
            }
        }
    });
    map.addControl(markerControl);
    markerControl.open = true;

    new ExtendControlsWrapper([measure2Control, switchLayerControl.extendControl]);
})