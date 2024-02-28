import { deep, dom } from 'wheater';
import { svg, language, drag } from '../../common';
import { ExportGeoJsonType, MarkerFeatureType, MarkerLayerProperties } from "./types";
import { getMapMarkerSpriteImages } from "./symbol-icon";
import Exporter from "./exporter/Exporter";
import { FileType, export_converters } from "./exporter/ExportConverter";
import { TCoordConvertOptions, TCoordConverterType } from '../../common/proj';

const { SvgBuilder } = svg;
const { lang } = language;
const { DragBox } = drag;

const coordConvertOptions: TCoordConvertOptions = {
    type: 'cgcs2000_gauss_kruger',
    lon_0: 120,
    x_0: 500000,
    towgs84: ""
}

export interface ModalOptions {
    content: HTMLElement | string,
    title?: string,
    onCancel?(): void,
}

export interface ConfirmModalOptions extends ModalOptions {
    onConfirm?(): void,
    withCancel?: boolean
}

export function createModal(options: ModalOptions): [HTMLElement, () => void] {
    const modal = dom.createHtmlElement('div', ['jas-modal']);
    const container = dom.createHtmlElement('div', ['jas-modal-container']);

    const header = dom.createHtmlElement('div', ['jas-modal-header']);
    const titleDiv = dom.createHtmlElement('div', ['jas-modal-header-title']);
    const closeBtn = new SvgBuilder('X').create('svg');

    titleDiv.innerText = options.title ?? '';
    closeBtn.style.cursor = 'pointer'
    closeBtn.addEventListener('click', () => {
        options.onCancel?.call(undefined);
        modal.remove();
    });

    header.append(titleDiv);
    header.append(closeBtn);
    container.append(header);
    container.append(options.content);

    modal.append(container);
    document.body.append(modal);

    container.style.top = '0';
    container.style.left = `${(modal.clientWidth - container.clientWidth) / 2}px`;
    DragBox(container, header)

    const escPress = (e: KeyboardEvent) => {
        if (e.code.toLocaleLowerCase() === 'escape') {
            document.removeEventListener('keydown', escPress);
            options.onCancel?.call(undefined);
            modal.remove();
        }
    }
    document.addEventListener('keydown', escPress);

    const remove = () => {
        modal.remove();
        document.removeEventListener('keydown', escPress);
    }
    return [container, remove];
}

export function createConfirmModal(options: ConfirmModalOptions) {
    options.withCancel ??= true;
    const [container, remove] = createModal(options);
    const footDiv = dom.createHtmlElement('div', ['jas-modal-foot']);

    const confirmBtn = dom.createHtmlElement('button', ['jas-btn', 'jas-btn-confirm']);
    const cancleBtn = dom.createHtmlElement('button', ['jas-btn', 'jas-btn-default']);
    confirmBtn.innerText = lang.confirm;
    cancleBtn.innerText = lang.cancel;

    confirmBtn.addEventListener('click', () => {
        options.onConfirm?.call(undefined);
        remove();
    });
    cancleBtn.addEventListener('click', () => {
        options.onCancel?.call(undefined);
        remove();
    });

    footDiv.append(confirmBtn);
    if (options.withCancel)
        footDiv.append(cancleBtn);
    container.append(footDiv);
}

