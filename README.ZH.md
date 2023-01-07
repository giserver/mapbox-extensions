# mapbox-extensions 
[![npm](https://img.shields.io/npm/v/mapbox-extensions)](https://www.npmjs.com/package/mapbox-extensions)  
mapboxgl的扩展库，例如新增changeStyle替代原有的setStyle解决要保存已经加载的图层，自定义图层组并且增加对图层组的操作，等等。。。
## dev & build 
```
yarn
yarn dev
yarn build
```
## 使用    
1. 确保mapboxgl已经在项目中安装. 
2. `npm install` / `yarn add` `mapbox-extensions`. 
3. add `import 'mapbox-extensions'` at your entry file. 
## 功能 
### `修改样式`  
在map对象中的使用setStyle方法会将现有的所有数据源和图层清空，使用changeStyle可以保存这些数据源和图层，但是必须设置要保存的图层id
``` ts
const map = new mapboxgl.Map({...});
map.changeStyle(["layer-polygon","xxxlayer"] , options);
```

### `图层组`

![](https://img2022.cnblogs.com/blog/1375435/202208/1375435-20220806221407867-1122089688.gif)
``` ts
const map = new mapboxgl.Map({...});
const group = map.addLayerGroup('group1');

group.add(layer); // 添加一个图层到图层组，并且会自动地将图层添加到map中
group.show = false; //设置所有在这个组的图层设置为不可见 
group.show = true;

console.log(group.layerIds); // ['layerid']

group.moveTo(); // 图层组的所有图层置顶
group.moveTo("beforeId"); // 移动图层至id为beforeId的图层之后

group.remove('layerid');
group.removeAll();

map.removeLayerGroup('group1');
```  
### `测量`  
这个是一个自定义的测量控件，实现了mapboxgl中的IControl，所以您可以直接作为ui使用它。你可以测量点（经纬度），线（长度），面（面积）。

![绘制](https://img2022.cnblogs.com/blog/1375435/202208/1375435-20220806221426272-27170389.gif)

![右键删除](https://img2022.cnblogs.com/blog/1375435/202210/1375435-20221023175344373-2003003842.gif)

``` ts
const map = new mapboxgl.Map({...});

map.addControl(new MeasureControl(options)) // 参数可以为空，或自行配置
```
*参数*  
- [MeasureControlOptions](./lib/controls/MeasureControl.ts)
- [MeasurePointOptions](./lib/features/Meature/MeasurePoint.ts)  
- [MeasureLineStringOptions](./lib/features/Meature/MeasureLineString.ts)  
- [MeasurePolygonOptions](./lib/features/Meature/MeasurePolygon.ts)  

*鼠标操作* 
- 左键点击 : 添加一个点
- 右键点击 : 删除一个点
- 左键双击 : 完成测量，开始下一次测量  
你也可以使用那三个测量类自定义ui，在 [MeasureBase](./lib/features/Meature/MeasureBase.ts) 这个抽象类中可以找到所有的公开方法，很简单😄

*增加的功能*
- [MeasureControlOptions](./lib/controls/MeasureControl.ts) 参数中的 `geometryClick` 控制图形(包括文字标注)是否可以点击，点击后弹出 复制、删除功能
![](https://img2022.cnblogs.com/blog/1375435/202210/1375435-20221023175524217-370679180.gif)

### `回到初始位置`
就是一个很简单的map.easeTo功能的封装，默认 zoom center pitch bearing 从map的初始值中取

``` ts
map.addControl(new BackToOriginControl({
    //eastToOptions:{}
}))
```

![](https://img2023.cnblogs.com/blog/1375435/202301/1375435-20230107191736719-914259791.gif)

### `切换图层` 
- 切换到卫星影像

    可以自定义 `textColor` `backgroundImage` 和显示名字 `name` 

- 附加图层

    通过配置`extraLayers`参数，激活附加图层ui，提供图层分组功能，组与组之间图层的显隐不互斥，组可以通过`mutex`直接设置各个图层互斥，也可以在非互斥组内配置`LayerItem`的`mutex`参数设置该图层与其他图层互斥。

    您还可以通过设置active属性设置图层默认加载到地图(显示)，但这个active会在初始化控件时检查互斥是否正确，如果互斥组内存在一个以上的active图层或者非互斥组内存在一个互斥图层以及其他的active图层，则抛出异常。
``` ts
map.addControl(new SwitchMapControl({
    satelliteOption: {
        textColor: 'white',
        //backgroundImage: '/relics.png'
    },
    extraLayers:{
      'foo':{
      }
    }
}));
```
![](https://img2023.cnblogs.com/blog/1375435/202301/1375435-20230107192936756-2062484649.gif)

### `涂鸦` 
为圈选做的控件，模仿画笔在地图上画出多边形，在回调中配置扩展逻辑

``` ts
map.addControl(new DoodleControl({

    name: '',           // 控件名字
    reName : '',        // 重绘名
    exitText : '',      // 退出文本
    lineColor : '',     //线颜色
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
![](https://img2023.cnblogs.com/blog/1375435/202301/1375435-20230107191837523-1099243574.gif)
```