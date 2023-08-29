import mapboxgl from "mapbox-gl";
import { createHtmlElement } from "../utils";
import SvgBuilder from '../svg'

export type UIPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface ExtendControlOptions {
    img1?: string | SVGElement,
    img2?: string | SVGAElement,
    content: HTMLElement | Array<HTMLElement> | ((map: mapboxgl.Map) => HTMLElement),
    position?: UIPosition,
    mustBe?: "pc" | "mobile",
    title?: string,
    titleSlot?: HTMLElement,
    closeable?: boolean,

    onChange?(open: boolean): void
}

export default class ExtendControl implements mapboxgl.IControl {
    readonly element: HTMLDivElement = createHtmlElement("div", "jas-ctrl-extend", "jas-flex-center", "jas-one-button-mapbox", "mapboxgl-ctrl", "mapboxgl-ctrl-group");
    private mobileContainer: HTMLDivElement = createHtmlElement('div', "jas-ctrl-extend-mobile-contianer");
    private minWidth = 600;
    private _open: boolean = false;

    constructor(private options: ExtendControlOptions) {
        this.options.position ??= "top-right";
        const svg_extend_left = new SvgBuilder('extend_left').create();
        const svg_extend_right = new SvgBuilder('extend_right').create();

        this.options.img1 ??= this.options.position.endsWith("right") ? svg_extend_left : svg_extend_right;
        this.options.img2 ??= this.options.position.endsWith("right") ? svg_extend_right : svg_extend_left;
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        const isMobile = map.getContainer().clientWidth < this.minWidth;
        const desktopContainer = createHtmlElement("div", "jas-ctrl-extend-desktop-container", "mapboxgl-ctrl-group", this.options.position!);

        let currentContainer = this.mobileContainer;
        if (isMobile && this.options.mustBe !== 'pc')
            desktopContainer.classList.add("jas-ctrl-hidden");
        else {
            this.mobileContainer.classList.add("jas-ctrl-hidden");
            currentContainer = desktopContainer;
        }

        if (this.options.title || this.options.closeable || this.options.titleSlot) {
            const contianerHeader = createHtmlElement('div', "jas-ctrl-extend-container-header");
            const { title, closeable, titleSlot} = this.options;
            if (title) {
                const contianerHeaderTitle = createHtmlElement('div', "jas-ctrl-extend-container-header-title");
                contianerHeaderTitle.innerText = title;
                contianerHeader.append(contianerHeaderTitle);
            }

            if(titleSlot){
                const contianerHeaderTitleSlot = createHtmlElement('div',"jas-ctrl-extend-container-header-title-slot");
                contianerHeaderTitleSlot.append(titleSlot);
                contianerHeader.append(contianerHeaderTitleSlot);
            }

            if (closeable) {
                const contianerHeaderClose = createHtmlElement('div', "jas-ctrl-extend-container-header-close");
                contianerHeaderClose.innerHTML = new SvgBuilder('X').create();
                contianerHeaderClose.addEventListener('click', () => {
                    this.open = false;
                });

                contianerHeader.append(contianerHeaderClose);
            }

            currentContainer.append(contianerHeader);
        }

        if (this.options.content instanceof Array)
            currentContainer.append(...this.options.content);
        else if (typeof this.options.content === 'function')
            currentContainer.append(this.options.content(map));
        else
            currentContainer.append(this.options.content);

        const image_open_wapper = createHtmlElement('div', "jas-ctrl-extend-img-open");
        const image_close_wapper = createHtmlElement('div', "jas-ctrl-extend-img-close");

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

        // 停止冒泡，防止执行extendBtn click事件
        desktopContainer.addEventListener('click', e => {
            e.stopPropagation();
        });

        this.element.addEventListener('click', () => {
            this.open = !this.open;
        });

        return this.element;
    }
    onRemove(map: mapboxgl.Map): void {
        this.element.remove();
        this.mobileContainer.remove();
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

        this.options.onChange?.call(undefined, value);
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