export function createExportModal(fileName: string, geojson: ExportGeoJsonType) {

    const createInputBindingElement = makeCIBEFunc();

    const projUI = dom.createHtmlElement('div', [], [
        dom.createHtmlElement('div', ['jas-modal-content-edit-header'], [lang.proj]),
        dom.createHtmlElement('div', ['jas-modal-content-edit-divBorder'], [

            // 选择坐标系
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], ["coord"]),
                dom.createHtmlElement('select', ['jas-select'], [], {
                    onChange: (_, element) => { coordConvertOptions.type = element.selectedOptions[0].value as any; },
                    onInit: element => {
                        element.innerHTML = (["cgcs2000_gauss_kruger", "bj54_gauss_kruger", "wgs84_pseudo_mercator"] as Array<TCoordConverterType>)
                            .map(x => `<option value="${x}" ${x === coordConvertOptions.type ? 'selected' : ''}>${x}</option>`).join('');
                    }
                })
            ]),
            // 中央纬度
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], ["lat_0"]),
                createInputBindingElement(coordConvertOptions, 'lat_0', e => {
                    e.type = 'number';
                    e.max = '90';
                    e.min = '-90';
                })
            ]),

            // 中央经度 
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], ["lon_0"]),
                createInputBindingElement(coordConvertOptions, 'lon_0', e => {
                    e.type = 'number';
                    e.max = '180';
                    e.min = '-180';
                })
            ]),
            // 东向加常数
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], ["x_0"]),
                createInputBindingElement(coordConvertOptions, 'x_0', e => {
                    e.type = 'number';
                })
            ]),
            // 北向加常数
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], ["y_0"]),
                createInputBindingElement(coordConvertOptions, 'y_0', e => {
                    e.type = 'number';
                })
            ]),

            // 4参数或7参数
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], ["towgs84"]),
                createInputBindingElement(coordConvertOptions, 'towgs84', e => {
                    e.type = "text";
                })
            ]),
        ])]);

    let exportFileType: FileType = 'dxf';
    const label_select = dom.createHtmlElement('div', [], [
        dom.createHtmlElement('span', [], [lang.fileType]),
        dom.createHtmlElement('select', ['jas-select'], [], {
            onChange: (_, element) => {
                exportFileType = element.value as any;

                if (exportFileType === 'dxf')
                    projUI.style.display = '';
                else
                    projUI.style.display = 'none';
            },
            onInit: element => {
                element.innerHTML = export_converters.map(x => `<option value="${x.type}" ${exportFileType === x.type ? 'selected' : ''}>${x.type}</option>`).join('');
            }
        })], {
        onInit: (element) => {
            element.style.display = 'flex';
            element.style.justifyContent = 'space-between';
        }
    });


    const content = dom.createHtmlElement('div', [], [
        label_select,
        projUI
    ]);

    createConfirmModal({
        title: lang.exportItem,
        content,
        onCancel: () => { },
        onConfirm: () => {
            new Exporter(exportFileType).export(fileName, geojson, {
                coordConvertOptions
            });
        }
    })
}

type EditMode = "update" | "create";

function makeCIBEFunc(onPropChange?: <T>(v: T) => void) {
    return function createInputBindingElement<T>(v: T, k: keyof T, config?: (element: HTMLInputElement) => void) {
        const input = dom.createHtmlElement('input', ['jas-input']);
        input.value = (v as any)[k] as string;
        config?.call(undefined, input);
        input.classList.add(input.type);

        input.addEventListener('change', e => {
            const value = (e.target as any).value;
            if (input.type === 'number') {
                const n = Number.parseFloat(value);

                // 超出限定 数据还原不执行更新操作
                if (n > Number.parseFloat(input.max) || n < Number.parseFloat(input.min)) {
                    input.value = (v as any)[k] as string;
                    return;
                }
                v[k] = n as any;
            } else
                v[k] = value;

            onPropChange?.call(undefined, v);
        });

        return input;
    }
}

function makeColorInputFunc(onPropChange?: <T>(v: T) => void) {
    const cinFunc = makeCIBEFunc(onPropChange);
    return function createColorInputBindingElement<T>(v: T, k: keyof T) {
        const container = dom.createHtmlElement('div', ['jas-custom-color-picker']);
        const h5ColorInput = cinFunc(v, k, element => {
            element.type = "color"
        });

        const presetColors = dom.createHtmlElement('div', ['jas-flex-center'])
        presetColors.append(...['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#000000'].map(color => {
            const item = dom.createHtmlElement('div', ['jas-custom-color-item']);
            item.style.backgroundColor = color;

            item.addEventListener('click', () => {
                v[k] = color as any;
                h5ColorInput.value = color;
                onPropChange?.call(undefined, v);
            });

            return item;
        }));

        container.append(presetColors, h5ColorInput);
        return container;
    }
}

