import mapboxgl, { AnyLayer, IControl, Map } from "mapbox-gl";
import SwitchGroupContainer from "../features/SwitchMap/SwitchGroupContainer";
import { SelectAndClearAllOptions, ShowToTopOptions, SwitchGroupLayers, SwitchLayerItem } from "../features/SwitchMap/types";
import { changeSvgColor, createHtmlElement, orderBy } from "../utils";

//#region img_satellite & img_base
const img_satellite = `data:image/png;base64,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`;

const img_base = `data:image/png;base64,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`;

//#endregion

export type LayerGroupsType = Record<string, SwitchGroupLayers>;

interface SwitchMapItemOption {
  /**
   * 切换图层显示的名称
   */
  name?: string

  /**
   * 显示的名称颜色
   */
  textColor?: string,

  /**
   * 背景图片 
   */
  backgroundImage?: string,
}

export interface SwitchMapExtraInfo extends SelectAndClearAllOptions, ShowToTopOptions {

  /**
   * 附加信息名字 默认：附加图层
   */
  name?: string;

  /**
   * 图钉被激活的颜色
   */
  nailActiveColor?: string,

  layerGroups?: LayerGroupsType;
}

export interface SwitchMapControlOptions {
  baseOption?: SwitchMapItemOption,
  satelliteOption?: SwitchMapItemOption,
  showSatelliteDefault?: boolean,
  extra?: SwitchMapExtraInfo
}

export function appendLayerGroups(
  map: mapboxgl.Map,
  container: HTMLElement,
  layerGroups: LayerGroupsType,
  options: SelectAndClearAllOptions & ShowToTopOptions = {}) {

  const allLayers = new Array<SwitchLayerItem>();
  const groupContainers = new Array<SwitchGroupContainer>();

  for (let groupName in layerGroups) {
    const { layers, mutex } = layerGroups[groupName];
    let onceLayerActiveMutex = false;

    layers.forEach(item => {
      // 检查互斥active
      if (item.active && onceLayerActiveMutex)
        throw new Error("exsit mutex layer active at same time!");
      if ((item.mutex || mutex) && item.active)
        onceLayerActiveMutex = true;

      // 初始化默认值
      item.zoom ??= 0;
      allLayers.push(item);
    })
  }

  orderBy(allLayers, l => l.zoom!);
  allLayers.forEach(l => {
    if (l.layer instanceof Array<AnyLayer>)
      l.layer.forEach(x => map.addLayer(x));
    else
      map.addLayer(l.layer);
  })

  for (let groupName in layerGroups) {
    const groupContainer = new SwitchGroupContainer(map, groupName, layerGroups[groupName], options);
    container.append(groupContainer.element);
    groupContainers.push(groupContainer);
  }

  return groupContainers;
}

export abstract class SwitchLayerBaseControl implements IControl {
  protected groupContainers: Array<SwitchGroupContainer> = [];

  abstract onAdd(map: mapboxgl.Map): HTMLElement;

  onRemove(map: mapboxgl.Map): void {
    this.groupContainers.forEach(gc => {
      gc.layerBtns.forEach(lb => {
        const layer = lb.options.layer;

        if (layer instanceof Array) {
          layer.forEach(l => map.removeLayer(l.id));
        } else {
          map.removeLayer(layer.id);
        }
      })
    });
  }

  changeLayerVisible(id: string, value: boolean) {
    for (let i = 0; i < this.groupContainers.length; i++) {
      const gc = this.groupContainers[i];
      for (let j = 0; j < gc.layerBtns.length; j++) {
        const lBtn = gc.layerBtns[j];

        if (lBtn.id === id)
          lBtn.changeChecked(value, true);
      }
    }
  }
}

export default class SwitchMapControl extends SwitchLayerBaseControl {

