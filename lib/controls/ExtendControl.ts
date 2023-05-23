import mapboxgl from "mapbox-gl";
import { createHtmlElement } from "../utils";
import SvgBuilder from '../svg'

export type UIPostion = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface ExtendControlOptions {
    img1?: string | SVGElement,
    img2?: string | SVGAElement,
    content: HTMLElement | Array<HTMLElement> | ((map: mapboxgl.Map) => HTMLElement),
    position?: UIPostion
}

export default class ExtendControl implements mapboxgl.IControl {
    private minWidth = 600;
    private declare extendBtn: HTMLDivElement;
    private declare mobileContainer: HTMLDivElement;

    /**
     *
     */
    constructor(private options: ExtendControlOptions) {
        this.options.position ??= "top-right";
        const svg_extend_left = new SvgBuilder('extend_left').create();
        const svg_extend_right = new SvgBuilder('extend_right').create();

        this.options.img1 ??= this.options.position.endsWith("right") ? svg_extend_left : svg_extend_right;
        this.options.img2 ??= this.options.position.endsWith("right") ? svg_extend_right : svg_extend_left;;
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        const isMobile = map.getContainer().clientWidth < this.minWidth;
        const desktopContainer = createHtmlElement("div", "jas-ctrl-extend-desktop-container", this.options.position!);
        const mobileContainer = createHtmlElement('div', "jas-ctrl-extend-mobile-contianer");
        this.mobileContainer = mobileContainer;

        let currentContainer = mobileContainer;
        if (isMobile)
            desktopContainer.classList.add("jas-ctrl-hidden");
        else {
            mobileContainer.classList.add("jas-ctrl-hidden");
            currentContainer = desktopContainer;
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

        map.on('resize', e => {
            const width = map.getContainer().clientWidth;
            if (width < this.minWidth) {
                desktopContainer.classList.add("jas-ctrl-hidden");
                mobileContainer.classList.remove("jas-ctrl-hidden");

                if (desktopContainer.children.length !== 0)
                    mobileContainer.append(...desktopContainer.children);
            } else {
                mobileContainer.classList.add("jas-ctrl-hidden");
                desktopContainer.classList.remove("jas-ctrl-hidden");

                if (mobileContainer.children.length !== 0)
                    desktopContainer.append(...mobileContainer.children);
            }
        });

        console.log("extend-control", this)

        const extendBtn = createHtmlElement("div", "jas-ctrl-extend", "jas-flex-center", "jas-one-button-mapbox", "mapboxgl-ctrl", "mapboxgl-ctrl-group");
        this.extendBtn = extendBtn;
        extendBtn.append(image_open_wapper, image_close_wapper);
        extendBtn.append(desktopContainer);
        map.getContainer().append(mobileContainer);

        // 停止冒泡，防止执行extendBtn click事件
        desktopContainer.addEventListener('click', e => {
            e.stopPropagation();
        });

        extendBtn.addEventListener('click', e => {
            this.toggle();
        });

        return this.extendBtn;
    }
    onRemove(map: mapboxgl.Map): void {
    }

    getDefaultPosition() { return this.options.position! };

    toggle() {
        this.extendBtn.classList.toggle("jas-ctrl-extend-open");
        this.mobileContainer.classList.toggle("jas-ctrl-extend-mobile-contianer-active");
    }

    open() {
        this.extendBtn.classList.add("jas-ctrl-extend-open");
        this.mobileContainer.classList.add("jas-ctrl-extend-mobile-contianer-active");
    }

    close() {
        this.extendBtn.classList.remove("jas-ctrl-extend-open");
        this.mobileContainer.classList.remove("jas-ctrl-extend-mobile-contianer-active");
    }

    private appendImage(parent: HTMLDivElement, img: string | SVGElement) {
        if (typeof img === 'string')
            if (img.replace(/\s+/g, "").startsWith("<svg"))
                parent.innerHTML += img;
            else
                parent.style.backgroundImage = img;
        else
            parent.append(img);
    }
}