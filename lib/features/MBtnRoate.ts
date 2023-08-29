import mapboxgl from "mapbox-gl";

type MercatorCoordinate = {
    x: number,
    y: number,
    z: number
}

class Point {
    /**
     *
     */
    constructor(public x: number, public y: number) {

    }

    dist(point: Point) {
        return Math.sqrt(Math.pow((this.x - point.x), 2) + Math.pow((this.y - point.y), 2));
    }

    sub(point: Point) {
        return new Point(this.x - point.x, this.y - point.y);
    }
}

export type HandlerResult = {
    panDelta?: Point,
    zoomDelta?: number,
    bearingDelta?: number,
    pitchDelta?: number,
    // the point to not move when changing the camera
    around?: Point | null,
    // same as above, except for pinch actions, which are given higher priority
    pinchAround?: Point | null,
    // the point to not move when changing the camera in mercator coordinates
    aroundCoord?: MercatorCoordinate | null,
    // A method that can fire a one-off easing by directly changing the map's camera.
    cameraAnimation?: (map: mapboxgl.Map) => any;

    // The last three properties are needed by only one handler: scrollzoom.
    // The DOM event to be used as the `originalEvent` on any camera change events.
    originalEvent?: any,
    // Makes the manager trigger a frame, allowing the handler to return multiple results over time (see scrollzoom).
    needsRenderFrame?: boolean,
    // The camera changes won't get recorded for inertial zooming.
    noInertia?: boolean
};

namespace DOM {
    export function mouseButton(e: MouseEvent): number {
        if (e.type === 'mousedown' || e.type === 'mouseup') {
            if (typeof (window as any).InstallTrigger !== 'undefined' && e.button === 2 && e.ctrlKey &&
                window.navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
                // Fix for https://github.com/mapbox/mapbox-gl-js/issues/3131:
                // Firefox (detected by InstallTrigger) on Mac determines e.button = 2 when
                // using Control + left click
                return 0;
            }

            return e.button as any;
        }

        return -1;
    }

    // Suppress the next click, but only if it's immediate.
    function suppressClickListener(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        window.removeEventListener('click', suppressClickListener, true);
    }

    export function suppressClick() {
        window.addEventListener('click', suppressClickListener, true);
        window.setTimeout(() => {
            window.removeEventListener('click', suppressClickListener, true);
        }, 0);
    }

    const docStyle = window.document && window.document.documentElement.style;
    const selectProp = docStyle && docStyle.userSelect !== undefined ? 'userSelect' : 'WebkitUserSelect';
    let userSelect: any;

    export function disableDrag() {
        if (docStyle && selectProp) {
            userSelect = docStyle[selectProp as any];
            docStyle[selectProp as any] = 'none';
        }
    }

    export function enableDrag() {
        if (docStyle && selectProp) {
            docStyle[selectProp as any] = userSelect;
        }
    }

    export function mousePos(el: HTMLElement, e: MouseEvent | WheelEvent): Point {
        const rect = el.getBoundingClientRect();
        return getScaledPoint(el, rect, e);
    }

    function getScaledPoint(el: HTMLElement, rect: ClientRect, e: MouseEvent | WheelEvent | Touch) {
        // Until we get support for pointer events (https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent)
        // we use this dirty trick which would not work for the case of rotated transforms, but works well for
        // the case of simple scaling.
        // Note: `el.offsetWidth === rect.width` eliminates the `0/0` case.
        const scaling = el.offsetWidth === rect.width ? 1 : el.offsetWidth / rect.width;
        return new Point(
            (e.clientX - rect.left) * scaling,
            (e.clientY - rect.top) * scaling
        );
    }
}

abstract class MouseHandler {

    _enabled: boolean = true;
    _active?: boolean;
    _lastPoint?: Point;
    _eventButton?: number;
    _moved?: boolean;
    _clickTolerance: number;

    constructor(options: { clickTolerance?: number }) {
        this.reset();
        this._clickTolerance = options.clickTolerance || 1;
    }

    blur() {
        this.reset();
    }

    reset() {
        this._active = false;
        this._moved = false;
        this._lastPoint = undefined;
        this._eventButton = undefined;
    }

    abstract correctButton(e: MouseEvent, button: number): boolean;

