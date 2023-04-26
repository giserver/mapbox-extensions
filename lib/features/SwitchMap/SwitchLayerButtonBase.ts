import { AnyLayer, Map } from "mapbox-gl";
import SwitchGroupContainer from "./SwitchGroupContainer";
import { SwitchLayerItem } from "./types";

export default abstract class SwitchLayerButtonBase {

    private _checked: boolean;
    protected readonly token = "checked";
    readonly element: HTMLElement;

    constructor(private map: Map, public readonly options: SwitchLayerItem, private container: SwitchGroupContainer) {
        const { container: c, button: b } = this.createHtmlElement();
        this.element = c;

        this.addClickEvent(b);

        this._checked = this.options.active === true;
        this.changeChecked(this._checked);
    }

    get checked() {
        return this._checked;
    }

    get id() {
        return this.options.layer instanceof Array<AnyLayer> ?
            this.options.layer.map(x => x.id).join('&') :
            this.options.layer.id;
    }

    changeChecked(value?: boolean, ease?: boolean) {

        // UI change
        if (value) {
            this.check();
            this._checked = true;
        } else if (value === undefined) {
            this.checked ? this.unCheck() : this.check();
            this._checked = !this.checked;
        } else {
            this.unCheck();
            this._checked = false;
        }

        // layer visibility change
        const layers = this.options.layer instanceof Array<AnyLayer> ? this.options.layer : [this.options.layer];
        layers.forEach(layer => {
            this.map.setLayoutProperty(layer.id, 'visibility', this.checked ? 'visible' : 'none');
        })

        if (this.checked) {
            if (!this.options.fixed && this.container.extraInfo.showToTop) {
                layers.forEach(l => {
                    this.map.moveLayer(l.id, this.container.extraInfo.topLayerId)
                })
            }

            if (ease && this.options.easeToOptions)
                this.map.easeTo(this.options.easeToOptions);
        }

        // invoke callback
        this.options.onVisibleChange?.call(undefined, this.checked);
    }

    protected addClickEvent(element: HTMLElement) {
        element.addEventListener('click', () => {
            this.changeChecked(undefined, true);

            if (this.checked) {
                this.container.layerBtns.forEach(oBtn => {
                    if (oBtn.id !== this.id &&
                        (this.container.options.mutex ||
                            this.options.mutex ||
                            oBtn.options.mutex ||
                            (this.options.mutexIdentity && this.options.mutexIdentity === oBtn.options.mutexIdentity))) {
                        oBtn.changeChecked(false);
                    }
                })
            }
        });
    }

    protected abstract createHtmlElement(): { container: HTMLElement, button: HTMLElement };

    protected abstract check(): void;

    protected abstract unCheck(): void;
}