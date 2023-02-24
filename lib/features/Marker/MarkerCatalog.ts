

import { Geometry, Feature, BBox } from "geojson";
import { Button, Card, NullAbleCSSStyleDeclaration, UIElementBase } from "../../uis";

export interface GeometryProperties {
    type: 'Point' | 'Line' | 'Polygon',
    title: string,
    remark?: string
}
export interface PointProperties extends GeometryProperties {
    type: 'Point',
}

export interface LineProperties extends GeometryProperties {
    type: 'Line',
    'line-width': number,
    'line-color': string,
}

export interface PolygonProperties extends GeometryProperties {
    type: 'Polygon',
    'fill-color': string,
    'fill-opacity': number,
    'out-line-color': string,
    'out-line-width': number,
}

export type AnyProperties = PointProperties | LineProperties | PolygonProperties

export class MarkerInfo implements Feature<Geometry, AnyProperties> {
    type: "Feature" = "Feature";
    id?: string | number | undefined;
    bbox?: BBox | undefined;

    /**
     *
     */
    constructor(public geometry: Geometry, public properties: AnyProperties) {

    }
}


export class MarkerProject {

    /**
     *
     */
    constructor(
        readonly id: string,
        name: string,
        readonly createDate: Date = new Date(),
        readonly markers: MarkerInfo[] = new Array<MarkerInfo>()) {
    }
}

export class MarkerContext {

    /**
     *
     */
    constructor(private map: mapboxgl.Map, private projects: Array<MarkerProject>) {

    }
}

export default class MarkerCatalogManager extends UIElementBase {
    private readonly project_list = "project-list";
    private readonly project_markers = "project-markers";

    private pages = new Map<string, UIElementBase>();
    private currentPage: UIElementBase;

    /**
     *
     */
    constructor(parent: HTMLElement, style: NullAbleCSSStyleDeclaration) {

        super('div', { parent, style });

        const page_list = new Card.HCFCard({ parent: this.element });
        const page_markers = new Card.HCFCard({ parent: this.element });

        this.pages.set(this.project_list, page_list);
        this.pages.set(this.project_markers, page_markers);

        page_markers.show = false;

        const title = new UIElementBase("div", {
            parent: page_list.header.element,
            innerText: '标记'
        })

        const btn1 = new Button.ButtonBase({
            parent: page_list.header.element, type: 'primary', innerText: '添加项目', style: {
                color: 'white'
            }, clickEvent: e => {
                this.pushUri(this.project_markers);
            }
        });

        const close = new UIElementBase("div", {
            parent: page_list.header.element,
            innerText: 'X',
            style: {
                marginLeft: '5px'
            }
        })

        page_list.header.setStyle({
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            alignItems: 'center',
            marginBottom: '10px'
        })

        const content = new Card.CardBase({
            parent: page_list.content.element,
            innerText: '这里添加标记项目'
        })

        const btn2 = new Button.ButtonBase({
            parent: page_markers.element, type: 'primary', innerText: '回去', clickEvent: e => {
                this.pushUri(this.project_list);
            }
        })

        this.currentPage = this.pages.get(this.project_list)!;
    }

    pushUri(uri: string) {
        this.currentPage.show = false;
        const showPage = this.pages.get(uri)!;
        showPage.show = true;
        this.currentPage = showPage;
    }
}