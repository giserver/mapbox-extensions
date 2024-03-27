import { DrawBase, DrawLineString, DrawLineStringOptions, DrawPoint, DrawPointOptions, DrawPolygon, DrawPolygonOptions, DrawType } from ".";

export class Drawer {
    private draws: Array<DrawBase>;
    private currentType?: DrawType;

    /**
     *
     */
    constructor(map: mapboxgl.Map, private options: {
        point?: DrawPointOptions,
        lineString?: DrawLineStringOptions,
        polygon?: DrawPolygonOptions,
        onStart?(): void,
        onStop?(): void,
        onClear?(): void
    } = {}) {
        this.draws = [
            new DrawPoint(map, options.point),
            new DrawLineString(map, options.lineString),
            new DrawPolygon(map, options.polygon),
        ]
    }

    start(type: DrawType) {
        this.stop();

        this.currentType = type;
        this.draws.find(x => x.type === type)!.start();

        this.options.onStart?.();
    }

    stop() {
        this.draws.find(x => x.type === this.currentType)?.stop();
        this.currentType = undefined;

        this.options.onStop?.();
    }

    clear() {
        this.draws.forEach(draw => draw.clear());

        this.options.onClear?.();
    }
}