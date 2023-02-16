import { Map } from "mapbox-gl";
import { SwitchLayerItem } from "./types";

export default abstract class SwitchLayerButtonBase {

    private _checked: boolean;
    protected readonly token = "checked";
    readonly element: HTMLElement;

    constructor(private map: Map, public readonly options: SwitchLayerItem) {
        this.element = this.createHtmlElement();
        this._checked = this.options.active === true;

        if (this._checked)
            this.changeChecked(this._checked)
    }

    get checked() {
        return this._checked;
    }

    changeChecked(checked?: boolean) {

        // UI change
        if (checked) {
            this.check();
            this._checked = true;
        } else if (checked === undefined) {
            this.checked ? this.unCheck : this.check();
            this._checked = !this.checked;
        } else {
            this.unCheck();
            this._checked = false;
        }

        // layer visibility change
        if (!this.map.getLayer(this.options.layer.id))
            this.map.addLayer(this.options.layer);
        this.map.setLayoutProperty(this.options.layer.id, 'visibility', this.checked ? 'visible' : 'none');
        if (this.checked && this.options.easeToOptions)
            this.map.easeTo(this.options.easeToOptions);

        // invoke callback
        this.options.onVisibleChange?.call(undefined, this.checked);
    }

    protected abstract createHtmlElement(): HTMLElement;

    protected abstract check(): void;

    protected abstract unCheck(): void;
}