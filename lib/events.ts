import mitt from 'mitt';
import SwitchLayerButtonBase from './features/SwitchLayer/SwitchLayerButtonBase';
import { MarkerFeatureType } from './features/Marker/types';

const emitter = mitt<{
    "layer-visible-changed": { btn: SwitchLayerButtonBase },

    "marker-item-remove" : MarkerFeatureType,
    "marker-item-update" : MarkerFeatureType
}>();

export default emitter;