  private nailImg = `<svg t="1673283468858" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2736" data-darkreader-inline-fill="" width="22" height="22">
  <path d="M912.9 380.2L643.5 110.9c-12.1-12.1-29.6-15.8-45.6-9.8s-26.6 20.5-27.6 37.6l-4.9 83.7-299.1 199.4-112.6-5.4c-17.8-0.7-34 9.2-41.3 25.5s-3.7 35 8.9 47.7L314.7 683 102.5 895.2c-7.2 7.2-7.2 18.8 0 26 3.6 3.6 8.3 5.4 13 5.4s9.4-1.8 13-5.4L340.7 709l193.4 193.4c8.3 8.3 19.1 12.6 30.2 12.6 5.9 0 11.8-1.2 17.4-3.7 16.3-7.2 26.3-23.4 25.5-41.3l-5.4-112.6 199.5-299.2 83.7-4.9c17.1-1 31.5-11.6 37.6-27.6s2.4-33.4-9.7-45.5z m-24.6 32.5c-0.5 1.4-1.9 3.7-5.4 3.9l-85.2 5-135.3-135.3c-7.2-7.2-18.8-7.2-26 0s-7.2 18.8 0 26l130.9 130.9-187.5 281.2-223.7-223.7c-7.2-7.2-18.8-7.2-26 0s-7.2 18.8 0 26l225.1 225.1c2.8 2.8 6.3 4.5 9.9 5.1l5.5 114.9c0.2 3.5-1.9 5.1-3.6 5.9-1.7 0.8-4.4 1.2-6.8-1.3L147.3 463.6c-2.5-2.5-2-5.1-1.3-6.8 0.8-1.7 2.5-4 5.9-3.6l118.6 5.6c3.9 0.2 7.8-0.9 11.1-3.1l311.9-207.9c4.8-3.2 7.8-8.5 8.2-14.2l5.5-92.8c0.2-3.5 2.6-4.8 3.9-5.4 1.4-0.5 4.1-1 6.5 1.4l269.3 269.3c2.4 2.5 1.9 5.2 1.4 6.6z" fill="#2D3742" p-id="2737" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#0d1722;">
  </path></svg>`;

  private alertDivShowAlways = false;


  constructor(private options: SwitchMapControlOptions = {}) {
    options.baseOption ??= {};
    options.baseOption.name ??= '电子地图';
    options.baseOption.textColor ??= 'black';
    options.baseOption.backgroundImage ??= img_base;

    options.satelliteOption ??= {};
    options.satelliteOption.name ??= '卫星影像';
    options.satelliteOption.textColor ??= 'black';
    options.satelliteOption.backgroundImage ??= img_satellite;

    options.showSatelliteDefault ??= false;

    if (options.extra) {
      options.extra.name ??= '附加图层';
      options.extra.nailActiveColor ??= "#0066FF";

      options.extra.selectAndClearAll ??= true;
      options.extra.selectAllLabel ??= "全选";
      options.extra.clearAllLabel ??= "清空";
    }

    super();
  }

  onAdd(map: Map): HTMLElement {

    map.addLayer({
      id: "mapbox-satellite",
      type: "raster",
      source: {
        type: 'raster',
        tiles: [`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=${mapboxgl.accessToken}`],
        tileSize: 256
      },
      layout: {
        visibility: this.options.showSatelliteDefault ? 'visible' : 'none'
      }
    })

    const baseDiv = this.createBaseLayerDiv(map);

    const layerGroups = this.options.extra?.layerGroups;
    if (layerGroups && Object.getOwnPropertyNames(layerGroups).length > 0) {
      const { alertDiv, groupsDiv } = this.createGroupLayerAlertDiv();

      this.groupContainers = appendLayerGroups(map, groupsDiv, layerGroups, this.options.extra);

      baseDiv.append(alertDiv);
      baseDiv.addEventListener('mouseover', e => {
        alertDiv.style.pointerEvents = 'auto';
      })
    }

    return baseDiv;
  }

  getDefaultPosition() {
    return 'bottom-right'
  }

