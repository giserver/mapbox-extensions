import { deep } from "wheater";

interface ILanguageOptions {
    title: string,
    searchPlaceholder: string,
    nameText: string

    newMarkerName: string,
    newLayer: string,
    chooseLayer: string,

    markerName: string,
    fontSize: string,
    fontColor: string,
    iconText: string,
    iconSize: string,
    iconColor: string,
    textHaloWidth: string,
    textHaloColor: string,
    lineWidth: string,
    lineColor: string,
    polygonColor: string,
    polygonOpacity: string,
    polygonOutlineWidth: string,
    polygonOutlineColor: string,

    defaltLayerName: string,
    fileType: string,

    newItem: string,
    editItem: string,
    importItem: string,
    exportItem: string,
    deleteItem: string,
    visibility: string,
    cannotDeleteLastLayer: string,

    warn: string,
    confirm: string,
    cancel: string,

    word: string,
    point: string,
    pointIcon: string,
    line: string,
    outline: string,
    polygon: string,

    edit_graph: string,
    area: string,
    length: string,

    proj: string
}

const zh: ILanguageOptions = {
    title: "标注",
    searchPlaceholder: "请输入标注名称",
    nameText: '名称',

    newMarkerName: "标注",
    newLayer: "新建图层",
    chooseLayer: "选择图层",

    markerName: "标注名称",
    fontSize: "大小",
    fontColor: "颜色",
    iconText: "图形",
    iconSize: "图形大小",
    iconColor: "图形颜色",
    textHaloWidth: "轮廓宽度",
    textHaloColor: "轮廓颜色",
    lineWidth: "宽度",
    lineColor: "颜色",
    polygonColor: "颜色",
    polygonOpacity: "透明度",
    polygonOutlineWidth: "宽度",
    polygonOutlineColor: "颜色",

    defaltLayerName: "默认图层",
    fileType: "文件类型",

    newItem: "新增",
    editItem: "编辑",
    importItem: "导入",
    exportItem: "导出",
    deleteItem: "删除",
    visibility: "显隐",
    cannotDeleteLastLayer: "无法删除最后一个图层",

    warn: "警告",
    confirm: "确认",
    cancel: "取消",

    word: "文字",
    point: "点",
    pointIcon: '图标',
    line: "线",
    outline: "轮廓线",
    polygon: '面',

    edit_graph: '编辑图形',
    area: '面积',
    length: '长度',

    proj: '投影'
}

const en: ILanguageOptions = {
    title: "Mark",
    searchPlaceholder: "please input marker name",
    nameText: 'name',

    newMarkerName: "new-item",
    newLayer: "new-layer",
    chooseLayer: "choose layer",

    markerName: "text",
    fontSize: "font size",
    fontColor: "font color",
    iconText: "icon",
    iconSize: "icon size",
    iconColor: "icon color",
    textHaloWidth: "text halo width",
    textHaloColor: "text halo color",
    lineWidth: "line width",
    lineColor: "line color",
    polygonColor: "color",
    polygonOpacity: "opacity",
    polygonOutlineWidth: "outline width",
    polygonOutlineColor: "outline color",

    defaltLayerName: "default layer",
    fileType: "file type",

    newItem: "create",
    editItem: "edit",
    importItem: "import",
    exportItem: "export",
    deleteItem: "delete",
    visibility: "visibility",
    cannotDeleteLastLayer: "can not delete last layer",

    warn: "warning",
    confirm: "confirm",
    cancel: "cancel",

    word: "word",
    point: "point",
    pointIcon: 'point icon',
    line: "line",
    outline: "outline",
    polygon: 'polygon',

    edit_graph: 'edit graph',
    area: 'area',
    length: 'length',

    proj: 'proj'
}

const lang = zh;

function reset(l?: ILanguageOptions) {
    if (l)
        deep.setProps(l, lang);
}

function change(l?: Partial<ILanguageOptions>) {
    if (!l) return;

    let p: keyof ILanguageOptions;
    for (p in l) {
        if (l[p]) lang[p] = l[p]!;
    }
}

export { lang, zh, en, reset, change, ILanguageOptions };
