import { creator, deep } from 'wheater';
import booleanClockwise from '@turf/boolean-clockwise';

import { units, calMeasure } from '@giserver/common';
import { Drawer, DrawType } from "@giserver/draw";

type TMeasureUnits = {
    area: units.TUnitsArea | "M2KM2",
    length: units.TUnitsLength | "MKM",
}

export class MeasureManager extends Drawer {
    /**
     * 测量id
     * 
     * 用于创建标注文字id
     */
    readonly id = creator.uuid();

    /**
     * 面方向图层id
     * 
     * 用于创建面方向layer和source
     */
    readonly id_polygon_clockwise = creator.uuid();

    /**
     * 存放所有待测量的数据
     * 
     * DrawType中存储measure manager内部绘制的数据
     * 
     * custom存储外部设置的数据
     */
    private featuresMap = new Map<DrawType | "custom", GeoJSON.FeatureCollection>();

    /**
     * 测量单位
     */
    private units: TMeasureUnits;

    /**
     * 不同单位的精度，执行number类型的toFix(precisions)方法
     */
    private precisions: Map<units.TUnitsLength | units.TUnitsArea, number>;

    /**
     * 是否进行面边界线的测量
     */
    private polygonDistance: boolean = true;

    constructor(private map: mapboxgl.Map) {
        const refreshMeasureData = (type: DrawType, fc: GeoJSON.FeatureCollection) => {
            this.featuresMap.set(type, fc);
            this.reRender();
        };

        super(map, {
            point: {
                onRender: refreshMeasureData
            },
            lineString: {
                onRender: refreshMeasureData
            },
            polygon: {
                onRender: refreshMeasureData
            },
            onStart: () => {
                this.map.moveLayer(this.id_polygon_clockwise);
                this.map.moveLayer(this.id);
            },
            onClear: () => {
                this.featuresMap.clear();
                this.reRender();
            }
        });


        /**
         * 添加测量数值图层
         */
        map.addLayer({
            id: this.id,
            type: 'symbol',
            source: {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            },
            layout: {
                "text-field": ['get', 'value'],
                'text-size': ['case',
                    ['boolean', ['get', 'center'], false], 12,
                    ['==', ['get', 'type'], 'Polygon'], 16, 14],
            },
            paint: {
                'text-color': ['case',
                    ['boolean', ['get', 'center'], false], 'red', 'black'],
                'text-halo-color': 'white',
                'text-halo-width': 2
            }
        });

        /**
         * 添加面方向图层
         */
        map.addLayer({
            id: this.id_polygon_clockwise,
            type: 'symbol',
            source: {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            },
            layout: {
                'symbol-placement': 'line',
                'text-field': ['case', ['boolean', ['get', 'clockwise'], true], '▶', '◀'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 12, 16, 22, 24],
                'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 12, 30, 22, 60],
                'text-keep-upright': false
            },
            paint: {
                'text-color': '#3887be',
                'text-halo-color': 'hsl(55, 11%, 96%)',
                'text-halo-width': 3
            },
            filter: ['==', '$type', 'Polygon']
        });

        this.units = {
            area: 'M2KM2',
            length: 'MKM'
        };
        this.precisions = new Map<units.TUnitsLength | units.TUnitsArea, number>([
            ['M', 1],
            ['KM', 2],
            ['M2', 2],
            ['MU', 2],
            ['KM2', 2]
        ]);

    }

    /**
     * 设置测量数据
     * @param fs
     */
    setFeature(f: GeoJSON.Feature) {
        const feature = deep.clone(f);
        // 计算顺时针
        // TODO: 需要考虑MultiPolygon
        if (feature.geometry.type === 'Polygon')
            (feature.properties as any)['clockwise'] = booleanClockwise(feature.geometry.coordinates[0]);

        const features = this.featuresMap.get('custom')?.features;

        if (features) {
            const existedFeature = features.find(x => x.id && x.id === f.id);
            if (existedFeature) {
                existedFeature.geometry = feature.geometry;
                existedFeature.properties = feature.properties;
            } else {
                features.push(feature);
            }
        }
        else
            this.featuresMap.set('custom', { type: 'FeatureCollection', "features": [feature] });

        this.reRender();
    }

    /**
     * 删除测量数据
     * @param id 
     */
    delFeature(id: string) {
        let re = false;
        this.featuresMap.forEach(fc => {
            const index = fc.features.findIndex(x => x.id === id);
            if (index) {
                fc.features.splice(index, 1);
                re = true;
            }
        });

        if (re) this.reRender();
    }

    /**
     * 设置单位，只应用units参数中有值的数据
     * @param units 
     * @returns 
     */
    setUnits(units: Partial<TMeasureUnits>) {
        let re = false;

        for (const p in units) {
            const u = (units as any)[p];
            if (u) {
                (this.units as any)[p] = u;
                re = true;
            }
        }

        if (re) this.reRender();
    }

    /**
     * 设置单位精度
     * @param units 
     * @param precision
     */
    setPrecision(units: units.TUnitsLength | units.TUnitsArea, precision: number) {
        this.precisions.set(units, precision);
        this.reRender();
    }

    /**
     * 设置是否显示面方向
     * @param val 
     */
    showPolygonDirection(val: boolean) {
        this.map.setLayoutProperty(this.id_polygon_clockwise, "visibility", val ? "visible" : 'none');
    }

    /**
     * 是否显示面的长度数据（边界线的测量）
     * @param val 
     */
    showPolygonDistance(val: boolean) {
        this.polygonDistance = val;
        this.reRender();
    }

    /**
     * 显示段数据
     * @param val 
     */
    showSegment(val: boolean) {
        this.map.setFilter(this.id,
            val ? undefined : ['!', ['boolean', ['get', 'center'], false]]);
    }

    /**
     * 重绘
     */
    reRender() {
        const features = new Array<GeoJSON.Feature>();
        this.featuresMap.forEach(x => {
            features.push(...x.features);
        });

        (this.map.getSource(this.id) as mapboxgl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: calMeasure(features, {
                polygon: {
                    measureLineStringOptions: {
                        withStart: false,
                        format: (len, i, end, center) => {
                            let u = this.units.length;

                            if (u === 'MKM')
                                if (len > 1000) u = 'KM';
                                else u = 'M';

                            len = units.convertLength(len, 'M', u);
                            const val = len.toFixed(this.precisions.get(u)) + ` ${units.unitsLengthDescriptions.find(x => x.value === u)?.label}`;
                            return end ? `终点: ${val}` : val;
                        }
                    },
                    withLineString: this.polygonDistance,
                    format: area => {
                        let u = this.units.area;

                        if (u === 'M2KM2')
                            if (area > 1000000) u = 'KM2';
                            else u = 'M2';

                        area = units.convertArea(area, 'M2', u);

                        const val = area.toFixed(this.precisions.get(u)) + ` ${units.unitsAreaDescriptions.find(x => x.value === u)?.label}`;
                        return val;
                    }
                },
                lineString: {
                    format: (len, i, end, center) => {

                        let u = this.units.length;

                        if (u === 'MKM')
                            if (len > 1000) u = 'KM';
                            else u = 'M';

                        len = units.convertLength(len, 'M', u);
                        const val = len.toFixed(this.precisions.get(u)) + ` ${units.unitsLengthDescriptions.find(x => x.value === u)?.label}`;
                        return val;
                    }
                },
                point: {
                }
            })
        });

        (this.map.getSource(this.id_polygon_clockwise) as mapboxgl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features
        });
    }
}