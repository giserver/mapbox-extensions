import mitt from 'mitt';
import SwitchLayerButtonBase from './features/SwitchLayer/SwitchLayerButtonBase';

const emitter = mitt<{
    "layer-visible-changed": { btn: SwitchLayerButtonBase}
}>();

export default emitter;