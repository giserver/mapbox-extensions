import { Map } from "mapbox-gl";
import { SwitchMapExtraInfo } from "../../controls/SwitchMapControl";
import ImgTxtSwitchLayerButton from "./ImgTxtSwitchLayerButton";
import SwitchLayerButton from "./SwitchLayerButton";
import SwitchLayerButtonBase from "./SwitchLayerButtonBase";
import { SwitchGroupLayers } from "./types";

export default class SwitchGroupContainer {

    private layerBtns: Array<SwitchLayerButtonBase> = [];
    readonly element: HTMLElement;

    /**
     *
     */
    constructor(private map: Map, name: string, private options: SwitchGroupLayers, extraInfo: SwitchMapExtraInfo) {
        this.element = document.createElement('div');
        let style = this.element.style;
        style.marginBottom = '24px';

        const header = document.createElement('div');
        header.innerHTML = `<span>${name}</span>`;
        style = header.style;
        style.display = 'flex';
        style.alignItems = 'flex-end';
        style.fontWeight = '500';
        style.fontSize = '14px';
        style.lineHeight = '20px';
        style.marginBottom = '16px';
        this.element.append(header);

        const layersDiv = document.createElement('div');
        style = layersDiv.style;
        style.display = 'grid';
        style.gap = '20px 38px';

        style.gridTemplateColumns = options.uiType === "SwitchBtn" ? '1fr' : '1fr 1fr 1fr';
        if (options.uiType === "ImgTxtBtn")
            style.justifyItems = 'center';

        style.minWidth = `${extraInfo.layerItemImgSize! * 3 + 38 * 2}px`

        this.options.layers.forEach(layer => {
            const btn = options.uiType === "SwitchBtn" ?
                new SwitchLayerButton(map, layer, extraInfo) :
                new ImgTxtSwitchLayerButton(map, layer, extraInfo);

            this.layerBtns.push(btn);
            btn.element.addEventListener('click', e => {
                btn.changeChecked(undefined, true);

                if (btn.checked) {
                    this.layerBtns.forEach(oBtn => {
                        if (oBtn.id !== btn.id && (this.options.mutex || btn.options.mutex || oBtn.options.mutex))
                            oBtn.changeChecked(false);
                    })
                }
            });

            layersDiv.append(btn.element);
        });

        this.element.append(layersDiv);
    }
}