import { Map } from "mapbox-gl";
import { SwitchGroupContainer, SwitchLayerItem, getLayerIds } from ".";

export default abstract class SwitchLayerButtonBase {

    private _checked: boolean;
    protected readonly token = "checked";
    readonly element: HTMLElement;

    constructor(
        private map: Map,
        public readonly options: SwitchLayerItem,
        public readonly container: SwitchGroupContainer) {

        const { container: c, button: b } = this.createHtmlElement();
        this.element = c;

        b.addEventListener('click', () => {
            this.changeChecked(undefined, true);
            container.extraOptions.emitter.emit("layer-visible-changed", { btn: this });
        });

        this._checked = this.options.active === true;
        this.changeChecked(this._checked);
    }

    get checked() {
        return this._checked;
    }

    get id() {
        return getLayerIds(this.options.layer).join('&');
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
        const ids = getLayerIds(this.options.layer);
        //const layers = this.options.layer instanceof Array ? this.options.layer : [this.options.layer];
        ids.forEach(id => {
            this.map.setLayoutProperty(id, 'visibility', this.checked ? 'visible' : 'none');
        });

        if (this.checked) {
            if (!this.options.fixed && this.container.extraOptions.showToTop) {
                ids.forEach(id => {
                    this.map.moveLayer(id, this.container.extraOptions.topLayerId)
                })
            }

            if (ease && this.options.easeToOptions)
                this.map.easeTo(this.options.easeToOptions);
        }

        // invoke callback
        this.options.onVisibleChange?.call(undefined, this.checked);
    }

    protected abstract createHtmlElement(): { container: HTMLElement, button: HTMLElement };

    protected abstract check(): void;

    protected abstract unCheck(): void;
}