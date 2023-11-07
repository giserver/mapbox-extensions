import mapboxgl from "mapbox-gl";
import * as wheater from 'wheater';
import { svg, types, language, ILanguageOptions } from "../common";
import { AbstractExtendControl } from '../controls/ExtendControl';
import MarkerManager, { MarkerManagerOptions } from "../features/marker/MarkerManager";
import { getMapMarkerSpriteImages } from "../features/marker/symbol-icon";

export interface MarkerControlOptions {
    icon?: string | SVGElement
    position?: types.UIPosition,
    markerOptions?: MarkerManagerOptions,
    resetLang?: ILanguageOptions,
    changeLang?: Partial<ILanguageOptions>
}

export async function createGiserverMarkerManagerOptions(url: string, tenantId: string): Promise<MarkerManagerOptions> {
    function composeUrl(u: string, q?: wheater.types.TUrlQuery) {
        return url + (url.endsWith('/') ? "" : "/") + u + "?" + wheater.common.composeUrlQuery(q);
    }

    return {
        "featureCollection": await (await fetch(composeUrl("markers", { tenantId }))).json(),
        "layers": await (await fetch(composeUrl('layers', { tenantId }))).json(),
        "layerOptions": {
            "onCreate": p => {
                const pars = { ...p, tenantId }
                fetch(composeUrl('layers'), {
                    'method': 'POST',
                    body: JSON.stringify(pars),
                    headers: new Headers({
                        'Content-Type': 'application/json',
                    })
                })
            },
            "onRemove": p => {
                fetch(composeUrl(`layers/${p.id}`), {
                    'method': 'DELETE',
                })
            },
            "onRename": p => {
                fetch(composeUrl(`layers`), {
                    'method': 'PUT',
                    body: JSON.stringify(p),
                    headers: new Headers({
                        'Content-Type': 'application/json',
                    })
                })
            },

            "markerItemOptions": {
                "onCreate": p => {
                    const pars = {
                        ...p.properties,
                        tenantId,
                        geom: p.geometry
                    }
                    fetch(composeUrl('markers'), {
                        'method': 'POST',
                        body: JSON.stringify(pars),
                        headers: new Headers({
                            'Content-Type': 'application/json',
                        })
                    })

                },
                "onRemove": p => {
                    fetch(composeUrl(`markers/${p.properties.id}`), {
                        'method': 'DELETE',
                    })
                },
                "onUpdate": p => {
                    const pars = {
                        ...p.properties,
                        tenantId,
                        geom: p.geometry
                    }
                    fetch(composeUrl('markers'), {
                        'method': 'PUT',
                        body: JSON.stringify(pars),
                        headers: new Headers({
                            'Content-Type': 'application/json',
                        })
                    })
                }
            }
        }
    }
}

export class MarkerControl extends AbstractExtendControl {
    private declare _markerManager: MarkerManager;

    get markerManager() {
        return this._markerManager;
    }

    /**
     *
     */
    constructor(private ops: MarkerControlOptions = {}) {
        ops.icon ??= new svg.SvgBuilder('flag').create();
        ops.position ??= 'top-right';
        ops.markerOptions ??= {};
        ops.markerOptions.drawAfterOffset ??= ops.position.endsWith("right") ? [-400, 0] : [400, 0];

        language.reset(ops.resetLang);
        language.change(ops.changeLang);

        super({
            title: language.lang.title,
            closeable: true,
            ...ops,
            img1: ops.icon
        });
    }

    createContent() {
        return (map: mapboxgl.Map) => {
            getMapMarkerSpriteImages(images => {
                images.forEach((v, k) => {
                    map.addImage(k, v.data, { sdf: true });
                });
            });

            this._markerManager = new MarkerManager(map, this.ops.markerOptions);

            this.emitter.on('openChange', open => {
                this._markerManager.setGeometryVisible(open);
            });

            return this._markerManager.htmlElement;
        }
    }

    onRemove(map: mapboxgl.Map): void {
        super.onRemove(map);

        this.markerManager.destroy();
    }
}