  /**
   * 基础图层切换
   * @param map 
   * @returns 
   */
  private createBaseLayerDiv(map: Map) {
    // 创建按钮
    const div = createHtmlElement('div', "jas-ctrl-switchmap", "mapboxgl-ctrl");

    // 创建文字
    const text_div = createHtmlElement('div', "jas-ctrl-switchmap-text")
    div.append(text_div);

    const changeDiv = (option: SwitchMapItemOption) => {
      text_div.innerText = option.name!;
      text_div.style.color = option.textColor!;
      div.style.backgroundImage = `url("${option.backgroundImage}")`;
    }

    // 初始化
    changeDiv(this.options.showSatelliteDefault ? this.options.baseOption! : this.options.satelliteOption!);

    div.addEventListener("click", () => {
      const satelliteVisibled = map.getLayoutProperty('mapbox-satellite', 'visibility') === 'visible';
      changeDiv(satelliteVisibled ? this.options.satelliteOption! : this.options.baseOption!);
      map.setLayoutProperty('mapbox-satellite', 'visibility', satelliteVisibled ? 'none' : 'visible');
    });

    div.addEventListener('mouseover', () => {
      if (!div.classList.contains('alert-is-shown'))
        div.classList.add('alert-is-shown');
    })

    div.addEventListener('mouseout', () => {
      if (div.classList.contains('alert-is-shown') && !this.alertDivShowAlways)
        div.classList.remove('alert-is-shown');
    })

    return div;
  }

  private createGroupLayerAlertDiv(): { alertDiv: HTMLDivElement, groupsDiv: HTMLDivElement } {
    const alertDiv = createHtmlElement('div', "jas-ctrl-switchmap-alert", "mapboxgl-ctrl-group");

    alertDiv.addEventListener('click', e => {
      e.stopPropagation()
    })

    alertDiv.addEventListener('mouseout', e => {
      if (!this.alertDivShowAlways)
        alertDiv.style.pointerEvents = 'none';
    })

    const headerDiv = createHtmlElement('div', "jas-ctrl-switchmap-alert-header");
    headerDiv.innerHTML = `<div>${this.options.extra?.name}</div>`;
    const nailDiv = createHtmlElement('div', 'jas-ctrl-switchmap-alert-header-nail');
    nailDiv.innerHTML = this.nailImg;
    headerDiv.append(nailDiv);

    nailDiv.addEventListener('click', () => {
      this.alertDivShowAlways = !this.alertDivShowAlways;
      nailDiv.classList.toggle('active');
      changeSvgColor(nailDiv.children[0] as SVGAElement, this.alertDivShowAlways ? this.options.extra!.nailActiveColor! : '#2D3742');
    });

    const groupsDiv = createHtmlElement('div', "jas-ctrl-switchmap-alert-container", "jas-ctrl-custom-scrollbar");

    alertDiv.append(headerDiv);
    alertDiv.append(groupsDiv);

    return { alertDiv, groupsDiv };
  }
}


interface SwitchLayerOptions extends SelectAndClearAllOptions, ShowToTopOptions {
  /**
   * 名称 ：默认'图层'
   */
  name?: string,
  layerGroups: LayerGroupsType
}

export class SwitchLayerControl extends SwitchLayerBaseControl {

  private readonly img = `<svg t="1682610567805" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4548" data-darkreader-inline-fill="" width="32" height="32">
  <path d="M852.6 462.9l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 764.1c-17.3 10.8-39.2 10.8-56.4 0L159.3 560c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 659c17.3 10.8 39.2 10.8 56.4 0l312.2-196 0.1-0.1z m0 156.1l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 920.2c-17.3 10.8-39.2 10.8-56.4 0L159.3 716.1c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 815c17.3 10.8 39.2 10.8 56.4 0l312.2-196h0.1zM540 106.4l324.6 204.1c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 604c-17.3 10.8-39.2 10.8-56.4 0L159.3 399.8c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l324.4-203.7c17.3-10.8 39.2-10.8 56.4 0l-0.1 0.2z" p-id="4549">
  </path></svg>`

  private readonly img_close = `<svg t="1682650657674" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2620" width="28" height="28">
  <path d="M572.16 512l183.466667-183.04a42.666667 42.666667 0 1 0-60.586667-60.586667L512 451.84l-183.04-183.466667a42.666667 42.666667 0 0 0-60.586667 60.586667l183.466667 183.04-183.466667 183.04a42.666667 42.666667 0 0 0 0 60.586667 42.666667 42.666667 0 0 0 60.586667 0l183.04-183.466667 183.04 183.466667a42.666667 42.666667 0 0 0 60.586667 0 42.666667 42.666667 0 0 0 0-60.586667z" p-id="2621" fill="#8a8a8a">
  </path></svg>`