    abstract move(lastPoint: Point, point: Point): HandlerResult;

    mousedown(e: MouseEvent, point: Point) {
        if (this._lastPoint) return;

        const eventButton = DOM.mouseButton(e);
        if (!this.correctButton(e, eventButton)) return;

        this._lastPoint = point;
        this._eventButton = eventButton;
    }

    mousemoveWindow(e: MouseEvent, point: Point): HandlerResult | undefined {
        const lastPoint = this._lastPoint;
        if (!lastPoint) return;
        e.preventDefault();

        if (!this._moved && point.dist(lastPoint) < this._clickTolerance) return;
        this._moved = true;
        this._lastPoint = point;

        // implemented by child class
        return this.move(lastPoint, point);
    }

    mouseupWindow(e: MouseEvent) {
        if (!this._lastPoint) return;
        const eventButton = DOM.mouseButton(e);
        if (eventButton !== this._eventButton) return;
        if (this._moved) DOM.suppressClick();
        this.reset();
    }

    enable() {
        this._enabled = true;
    }

    disable() {
        this._enabled = false;
        this.reset();
    }

    isEnabled(): boolean {
        return this._enabled;
    }

    isActive(): boolean {
        return this._active === true;
    }
}

class MouseRotateHandler extends MouseHandler {
    correctButton(e: MouseEvent, button: number): boolean {
        return button === 1;
    }

    move(lastPoint: Point, point: Point): HandlerResult {
        const degreesPerPixelMoved = 0.8;
        const bearingDelta = (point.x - lastPoint.x) * degreesPerPixelMoved;
        this._active = true;
        return { bearingDelta };
    }

    contextmenu(e: MouseEvent) {
        // prevent browser context menu when necessary; we don't allow it with rotation
        // because we can't discern rotation gesture start from contextmenu on Mac
        e.preventDefault();
    }
}

class MousePitchHandler extends MouseHandler {
    correctButton(e: MouseEvent, button: number): boolean {
        return button === 1;
    }

    move(lastPoint: Point, point: Point): HandlerResult {
        const degreesPerPixelMoved = -0.5;
        const pitchDelta = (point.y - lastPoint.y) * degreesPerPixelMoved;
        this._active = true;
        return { pitchDelta };
    }

    contextmenu(e: MouseEvent) {
        // prevent browser context menu when necessary; we don't allow it with rotation
        // because we can't discern rotation gesture start from contextmenu on Mac
        e.preventDefault();
    }
}


export default class MBtnRoate {
    private mouseRotate: MouseRotateHandler;
    private mousePitch: MousePitchHandler;
    enable = true;

    /**
     *
     */
    constructor(private map: mapboxgl.Map) {
        const element = map.getContainer();
        this.map = map;
        this.mouseRotate = new MouseRotateHandler({ clickTolerance: (map.dragRotate as any)._mouseRotate._clickTolerance });
        this.mousePitch = new MousePitchHandler({ clickTolerance: (map.dragRotate as any)._mousePitch._clickTolerance });

        const mousemove = (e: MouseEvent) => {
            this.move(e, DOM.mousePos(element, e));
        }

        const mouseup = (e: MouseEvent) => {
            this.mouseRotate.mouseupWindow(e);
            this.mousePitch.mouseupWindow(e);
            offTemp();
        }

        const offTemp = () => {
            DOM.enableDrag();
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }

        const mousedown = (e: MouseEvent) => {
            if (!this.enable) return;

            this.down(e, DOM.mousePos(element, e));
            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup', mouseup);
        }

        element.addEventListener('mousedown', mousedown);
    }

    private down(e: MouseEvent, point: Point) {
        this.mouseRotate.mousedown(e, point);
        this.mousePitch.mousedown(e, point);
        DOM.disableDrag();
    }

    private move(e: MouseEvent, point: Point) {
        const map = this.map;
        const r = this.mouseRotate.mousemoveWindow(e, point);
        const delta = r && r.bearingDelta;
        if (delta) map.setBearing(map.getBearing() + delta);
        if (this.mousePitch) {
            const p = this.mousePitch.mousemoveWindow(e, point);
            const delta = p && p.pitchDelta;
            if (delta) map.setPitch(map.getPitch() + delta);
        }
    }
}