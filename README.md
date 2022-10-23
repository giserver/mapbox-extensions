# mapbox-extensions [中文](./README.ZH.md)
measure, layer-group etc... in mapbox-gl
## dev & build 
```
yarn
yarn dev
yarn build
```
## usage  
[![npm](https://img.shields.io/npm/v/mapbox-extensions)](https://www.npmjs.com/package/mapbox-extensions) 
1. make sure mapbox installed. 
2. `npm install` / `yarn add` `mapbox-extensions`. 
3. add `import 'mapbox-extensions'` at your entry file. 
4. enjoy extensions. 
## features 
### `changeStyle`  
map.setStyle(...) will clear all sources and layers, use changeStyle can preserve sources and layers, but you must indicates layer ids
``` ts
const map = new mapboxgl.Map({...});
map.changeStyle(["layer-polygon","xxxlayer"] , options);
```

### `Layer Group`
``` ts
const map = new mapboxgl.Map({...});
const group = map.addLayerGroup('group1');

group.add(layer); // add a layer to group, it will add to map automatically
group.show = false; // all layers in this group will be unvisible
group.show = true;

console.log(group.layerIds); // ['layerid']

group.moveTo(); // move all layers in group to front
group.moveTo("beforeId"); // move all layers in group to the back of beforeId layer

group.remove('layerid');
group.removeAll();

map.removeLayerGroup('group1');
```  
### `Measure`  
a measure control implements mapboxgl.IControl, you can measure point(lng,lat), line(distance), polygon(area) with it. 

``` ts
const map = new mapboxgl.Map({...});

map.addControl(new MeasureControl(options)) // options can be null
```

*args* 
- [MeasureControlOptions](./lib/controls/MeasureControl.ts)  
- [MeasurePointOptions](./lib/features/Meature/MeasurePoint.ts)  
- [MeasureLineStringOptions](./lib/features/Meature/MeasureLineString.ts)  
- [MeasurePolygonOptions](./lib/features/Meature/MeasurePolygon.ts)  

*mouse operation* 
- left click : add a point
- right click : remove a point
- left double click : finish measure and start next

you can also config custom ui with this three class of measure， you can find all public functions in [MeasureBase](./lib/features/Meature/MeasureBase.ts), custom is so easy.

*add*  
- [MeasureControlOptions](./lib/controls/MeasureControl.ts) `geometryClick` creat measure geometry click handler to popup Copy/Delete feature