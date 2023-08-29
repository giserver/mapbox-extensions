import SwitchLayerButtonBase from './features/SwitchLayer/SwitchLayerButtonBase';

export type SwitchLayerEventType = {
    "layer-visible-changed": {
        btn: SwitchLayerButtonBase;
    };
};