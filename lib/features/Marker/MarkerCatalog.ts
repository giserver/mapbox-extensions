import { Button, Card, NullAbleCSSStyleDeclaration, UIElementBase } from "../../uis";

type MarkerCatalogPage = "project-list" | "project-markers"

class PageManager<T extends string> {

    private pages = new Map<T, UIElementBase>();
    private declare currentPage: UIElementBase;
    private params?: Record<string, any>;

    /**
     *
     */
    constructor(pages: Record<T, UIElementBase>) {
        let first = true;
        for (let page_uri in pages) {
            const page = pages[page_uri];
            page.show = false;
            if (first) {
                this.currentPage = page;
                page.show = true;
                first = false;
            }

            this.pages.set(page_uri, pages[page_uri])
        }

        if (this.pages.size === 0)
            throw new Error("pages can not empty!");
    }

    to(uri: T, params?: Record<string, any>) {
        const page = this.pages.get(uri)!;
        this.currentPage.show = false;
        this.currentPage = page;
        this.currentPage.show = true;

        this.params = params;
    }

    getParam(key: string) {
        return this.params ? this.params[key] : undefined;
    }

    getPage<R extends UIElementBase>(uri: T): R {
        return this.pages.get(uri)! as R;
    }

    show(value: boolean = true) {
        this.currentPage.show = value;
    }
}

export default class MarkerCatalogManager extends UIElementBase {

    private pageManager: PageManager<MarkerCatalogPage>;

    /**
     *
     */
    constructor(parent: HTMLElement, style: NullAbleCSSStyleDeclaration) {

        super('div', {
            parent, style: {
                width: '300px',
                ...style
            }
        });

        const projectListPage = new Card.HCFCard({ parent: this, style: { minHeight: '400px' } });
        const projectMarkersPage = new Card.HCFCard({ parent: this, style: { minHeight: '400px' } });

        this.pageManager = new PageManager<MarkerCatalogPage>({
            'project-list': projectListPage,
            'project-markers': projectMarkersPage
        })

        const title = new UIElementBase("div", {
            parent: projectListPage.header,
            innerText: '标记'
        })

        const btn1 = new Button.ButtonBase({
            parent: projectListPage.header, type: 'primary', innerText: '添加项目', style: {
                color: 'white'
            }, clickEvent: e => {
                this.pageManager.to('project-markers');
            }
        });

        const close = new Button.Close({
            parent: projectListPage.header,
            style: {
                marginLeft: '20px'
            },
            size: 15
        })

        projectListPage.header.setStyle({
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            alignItems: 'center',
            marginBottom: '10px'
        })

        const content = new Card.CardBase({
            parent: projectListPage.content.element,
            innerText: '这里添加标记项目'
        })

        const btn2 = new Button.ButtonBase({
            parent: projectMarkersPage.header, type: 'primary', innerText: '回去', clickEvent: e => {
                this.pageManager.to('project-list');
            }
        })
    }
}