import mapboxgl from "mapbox-gl";
import { dom, validator } from 'wheater';
import { svg, types } from '../common';
import { SwitchLayerControl, SwitchLayerBaseControl } from ".";

import { SwitchLayerGroupsType, SelectAndClearAllOptions, ShowToTopOptions, SwitchGroupContainer } from "../features/switch-layer";

//#region img_satellite & img_base
const img_satellite = `data:image/png;base64,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`;

const img_base = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABMCAYAAAD3G0AKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAArpSURBVHgB7ZyJdqLYFoaPiII4ZqpUVdddd933f6vbXVXdMYlDnEXs/R3FRgoQFRWT/rOyEieEnz3vfU7B87xlu9NWtmmrQqGgojCZzdTP147i1c93t8oulVQclvL7R7utxtPZ1vMc+7+Pn1TZNFUeMVu4ynEcVSlb+vHbaKgWrquKBUMdAsOVAxb4iSEV2OWyemy11MLz1F+drv4bB44SRd5yudQ36KNgRWwCqT4qVlk1q1U1FXJ+f2qrt/FYkxWFOKn8cMQaKcQd8pu1qpbemajIn2IaXt8GkeSWYomdq48CY7FYpCIWlIpFddeoy/sLmtDXtzf9GwYSG6UFSGyclL83GOK8UpkCH1XbVq1aTf8PSS/9NzWaTrfeYwqxRswxxx/EHBgLb6Gd1z5oiUkI2tGnbndLEiH1o5sDA0L2kVhgYhKajc3nZnNXPff6ofdEm5eP4sCMYqGoDkHVslS9Utk87o1GW2pul8qRn5t+EDtrCNQh4HM3Ymt9W4qtbgdMglWOTiIW8vpcHGYesa9JTIJhHJhZgLKQVwtILfazNxytDxx9XG7AdJ4/O4tAGIWcEMtp3LeaWyR2JPyCvLiQC0w/gJ09nNU1TCG1KTm2D9R8LJILqTi5KIym79/OHk0sIPwKqtFwMtaP41JbyPf+JTbFQURqi4HwajCZaImMI5Zsb5ZDO5sVKFKdpIbnuguxtYPEKthUYt+KZalD4JsRpN5F+uV7XG8pfxdqLt9N0uMu5DldYJKbniLyqTq2agS/Q3664i84DkB4djm3uZzHXMwgGpkJsVFf99zvJyYepMGYkLRYrkkcijagESQl3tJTvkU51maXSkVNZhCDyVQc7WGalQmx3E2kb+6Otp5Puti0GRjH4CagAXzmGNuM5PL5czjOzExB06lK1X2c+qSRvrmUH6NqCpiQsZBZlKjiTTI6YuPwcdOk4broLt0OasmOlDvL5fLm+Py68v2YDu0PSqba1r2CFpZyMeL8RFPUjsvMjFhOnlrtOFTpSgJ2NkgsF0haTMXMl+it4o5IHA6xJhU2vk/tIJdwj3AwfBNKfhgYsPFTdx6iVanbeu3g1kymzqtesfciFhWvyWcAUUK721OjiFqCJdJUtSuq7lQSE4+swfcc+l2ZEkvr5lWkzU2IBoLwMzDsXmc4VMPQTcEmNsTB3chx45KNvCJTYrm7jqhpfzRK9f6p2Dhquah90PtCKDWIG1HFs3V1M1aCzM8aMpIajUEQf3YHw63nuDG39bpyrLI6K1B7Izt2MycWCauIExvtYWv1iYiqE9diTtIE9HlH5leAOaDhuI/RtyQkerxpaUl9D6SCk1wF8R8ePA0I0b493Osm5XvCycTjZt3J3QXk2jhT+HROnIzYtDn2ROLXRcrw7JpwEmIJnyjCpMFqpuvyJUStMxmWEDIlFpKoF3x/ftG1AL84swuDcbq495qQGbGQymzBz9dXrdrUAH67u1Vfb292enpaNe+to5BJHEtHoC2k+hmXY1vq882Njk2JZ3dRhnT3JKVN6/DOBeqzupKV/KZIHE0spKD6tLSJXSmqMEuLGUBykWIvhXMiAyM5yEuEwGlw1sUd2Zjucke85ShiqUhBKq0ISP0krXDI8UGlK21Bm9poX+qu+3QVTolapSq/6mAcbGOR0O8vr5pU0thv9/eqUd0mBcfl11upgSZJIxrVGw3fja3dW2JxUrRJmIuFAjIm0tGosh5Oi2LxYDxRn8WJ6bUMcjPiyCP2HYidDt+gcyF842dU3UTr0KZ92zl7Ecsk91Onqx0Sqv8gqt/aQULDcTbmgZvAZ1jHEAeG62rymXPb2jBtkPnjxw/99xCkMgXcre5goNceQCqq/x/J71spJCtcjLESVtwAkoXxnpWxU2AgZqkgGscQ9WCwWhJQlyLRXEwgvbhms6nfx2P+t0VokG7+8rjQ7/cTZRxbipTSi9JeX0KppoRFSC/LkuxAg47GH9KZVNniBH+8vEgbO548yOfGGWesdE09V8K9hiYNHL0cKe6FoJRCKjb0cT0ARyQA2YRSy3U7+Vn6VU/yO5AidxJWJqS1NTkTBjeNDO6a8cvV6U6piPT/hVCIQpxZc8Dit/F6THMzieJ5+n/aK9hGyC+Xdlf+MSW0y+PgLxyZHWjf8oAt5+XpxRp9HaxzcYRLxKao5koytwN9n9T+aDUER7ZlldL5Q1o4o4Q4lzCuK9EHzq6Qk6RhH2wkluGJ35+edCgFSQ/Nhvrt/m7jbLg4f4Ib7/5JQqyCqDOk8tqjhFOksmlBKLar00DvbH6lUmsidcxD0dOnbc26AoaJSxFxqSWO6n9fv+i70ZeLnq7nYJGq4HqEtEAjSIHj7CkO8anXk2LO3dVJrUHx4+c6g0Iiv0hFqpTQwy/KBY7Eoz+9drQpwK42Dwzokf7bRiOxtMhiZ4bgrg0GVSnU8puo/X2zsfMDzDq1xQ4vN4/do9TV0uXFO2l3R5PrRyfnngCnqnXMYg9DX5jEjE6KZh6zosSg4aHh8BL6vU9CKkisG4ubduH44fmDk+PI+2h8leLJrmwIUB78U4rYDKORcREyEdMSilXtwwaIg2AW4TMOMcaWdsVkuVfUGzPN4u7MAlKfxYm0JERi4RwXr0chqWyluClpURGtwSQMI2zqXJcVV8Xwa3Bkiaxq+ybhFzYOJ8P4pH9R2OUsSQUcmQgjziSwjD+Pa8SiEEmsnqIWqfku9nTiziXebJxtOE1nZVUn8jV/1usaljJtEcsJo3I/Ox29BwxqGZTScwG77Rd3wiBpmFyB1G6IxWaSzlIjGEjATnZFPFurHNGfOBATiQLMmMqWTqN37EuTB+izJ2f//vysOqJmSCjquLJll3ESSGRSUkC4l/fql4kHpvxHavnQsrUK+rtuXKpjSvg2nlp6BXlv8GsfjEfd4UAP3uV1OtHAlmLTcFDEklBZTLFY7JTg5lIAuk9Id1nn9dJLN8Z0CRgsyKhfwI7ugr+wgvJi3DYoFIKiarZZRA16Md0RsmV80sMV+Q24iUweAtukBIHJYhm/TySJDEuZehmkv0vvuFqB6Uqvp1TMNtDPGkQmdWeiBzrCoB5MSs7OHX0hVK9jFVNmr9edXQrmYiknsjRznybiA2gZUV0LAmltr1tIgOvQGeGFr8e0y7Y4gpkqFy93d9OgpBd/1DYNzCB4BI1V8RfUhp11PWNvBD5zrJU2nYojkjBWnuGpY7YxORX0xLeoN5GKHlCOcUw861h2btYySHGrKFWlih42sMzjy39ZYr6evPELL76kFtZbAIZB6506Qx7MmhZRx16djLfMV5pI28jfD9HfeA2HFJdmI90zNx9bT2likVpGY+aLfBU36o6z2XGOCRUG7JiQuZfublQtwVtP4+QBm7OrlCs6KM5TSY4wijibv1+kvU5kUFjvm1iJ6VpQ/cpDgWaT0ui9AETNGPLKU4RQ1XsTWL/UBNCyKGCXscmOdVl/sXW2TtlZjQ2p/EgtEhpVaElq0Y8ObJdnOYS3dSR/0i5HvEZitU9MPHnjAzdMyzKWMKbzf07CNwdkY3kGUlxJSFcxBZceTTL6bz1RnX88KdOC7FuVd9QlwyqZ0eYAMRleeHjZoAAzmU02UquJFYnNk52NAja24UQ3HbmWqILNOWGEsxjSWrNoXkUnlMnyuFY5ddpLztfqbU6JBIKL3K5lsk/vBFqNl9rJBc2Bjgogkn0A/f+JDq7BzgKqWWaMrb1km/xv3OWg4HzzRz4AAAAASUVORK5CYII=`;

