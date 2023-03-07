import { UIElementBase, UIElementOptions } from "../../uis";

type CatalogItemType = 'project' | 'polygon' | 'line' | 'point';

export interface CatalogItemOptions extends UIElementOptions {
    type: CatalogItemType,
    id: string,
    onDelete: (type: CatalogItemType, id: string) => void,
    onEdit: (type: CatalogItemType, id: string) => void,
    onShowChange: (type: CatalogItemType, id: string, show: boolean) => void,
}

export class CatalogItem extends UIElementBase {
    /**
     *
     */
    constructor(options: CatalogItemOptions) {
        super('div', options);

        this.setStyle({
            display: 'flex',
            justifyContent: 'space-between'
        })
    }
}