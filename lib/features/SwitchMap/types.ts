import { AnyLayer, EaseToOptions } from "mapbox-gl";

type SwitchButtonType = "ImgTxtBtn" | "SwitchBtn";

export interface SwitchLayerItem {

    /**
     * 图层显示名称
     */
    name: string,

    /**
     * 图层
     */
    layer: AnyLayer,

    /**
     * 平移参数，当不为空时，图层被激活显示后将自动移动到设计的位置
     */
    easeToOptions?: EaseToOptions,

    /**
     * 是否与其他的图层互斥
     */
    mutex?: boolean,

    /**
     * 是否初始显示
     */
    active?: boolean,

    /**
     * 背景图片
     */
    backgroundImage: string,

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
     * 切换ui的类型
     */
    uiType?: SwitchButtonType

    /**
     * 图层
     */
    layers: Array<SwitchLayerItem>
}