//#endregion

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

  layerGroups?: SwitchLayerGroupsType;

  /**
   * 图标 仅移动端可用
   */
  icon?: string | SVGElement,

  /**
   * 位置 仅移动端可用
   */
  position?: types.UIPosition
}

export interface SwitchMapControlOptions {
  baseOption?: SwitchMapItemOption,
  satelliteOption?: SwitchMapItemOption,
  showSatelliteDefault?: boolean,
  onBaseMapChange?(toSatellite: boolean): void,
  extra?: SwitchMapExtraInfo,
}


export class SwitchMapControl extends SwitchLayerBaseControl {
  private declare element: HTMLElement;
  private alertDivShowAlways = false;
  private declare map: mapboxgl.Map

  constructor(private options: SwitchMapControlOptions = {}) {
    options.baseOption ??= {};
    options.baseOption.name ??= '电子地图';
    options.baseOption.textColor ??= 'black';
    options.baseOption.backgroundImage ??= img_base;

    options.satelliteOption ??= {};
    options.satelliteOption.name ??= '卫星影像';
    options.satelliteOption.textColor ??= 'white';
    options.satelliteOption.backgroundImage ??= img_satellite;

    options.showSatelliteDefault ??= false;

    if (options.extra) {
      options.extra.name ??= '附加图层';
      options.extra.nailActiveColor ??= "#0066FF";

      options.extra.selectAndClearAll ??= true;
      options.extra.selectAllLabel ??= "全选";
      options.extra.clearAllLabel ??= "清空";

      options.extra.position ??= "bottom-right";
    }

    super();
  }

