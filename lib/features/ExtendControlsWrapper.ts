import { AbstractExtendControl } from "../controls/ExtendControl";

export interface ExtendControlsWapperOptions {
    showMode: "mutex",
    initZIndex: 10
}

export default class ExtendControlsWrapper {
    constructor(controls: Array<AbstractExtendControl>, options: ExtendControlsWapperOptions = {
        showMode: "mutex",
        initZIndex: 10
    }) {
        if (options?.showMode === 'mutex')
            this.createMutexAction(controls);
        else
            this.createShowToTopAction(controls);
    }

    private createMutexAction(controls: Array<AbstractExtendControl>) {
        controls.forEach(c => {
            c.emitter.on('openChange', open => {
                if (open) {
                    controls.forEach(cc => {
                        if (cc !== c) {
                            cc.open = false;
                        }
                    })
                }
            });
        });
    }

    private createShowToTopAction(controls: Array<AbstractExtendControl>) {
        controls.forEach(c => {

        });
    }
}