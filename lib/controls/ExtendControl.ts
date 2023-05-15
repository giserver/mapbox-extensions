import mapboxgl from "mapbox-gl";
import { createHtmlElement } from "../utils";


export interface ExtendControlOptions {
    img1?: string | SVGElement,
    img2?: string | SVGAElement,
    content?: HTMLElement,

}

export default class ExtendControl implements mapboxgl.IControl {

    private img_close = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7329" width="16" height="16"><path d="M540.245333 485.717333L199.850667 50.773333A21.162667 21.162667 0 0 0 183.04 42.666667H79.957333A10.666667 10.666667 0 0 0 71.68 59.904L425.472 512 71.594667 964.096a10.666667 10.666667 0 0 0 8.448 17.237333h102.997333c6.570667 0 12.8-3.072 16.810667-8.106666l340.48-434.858667a42.666667 42.666667 0 0 0 0-52.650667z m405.333334 0L605.184 50.773333A21.162667 21.162667 0 0 0 588.373333 42.666667H485.376a10.666667 10.666667 0 0 0-8.448 17.237333L830.805333 512l-353.877333 452.096a10.666667 10.666667 0 0 0 8.362667 17.237333h103.082666c6.570667 0 12.8-3.072 16.810667-8.106666l340.48-434.858667a42.666667 42.666667 0 0 0 0-52.650667z" fill="#000000" fill-opacity=".65" p-id="7330"></path></svg>`
    private img_open = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8309" width="16" height="16"><path d="M193.194667 512L547.072 59.904A10.666667 10.666667 0 0 0 538.709333 42.666667H435.541333a21.589333 21.589333 0 0 0-16.810666 8.106666L78.336 485.717333a42.666667 42.666667 0 0 0 0 52.650667l340.48 434.858667c4.010667 5.12 10.24 8.106667 16.810667 8.106666h102.997333c8.96 0 13.909333-10.24 8.448-17.237333L193.194667 512z m405.333333 0L952.405333 59.904A10.666667 10.666667 0 0 0 944.042667 42.666667H840.874667a21.589333 21.589333 0 0 0-16.810667 8.106666l-340.48 434.944a42.666667 42.666667 0 0 0 0 52.650667l340.48 434.858667c4.010667 5.12 10.24 8.106667 16.810667 8.106666h102.997333c8.96 0 13.909333-10.24 8.448-17.237333L598.528 512z" fill="#000000" fill-opacity=".65" p-id="8310"></path></svg>`
    private minWidth = 600;

    /**
     *
     */
    constructor(private options: ExtendControlOptions = {}) {
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        const isMobile = map.getContainer().clientWidth < this.minWidth;
        const desktopContainer = createHtmlElement("div", "jas-ctrl-extend-desktop-container");
        const mobileContainer = createHtmlElement('div', "jas-ctrl-extend-mobile-contianer");

        if (isMobile) {
            desktopContainer.classList.add("jas-ctrl-hidden");
        } else {
            mobileContainer.classList.add("jas-ctrl-hidden");
        }

        const image_open_wapper = createHtmlElement('div', "jas-ctrl-extend-img-open");
        const image_close_wapper = createHtmlElement('div', "jas-ctrl-extend-img-close");

        this.appendImage(image_open_wapper, this.img_open, this.options.img1);
        this.appendImage(image_close_wapper, this.img_close, this.options.img2);

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

        const extendBtn = createHtmlElement("div", "jas-ctrl-extend", "jas-flex-center", "jas-one-button-mapbox", "mapboxgl-ctrl", "mapboxgl-ctrl-group");
        extendBtn.append(image_open_wapper, image_close_wapper);
        extendBtn.append(desktopContainer);
        map.getContainer().append(mobileContainer);

        const handleExtendChange = () => {
            extendBtn.classList.toggle("jas-ctrl-extend-open");
            mobileContainer.classList.toggle("jas-ctrl-extend-mobile-contianer-active");
        }

        desktopContainer.addEventListener('click', e => {
            e.stopPropagation();
        });

        extendBtn.addEventListener('click', e => {
            handleExtendChange();
        });

        return extendBtn;
    }
    onRemove(map: mapboxgl.Map): void {
    }
    getDefaultPosition?: (() => string) | undefined;

    private appendImage(parent: HTMLDivElement, defaultValue: string, img?: string | SVGElement) {
        if (img) {
            if (typeof img === 'string')
                if (img.replace(/\s+/g, "").startsWith("<svg"))
                    parent.innerHTML += img;
                else
                    parent.style.backgroundImage = img;
            else
                parent.append(img);
        } else {
            parent.innerHTML = defaultValue;
        }
    }
}