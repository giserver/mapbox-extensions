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
### `changeStyle`  
在map对象中的使用setStyle方法会将现有的所有数据源和图层清空，使用changeStyle可以保存这些数据源和图层，但是必须设置要保存的图层id
``` ts
const map = new mapboxgl.Map({...});
map.changeStyle(["layer-polygon","xxxlayer"] , options);
```

### `Layer Group`
``` ts
const map = new mapboxgl.Map({...});
const group = map.addLayerGroup('group1');

group.add(layer); // 添加一个图层到图层组，并且会自动地将图层添加到map中
group.show = false; //设置所有在这个组的图层设置为不可见 
group.show = true;

console.log(group.layerIds); // ['layerid']

group.remove('layerid');
group.removeAll();

map.removeLayerGroup('group1');
```