  onAdd(map: mapboxgl.Map): HTMLElement {
    this.map = map;

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

    this.element = this.createBaseLayerDiv(map);

    const layerGroups = this.options.extra?.layerGroups;
    if (layerGroups && Object.getOwnPropertyNames(layerGroups).length > 0) {
      if (!validator.os.isMobile()) {
        const { alertDiv, groupsDiv } = this.createGroupLayerAlertDiv();
        this.groupContainers = SwitchGroupContainer.appendLayerGroups(map, groupsDiv, layerGroups, this.options.extra);
        this.element.append(alertDiv);

        let alertTimer: NodeJS.Timeout;
        this.element.addEventListener('mouseover', e => {
          if (alertTimer) clearTimeout(alertTimer);
          alertDiv.style.pointerEvents = 'auto';
        });

        this.element.addEventListener('mouseover', () => {
          if (!this.element.classList.contains('alert-is-shown'))
            this.element.classList.add('alert-is-shown');
        });

        this.element.addEventListener('mouseout', () => {
          if (this.element.classList.contains('alert-is-shown') && !this.alertDivShowAlways) {
            this.element.classList.remove('alert-is-shown');
            alertTimer = setTimeout(() => {
              alertDiv.style.pointerEvents = 'none';
            }, 250);
          }
        });

        alertDiv.addEventListener('mouseout', e => {
          if (!this.alertDivShowAlways)
            alertDiv.style.pointerEvents = 'none';
        });
      }
    }

    return this.element;
  }

  adaptMobile() {
    if (validator.os.isMobile()) {
      this.map.addControl(new SwitchLayerControl({
        'layerGroups': this.options.extra!.layerGroups!,
        ...this.options.extra!,
      }))
    }
  }

  onRemove(map: mapboxgl.Map): void {
    super.onRemove(map);
    this.element.remove();
  }

  getDefaultPosition() {
    return 'bottom-right'
  }

  /**
   * 基础图层切换
   * @param map 
   * @returns 
   */
  private createBaseLayerDiv(map: mapboxgl.Map) {
    // 创建按钮
    const div = dom.createHtmlElement('div', ["jas-ctrl-switchmap", "mapboxgl-ctrl"]);

    // 创建文字
    const text_div = dom.createHtmlElement('div', ["jas-ctrl-switchmap-text"]);
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
      this.options.onBaseMapChange?.call(undefined, !satelliteVisibled);
    });

    return div;
  }

  private createGroupLayerAlertDiv(): { alertDiv: HTMLDivElement, groupsDiv: HTMLDivElement } {

    const headerDiv = dom.createHtmlElement('div',
      ["jas-ctrl-switchmap-alert-header"],
      [
        dom.createHtmlElement('div', [], [this.options.extra?.name || ""]),
        dom.createHtmlElement('div',
          ['jas-ctrl-switchmap-alert-header-nail'],
          [new svg.SvgBuilder("nail").create('svg')], {
          onClick: (_, t) => {
            this.alertDivShowAlways = !this.alertDivShowAlways;
            t.classList.toggle('active');
            const svg = t.children[0] as SVGAElement;
            for (let i = 0; i < svg.children.length; i++) {
              const path = svg.children[i];
              const attr = path.attributes.getNamedItem("fill");
              if (attr)
                attr.value = this.alertDivShowAlways ? this.options.extra!.nailActiveColor! : '#2D3742';
            }
          }
        })
      ]);

    const groupsDiv = dom.createHtmlElement('div', ["jas-ctrl-switchmap-alert-container", "jas-ctrl-custom-scrollbar"]);

    const alertDiv = dom.createHtmlElement('div', ["jas-ctrl-switchmap-alert", "mapboxgl-ctrl-group"], [headerDiv, groupsDiv]);

    alertDiv.addEventListener('click', e => {
      e.stopPropagation();
    });

    return { alertDiv, groupsDiv };
  }
}