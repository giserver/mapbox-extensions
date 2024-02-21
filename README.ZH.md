# mapbox-extensions 
[![npm](https://img.shields.io/npm/v/mapbox-extensions)](https://www.npmjs.com/package/mapbox-extensions)  
mapbox的扩展组件库，包含测量、图层切换、底图切换、涂鸦绘制、回到原始位置等功能
## DEMO
[examples](https://cocaine-coder.github.io/mapbox-extensions/example-dist/)
## 使用    
### CDN 
``` html
<script src="https://jsd.onmicrosoft.cn/npm/mapbox-extensions@1.3.14/dist/mapbox-extensions.js"></script>
<link href="https://jsd.onmicrosoft.cn/npm/mapbox-extensions@1.3.14/dist/index.css" rel="stylesheet">
```  
### NODE 
```
npm install / yarn add  mapbox-extensions

import { SwitchLayerControl } from 'mapbox-extensions'
import 'mapbox-extensions/dist/index.css'
```
## 给颗星星呗! :star:
如果您觉得这个项目还不错，可以在您的项目中使用或者对您有些许启发，请给颗星星吧，谢谢！

## 功能 
### `测量` 
``` ts
map.addControl(new MeasureControl({
    horizontal : true,         //默认false 控件是否横置   
    btnBgColor : 'red',        //默认'#ffffff'
    btnActiveColor:'red',      //默认'#ddd'
    geometryClick:true,        //默认false 测量后的图像是否可选
    enableModes:['LineString'],//默认所有 允许的测量模式
    onStart:()=>{},            //默认空 开始测量的回调
    onStop:()=>{},             //默认空 结束测量的回调
    measurePointOptions:{      //默认空 测量点的配置
    },
    measureLineStringOptions:{ //默认空 测量线的配置
    },
    measurePolygonOptions:{    //默认空 测量面的配置
    }
}))
``` 
![测量](./doc/img/measure.gif)
*鼠标操作* 
- 左键点击 : 添加一个点
- 右键点击 : 删除一个点
- 左键双击 : 完成测量，开始下一次测量 

### `回到初始位置`
``` ts
map.addControl(new BackToOriginControl({}))
```
![回到初始位置](./doc/img/back2origin.gif)

### `切换底图` *附加图层*
``` ts
map.addControl(new SwitchMapControl({
    satelliteOption:{        // 默认空  卫星底图配置
        name: "satellite",   // 默认'卫星底图'
        textColor : 'red',   // 文字颜色
        backgroundImage : "",// 背景图片
    },
    showSatelliteDefault:true, // 默认false 是否默认显示卫星影像
    extra:{  // 默认空 与下面切换图层控件选项类似
        nailActiveColor : "red" // 默认蓝色 固定面板图钉的颜色
    }
}));
```
![切换底图](./doc/img/switchmap.gif)

### `切换图层` *兼容移动端*
``` ts
map.addControl(new SwitchLayerControl({
    name:"图层管理器" ,       // 默认'图层' 名称 
    position:"top-left",    // 代替addControl中第二个参数(禁止填写) 

    selectAndClearAll:true, // 默认 true 是否开启全选和清空
    selectAllLabel:"全选",   // 默认'全选' 全选label 
    clearAllLabel:"清空",    // 默认'清空' 清空label

    showToTop:true,         // 默认false 是否置顶图层
    topLayerId:"",          // 默认不填 置顶在xxx图层之后

    layerGroups:{           // 必填 图层组
        "图层组1":{
            mutex:true,         // 默认false 图层组全部互斥
            collapse:true,      // 默认false 是否使用折叠面板
            uiType:"SwitchBtn", // 默认'ImgTxtBtn'
            layers:[
               {
                 name:"图层1",   // 必填 图层名字
                 layer: {},     // 必填 mapboxgl 图层或者图层数组
                 fixed:true,    // 默认false 是否固定 使showToTop无效
                 zoom:-100,     // 默认0 图层加载顺序
                 easeToOptions:{},     // 默认空 激活图层后移动到
                 mutex:true,           // 默认false 图层是否与其他图层互斥
                 mutexIdentity:"t1",   // 默认空 图层互斥标识 标识一样则互斥
                 active:true,          // 默认false 是否初始显示
                 backgroundImage:"",   // 默认空 背景图片
                 backgroundImageActive:"", // 默认空 激活后背景图片
 
                 onVisibleChange:(visible:boolean)=>{}
               }
            ]
        }
    }
}));
```
![切换图层](./doc/img/switchlayer.gif)

![切换图层移动版](./doc/img/switchlayer-mobile.gif)

### `弹出面板` *兼容移动端*
``` ts
map.addControl(new ExtendControl({
    img1 : "",              // 关闭状态图标
    img2 : "",              // 开启状态图标
    content : div,          // 必填 内容
    position : "top-left",  // 代替addControl中第二个参数(禁止填写)
    mustBe : "pc",          // 强制

    onChange:(open:boolean)=>{}
}));
```
![弹出面板](./doc/img/extend.gif)

![弹出面板移动版](./doc/img/extend-mobile.gif)

### `涂鸦` 

``` ts
map.addControl(new DoodleControl({

    name: '',           // 控件名字
    reName : '',        // 重绘名
    exitText : '',      // 退出文本
    lineColor : '',     // 线颜色
    lineWidth : 1,      // 线宽
    polygonColor: '',   // 多边形颜色
    polygonOpacity : 1, // 多边形透明度

    // 绘制开始
    onStart: () => { measureControl.stop() },

    // 绘制多边形完成
    onDrawed: polygon => { () => { alert(JSON.stringify(polygon)) } },

    // 清空回调
    onClear:()=>{},

    // 退出回调
    onExit:()=>{}
}))
```
![涂鸦](./doc/img/doodle.gif)

### `位置`
``` ts
map.addControl(new LocationControl({ fractionDigits: 4 }));
```
### `缩放`
``` ts
map.addControl(new ZoomControl());
```
### `鹰眼`
``` ts
map.addControl(new EyeControl(map));
```
![BackToOrigin](./doc/img/location.gif)