export function createMarkerLayerEditModel(layer: MarkerLayerProperties, options: Omit<Omit<Omit<ConfirmModalOptions, 'content'>, 'withCancel'>, 'title'> & {
    mode: EditMode,
}) {
    const layerCopy = deep.clone(layer);
    const content = dom.createHtmlElement('div', ['jas-modal-content-edit']);
    const createInputBindingElement = makeCIBEFunc();

    content.append(lang.nameText, createInputBindingElement(layer, 'name', input => {
        input.type = 'text';
        input.maxLength = 12;
    }));

    createConfirmModal({
        'title': options.mode === 'update' ? lang.editItem : lang.newItem,
        content,
        onCancel: () => {
            // 数据恢复
            deep.setProps(layerCopy, layer);
            options.onCancel?.call(undefined);
        },
        onConfirm: options.onConfirm
    })
}

export function createFeaturePropertiesEditModal(
    feature: MarkerFeatureType,
    options: Omit<Omit<Omit<ConfirmModalOptions, 'content'>, 'withCancel'>, 'title'> & {
        mode: EditMode,
        layers: MarkerLayerProperties[],
        onPropChange?(): void
    }) {

    const createInputBindingElement = makeCIBEFunc(options.onPropChange);
    const createColorBindingElement = makeColorInputFunc(options.onPropChange);

    function createSelectBindingElement<T>(v: T, k: keyof T, config?: (element: HTMLSelectElement) => void) {
        const input = dom.createHtmlElement('select', ['jas-select']);
        input.value = (v as any)[k] as string;
        config?.call(undefined, input);

        input.addEventListener('change', e => {
            v[k] = (e.target as any).value;
        });

        return input;
    }

    const properties = feature.properties;

    if (options.mode === 'create' && (
        !properties.layerId ||
        !options.layers.some(x => x.id === feature.properties.layerId)))
        properties.layerId = options.layers[0].id;

    const propsCopy = deep.clone(properties);
    const geoType = feature.geometry.type;

    const content = dom.createHtmlElement('div', ['jas-modal-content-edit']);

    //#region 添加图层选择


    content.append(dom.createHtmlElement('div',
        ['jas-modal-content-edit-item'],
        [dom.createHtmlElement('label', [], [lang.chooseLayer]), createSelectBindingElement(properties, 'layerId', x => {
            options.layers.forEach(l => {
                x.innerHTML += `<option value="${l.id}">${l.name}</option>`
            });
            x.value = properties.layerId;
        })]))

    //#endregion
    content.append(dom.createHtmlElement('div',
        ['jas-modal-content-edit-item'],
        [dom.createHtmlElement('label', [], [lang.markerName]), createInputBindingElement(properties, 'name', input => {
            input.type = 'text';
            input.maxLength = 12;
        })]));


    content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-header'], [lang.word]));

    content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-divBorder'],
        [dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [dom.createHtmlElement('label', [], [lang.fontColor]), createColorBindingElement(properties.style, 'textColor')]),
        dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [dom.createHtmlElement('label', [], [lang.fontSize]),
        createInputBindingElement(properties.style, 'textSize', input => {
            input.type = 'number';
            input.min = '1';
            input.max = '30';
        })]),
        dom.createHtmlElement('div', ['jas-modal-content-edit-item'],
            [dom.createHtmlElement('label', [], [lang.textHaloColor]), createColorBindingElement(properties.style, 'textHaloColor')]),
        dom.createHtmlElement('div', ['jas-modal-content-edit-item'],
            [dom.createHtmlElement('label', [], [lang.textHaloWidth]), createInputBindingElement(properties.style, 'textHaloWidth', input => {
                input.type = 'number';
                input.min = '1';
                input.max = '10';
            })]),
        ]))



    if (geoType === 'Point' || geoType === 'MultiPoint') {
        getMapMarkerSpriteImages(images => {
            const imagesContainer = dom.createHtmlElement('div');
            imagesContainer.style.width = '300px';
            imagesContainer.style.height = '220px';
            imagesContainer.style.overflowY = 'auto';

            let lastClickImg: HTMLImageElement;

            images.forEach((v, k) => {
                const imgElement = dom.createHtmlElement('img');
                imgElement.src = v.url;
                imgElement.height = 30;
                imgElement.width = 30;
                imagesContainer.append(imgElement);

                imgElement.style.cursor = 'pointer';
                imgElement.style.borderRadius = '4px';
                imgElement.style.padding = '4px';

                if (properties.style.pointIcon === k) {
                    imgElement.style.backgroundColor = '#ccc';
                    lastClickImg = imgElement;
                }

                imgElement.addEventListener('click', () => {
                    if (lastClickImg)
                        lastClickImg.style.backgroundColor = '#fff';
                    imgElement.style.backgroundColor = '#ccc';
                    lastClickImg = imgElement;
                    properties.style.pointIcon = k;
                    options.onPropChange?.call(undefined);
                });
            });


            content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-header'], [lang.pointIcon]))
            content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-divBorder'], [
                dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                    dom.createHtmlElement('label', [], [lang.iconText]), imagesContainer]),
                dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                    dom.createHtmlElement('label', [], [lang.iconText]), createColorBindingElement(properties.style, 'pointIconColor')]),
                dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                    dom.createHtmlElement('label', [], [lang.iconSize]), createInputBindingElement(properties.style, 'pointIconSize', input => {
                        input.type = 'number';
                        input.min = '0.1';
                        input.step = '0.1';
                        input.max = '1';
                    })])
            ]))
        });
    }
    else if (geoType === 'LineString' || geoType === 'MultiLineString') {

        content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-header'], [lang.line]))
        content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-divBorder'], [
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.lineColor]), createColorBindingElement(properties.style, 'lineColor')]),
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.lineWidth]), createInputBindingElement(properties.style, 'lineWidth', input => {
                    input.type = 'number';
                    input.min = '1';
                    input.step = '1';
                    input.max = '10';
                })])
        ]))
    }
    else if (geoType === 'Polygon' || geoType === 'MultiPolygon') {

        content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-header'], [lang.outline]))
        content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-divBorder'], [
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.polygonOutlineColor]), createColorBindingElement(properties.style, 'polygonOutlineColor')]),
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.polygonOutlineWidth]), createInputBindingElement(properties.style, 'polygonOutlineWidth', element => {
                    element.type = 'number';
                    element.min = '1';
                    element.step = '1';
                    element.max = '10';
                })])
        ]));

        content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-header'], [lang.polygon]))
        content.append(dom.createHtmlElement('div', ['jas-modal-content-edit-divBorder'], [
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.polygonColor]), createColorBindingElement(properties.style, 'polygonColor')]),
            dom.createHtmlElement('div', ['jas-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.polygonOpacity]), createInputBindingElement(properties.style, 'polygonOpacity', element => {
                    element.type = 'number'
                    element.min = '0';
                    element.step = '0.1';
                    element.max = '1';
                })])
        ]));
    }

    createConfirmModal({
        'title': options.mode === 'update' ? lang.editItem : lang.newItem,
        content,
        onCancel: () => {
            // 数据恢复
            feature.properties = propsCopy;
            options.onCancel?.call(undefined);
            options.onPropChange?.call(undefined);
        },
        onConfirm: () => {
            if (!deep.equal(propsCopy, feature.properties))
                options.onConfirm?.();
        }
    })
}