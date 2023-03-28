import { AnyLayer, Map } from "mapbox-gl";
import { SwitchMapExtraInfo } from "../../controls/SwitchMapControl";
import { SwitchLayerItem } from "./types";

export default abstract class SwitchLayerButtonBase {

    private _checked: boolean;
    protected readonly token = "checked";
    readonly element: HTMLElement;

    constructor(private map: Map, public readonly options: SwitchLayerItem, private extraInfo: SwitchMapExtraInfo) {
        this.element = this.createHtmlElement();
        this._checked = this.options.active === true;
        this.changeChecked(this._checked);
    }

    get checked() {
        return this._checked;
    }

    get id() {
        return this.options.layer instanceof Array<AnyLayer> ?
            this.options.layer.join('&') :
            this.options.layer.id;
    }

    changeChecked(checked?: boolean, ease?: boolean) {

        // UI change
        if (checked) {
            this.check();
            this._checked = true;
        } else if (checked === undefined) {
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
            if (!this.options.fixed && this.extraInfo.showToTop) {
                layers.forEach(l => {
                    this.map.moveLayer(l.id, this.extraInfo.topLayerId)
                })
            }

            if (ease && this.options.easeToOptions)
                this.map.easeTo(this.options.easeToOptions);
        }

        // invoke callback
        this.options.onVisibleChange?.call(undefined, this.checked);
    }

    protected abstract createHtmlElement(): HTMLElement;

    protected abstract check(): void;

    protected abstract unCheck(): void;
}