export namespace units {
    export type TUnitsLength = "M" | "KM";

    export type TUnitsArea = "M2" | "KM2" | "MU";

    export type TUnitsAngle = "D" | "R";

    function unsupportUnitsError(units: string) {
        return Error(`不支持的单位转换：${units}`);
    }

    export function areaToBase(value: number, units: TUnitsArea) {
        switch (units) {
            case "KM2": return value * 1000000;
            case "MU": return value * 666.67;
            case "M2": return value;
            default: throw unsupportUnitsError(units);
        }
    }

    export function areaBaseTo(value: number, units: TUnitsArea) {
        switch (units) {
            case "KM2": return value / 1000000;
            case "MU": return value / 666.67;
            case "M2": return value;
            default: throw unsupportUnitsError(units);
        }
    }

    export function lengthToBase(value: number, units: TUnitsLength) {
        switch (units) {
            case "KM": return value * 1000;
            case "M": return value;
            default: throw unsupportUnitsError(units);
        }
    }

    export function lengthBaseTo(value: number, units: TUnitsLength) {
        switch (units) {
            case "KM": return value / 1000;
            case "M": return value;
            default: throw unsupportUnitsError(units);
        }
    }

    export function convertArea(value: number, fromUnits: TUnitsArea, toUnits: TUnitsArea): number {
        return areaBaseTo(areaToBase(value, fromUnits), toUnits);
    }

    export function convertLength(value: number, fromUnits: TUnitsLength, toUnits: TUnitsLength): number {
        return lengthBaseTo(lengthToBase(value, fromUnits), toUnits);
    }


    type TUnitsDescription<TValue> = {
        label: string,
        value: TValue
    }

    export const unitsLengthDescriptions: Array<TUnitsDescription<TUnitsLength>> = [
        {
            label: "米",
            value: "M"
        }, {
            label: "千米",
            value: "KM"
        }];

    export const unitsAreaDescriptions: Array<TUnitsDescription<TUnitsArea>> = [
        {
            label: "平方米",
            value: "M2"
        }, {
            label: "平方千米",
            value: "KM2"
        }, {
            label: "亩",
            value: "MU"
        }];
}