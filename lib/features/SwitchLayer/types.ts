import mapboxgl, { AnyLayer, EaseToOptions } from "mapbox-gl";

type SwitchButtonType = "ImgTxtBtn" | "SwitchBtn";

export type CustomLayerType = AnyLayer | AnyLayer[] | string | string[];

export function getLayerIds(layer: CustomLayerType) {
    const result = new Array<string>();
    if (layer instanceof Array) {
        layer.forEach(l => {
            result.push(typeof l === 'string' ? l : l.id);
        });
    } else {
        result.push(typeof layer === 'string' ? layer : layer.id);
    }

    return result;
}

export function getLayers(layer: CustomLayerType) {
    const layers = new Array<mapboxgl.AnyLayer>();

    if (layer instanceof Array) {
        layer.forEach(l => {
            if (typeof l !== 'string')
                layers.push(l);
        })
    } else {
        if (typeof layer !== 'string')
            layers.push(layer);
    }

    return layers;
}

export interface SwitchLayerItem {

    /**
     * 图层显示名称
     */
    name: string,

    /**
     * 图层
     */
    layer: CustomLayerType,

    /**
     * 是否固定 始终不移动
     */
    fixed?: boolean;

    /**
     * 初始图层层级
     */
    zoom?: number;

    /**
     * 平移参数，当不为空时，图层被激活显示后将自动移动到设计的位置
     */
    easeToOptions?: EaseToOptions,

    /**
     * 是否与其他的图层互斥
     */
    mutex?: boolean,

    /**
     * 设置互斥标记，如果存在相同此项(非空 非null 非undefined)则与此图层互斥
     */
    mutexIdentity?: string,

    /**
     * 是否初始显示
     */
    active?: boolean,

    /**
     * 背景图片
     */
    backgroundImage?: string,

    /**
     * 激活时的图片
     */
    backgroundImageActive?: string,

    /**
     * 当图层被激活显示时的回调
     * @param visible 
     * @returns 
     */
    onVisibleChange?: (visible: boolean) => void
}

export interface SwitchGroupLayers {

    /**
     * 图层组互斥
     */
    mutex?: boolean,

    /**
     * 是否为折叠面板
     */
    collapse?: boolean,

    /**
     * 折叠默认值
     */
    defaultCollapsed?: boolean,

    /**
     * 切换ui的类型
     */
    uiType?: SwitchButtonType

    /**
     * 图层
     */
    layers: Array<SwitchLayerItem>
}

export interface SelectAndClearAllOptions {
    /**
      * 是否使用全选和清除，默认: true
      */
    selectAndClearAll?: boolean;

    /**
     * 全选名字，默认: 全选
     */
    selectAllLabel?: string;

    /**
     * 清空名字，默认: 清空
     */
    clearAllLabel?: string;
}

export interface ShowToTopOptions {
    /**
 * 点击图层后该图层置顶
 */
    showToTop?: boolean;

    /**
     * {@link showToTop}联用时，调整图层顺序的最前面的图层id
     */
    topLayerId?: string;
}

export type LayerGroupsType = Record<string, SwitchGroupLayers>;