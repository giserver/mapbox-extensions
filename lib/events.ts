import mitt from 'mitt';
import SwitchLayerButtonBase from './features/SwitchLayer/SwitchLayerButtonBase';
import { MarkerFeatureType, MarkerLayerProperties } from './features/Marker/types';

const emitter = mitt<{
    "layer-visible-changed": { btn: SwitchLayerButtonBase },
}>();

export default emitter;