  private minWidth = 600;

  /**
   *
   */
  constructor(private options: SwitchLayerOptions) {
    options.name ??= "图层";

    options.selectAndClearAll ??= true;
    options.clearAllLabel ??= "清空";
    options.selectAllLabel ??= "全选";

    super();
  }

  onAdd(map: mapboxgl.Map): HTMLElement {
    const [mobileContainer, mobileGroups, mobileClose] = this.createMobileUI(map);
    const [desktopContainer, desktopGroups, desktopClose] = this.createDesktopUI(map);

    const isMobile = map.getContainer().clientWidth < this.minWidth;
    this.groupContainers = appendLayerGroups(
      map,
      isMobile ? mobileGroups : desktopGroups,
      this.options.layerGroups,
      this.options
    );
    if (isMobile) {
      desktopContainer.classList.add("jas-ctrl-hidden");
    } else {
      mobileContainer.classList.add("jas-ctrl-hidden");
    }

    const toggleBtn = createHtmlElement('div', "jas-ctrl-switchlayer", "jas-btn-active", "jas-flex-center", "jas-one-button-mapbox", "mapboxgl-ctrl", "mapboxgl-ctrl-group");
    toggleBtn.innerHTML = this.img;

    const handelShowChange = () => {
      mobileContainer.classList.toggle("jas-ctrl-switchlayer4mobile-container-active");
      desktopContainer.classList.toggle("jas-ctrl-switchlayer4desktop-container-active");

      const show = desktopContainer.classList.contains("jas-ctrl-switchlayer4desktop-container-active");
      desktopContainer.style.pointerEvents = show ? "" : 'none';
    }

    toggleBtn.addEventListener('click', handelShowChange);
    mobileClose.addEventListener('click', handelShowChange);
    desktopClose.addEventListener('click', handelShowChange);

    map.on('resize', e => {
      const width = map.getContainer().clientWidth;
      if (width < this.minWidth) {
        desktopContainer.classList.add("jas-ctrl-hidden");
        mobileContainer.classList.remove("jas-ctrl-hidden");

        if (mobileGroups.children.length === 0)
          mobileGroups.append(...desktopGroups.children)
      } else {
        mobileContainer.classList.add("jas-ctrl-hidden");
        desktopContainer.classList.remove("jas-ctrl-hidden");

        if (desktopGroups.children.length === 0)
          desktopGroups.append(...mobileGroups.children)
      }
    });

    toggleBtn.append(desktopContainer)

    return toggleBtn;
  }

  getDefaultPosition() {
    return 'top-right'
  }

  private createDesktopUI(map: mapboxgl.Map) {
    const container = createHtmlElement('div', "jas-ctrl-switchlayer4desktop-container");

    const header = createHtmlElement('div', "jas-ctrl-switchlayer-container-header");
    const label = createHtmlElement('div', "jas-ctrl-switchlayer-container-header-label");
    label.innerText = this.options.name!;
    const close = createHtmlElement('div', "jas-ctrl-switchlayer-container-header-close");
    close.innerHTML = this.img_close;
    header.append(label, close);

    const groups = createHtmlElement('div', "jas-ctrl-switchlayer4desktop-container-groups", "jas-ctrl-custom-scrollbar");

    container.append(header, groups);

    // 阻止事件穿透父级
    container.addEventListener('click', e => {
      e.stopPropagation();
    })

    return [container, groups, close];
  }

  private createMobileUI(map: mapboxgl.Map) {
    const container = createHtmlElement('div', "jas-ctrl-switchlayer4mobile-container");

    const header = createHtmlElement('div', "jas-ctrl-switchlayer-container-header");
    const label = createHtmlElement('div', "jas-ctrl-switchlayer-container-header-label");
    label.innerText = this.options.name!;
    const close = createHtmlElement('div', "jas-ctrl-switchlayer-container-header-close");
    close.innerHTML = this.img_close;
    header.append(label, close);

    const groups = createHtmlElement('div', 'jas-ctrl-switchlayer4mobile-container-groups');
    container.append(header, groups);
    map.getContainer().append(container);

    return [container, groups, close]
  }

}