import mapboxgl, { IControl, Map } from "mapbox-gl";

export interface DoubleScreenCompareOptions {
    configSlaveMap?(slave: mapboxgl.Map): void
}

export default class DoubleScreenCompare implements IControl {
    readonly slaveMapId = "jas-double-screen-compare-slave-map";

    /**
     *
     */
    constructor(private options: DoubleScreenCompareOptions = {}) {

    }

    onAdd(map: Map): HTMLElement {

        // 创建分屏按钮
        const btn = document.createElement('div');

        // 获取map的父元素
        const masterContainer = map.getContainer();
        const masterFEle = map.getContainer().parentElement!;

        // 在父元素中创建一个div作为slave map的container
        const slaveContainer = document.createElement('div');
        slaveContainer.id = this.slaveMapId;
        slaveContainer.style.width = "0%";
        slaveContainer.style.position = "absolute";
        slaveContainer.style.right = "0";
        masterFEle.append(slaveContainer);

        // 创建slave map
        const slaveMap = new mapboxgl.Map({
            container: this.slaveMapId
        })

        // 配置slave map
        this.options.configSlaveMap?.call(this, slaveMap);


        // 按钮的点击事件，控制slave map的显示和隐藏
        btn.addEventListener('click',e=>{
            if(slaveContainer.style.width === "0%") {//要弹出第二个map 即slave map
                slaveContainer.style.width = "50%";
                masterContainer.style.width = "50%";
            }else{
                slaveContainer.style.width = "0%";
                masterContainer.style.width = "100%";
            }

            setTimeout(()=>{
                map.resize();
                slaveMap.resize();
            },0);
        });

        return btn;
    }
    onRemove(map: Map): void {
        throw new Error("Method not implemented.");
    }
    getDefaultPosition?: (() => string) | undefined;

}