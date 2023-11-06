import mapboxgl from "mapbox-gl";
import { dom } from 'wheater';
import SvgBuilder from '../common/svg'
import mitt from "mitt";

export type UIPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export type ExtendControlContentType = HTMLElement | Array<HTMLElement> | ((map: mapboxgl.Map) => HTMLElement);

export interface ExtendControlOptions {
    img1?: string | SVGElement,
    img2?: string | SVGAElement,
    content: ExtendControlContentType,
    position?: UIPosition,
    mustBe?: "pc" | "mobile",
    title?: string,
    titleSlot?: HTMLElement,
    closeable?: boolean,
}

export abstract class AbstractExtendControl implements mapboxgl.IControl {
    readonly element: HTMLDivElement = dom.createHtmlElement("div", ["jas-ctrl-extend", "jas-flex-center", "jas-one-button-mapbox", "mapboxgl-ctrl", "mapboxgl-ctrl-group"]);
    readonly mobileContainer: HTMLDivElement = dom.createHtmlElement('div', ["jas-ctrl-extend-mobile-contianer"]);
    readonly emitter = mitt<{ "openChange": boolean }>();

    protected readonly minWidth = 600;
    private _open: boolean = false;

    constructor(private options: Omit<ExtendControlOptions, "content">) {
        this.options.position ??= "top-right";
        const svg_extend_left = new SvgBuilder('extend_left').create();
        const svg_extend_right = new SvgBuilder('extend_right').create();

        this.options.img1 ??= this.options.position.endsWith("right") ? svg_extend_left : svg_extend_right;
        this.options.img2 ??= this.options.position.endsWith("right") ? svg_extend_right : svg_extend_left;
    }

    protected abstract createContent(): ExtendControlContentType;

    onAdd(map: mapboxgl.Map): HTMLElement {

        const isMobile = map.getContainer().clientWidth < this.minWidth;
        const desktopContainer = dom.createHtmlElement("div", ["jas-ctrl-extend-desktop-container", "mapboxgl-ctrl-group", this.options.position!]);

        let currentContainer = this.mobileContainer;
        if (isMobile && this.options.mustBe !== 'pc')
            desktopContainer.classList.add("jas-ctrl-hidden");
        else {
            this.mobileContainer.classList.add("jas-ctrl-hidden");
            currentContainer = desktopContainer;
        }

        if (this.options.title || this.options.closeable || this.options.titleSlot) {
            const { title, closeable, titleSlot } = this.options;
            const contianerHeader = dom.createHtmlElement('div', ["jas-ctrl-extend-container-header"]);
            if (title) {
                contianerHeader.append(dom.createHtmlElement('div', ["jas-ctrl-extend-container-header-title"], [title]));
            }

            if (titleSlot) {
                contianerHeader.append(dom.createHtmlElement('div', ["jas-ctrl-extend-container-header-title-slot"], [titleSlot]));
            }

            if (closeable) {
                contianerHeader.append(dom.createHtmlElement('div',
                    ["jas-ctrl-extend-container-header-close"],
                    [new SvgBuilder('X').create('svg')], {
                    onClick: () => {
                        this.open = false;
                    }
                }));
            }

            currentContainer.append(contianerHeader);
        }

        const content = this.createContent();

        if (content instanceof Array)
            currentContainer.append(...content);
        else if (typeof content === 'function')
            currentContainer.append(content(map));
        else
            currentContainer.append(content);

        const image_open_wapper = dom.createHtmlElement('div', ["jas-ctrl-extend-img-open"]);
        const image_close_wapper = dom.createHtmlElement('div', ["jas-ctrl-extend-img-close"]);
        this.appendImage(image_open_wapper, this.options.img1!);
        this.appendImage(image_close_wapper, this.options.img2!);

        map.on('resize', _ => {
            if (this.options.mustBe) return;

            const width = map.getContainer().clientWidth;
            if (width < this.minWidth) {
                desktopContainer.classList.add("jas-ctrl-hidden");
                this.mobileContainer.classList.remove("jas-ctrl-hidden");

                if (desktopContainer.children.length !== 0)
                    this.mobileContainer.append(...desktopContainer.children);
            } else {
                this.mobileContainer.classList.add("jas-ctrl-hidden");
                desktopContainer.classList.remove("jas-ctrl-hidden");

                if (this.mobileContainer.children.length !== 0)
                    desktopContainer.append(...this.mobileContainer.children);
            }
        });

        this.element.append(image_open_wapper, image_close_wapper);
        this.element.append(desktopContainer);
        map.getContainer().append(this.mobileContainer);
        
        this.element.addEventListener('click', () => {
            this.open = !this.open;
        });
        this.element.title = this.options.title || "";

        // 停止冒泡
        desktopContainer.addEventListener('click', e => {
            e.stopPropagation();
        });
        desktopContainer.title = "";

        return this.element;
    }
    onRemove(map: mapboxgl.Map): void {
        this.element.remove();
        this.mobileContainer.remove();
        this.emitter.all.clear();
    }

    getDefaultPosition() { return this.options.position! };

    get open() {
        return this._open;
    }

    set open(value: boolean) {
        if (value === this._open) return;

        if (value) {
            this.element.classList.add("jas-ctrl-extend-open");
            this.mobileContainer.classList.add("jas-ctrl-extend-mobile-contianer-active");
        } else {
            this.element.classList.remove("jas-ctrl-extend-open");
            this.mobileContainer.classList.remove("jas-ctrl-extend-mobile-contianer-active");
        }

        this.emitter.emit('openChange', value);
        this._open = value;
    }

    private appendImage(parent: HTMLDivElement, img: string | SVGElement) {
        if (typeof img === 'string')
            if (img.replace(/\s+/g, "").startsWith("<svg"))
                parent.innerHTML += img;
            else {
                const style = parent.style;
                style.height = "100%";
                style.width = "100%";
                style.backgroundImage = `url('${img}')`;
                style.backgroundRepeat = 'no-repeat';
                style.backgroundSize = "100%"
            }
        else
            parent.append(img);
    }
}

export default class ExtendControl extends AbstractExtendControl {

    constructor(private ops: ExtendControlOptions) {
        super(ops);
    }

    createContent(): ExtendControlContentType {
        return this.ops.content;
    }
}