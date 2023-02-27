export namespace SwitchButton {
    export function createStyle(checkedColor: string = '#1677FF') {
        const width = '44px';
        const height = '22px';
        const circle = '21px';

        return `
        .jas-switch {
            width: ${width};
            height: ${height};
            position: relative;
            border: 1px solid #dfdfdf;
            background-color: #fdfdfd;
            box-shadow: #dfdfdf 0 0 0 0 inset;
            border-radius: 20px;
            background-clip: content-box;
            display: inline-block;
            -webkit-appearance: none;
            user-select: none;
            outline: none;
            cursor: pointer;
        }
        
        .jas-switch:before {
            content: '';
            width: ${circle};
            height: ${circle};
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 20px;
            background-color: #fff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        
        .jas-switch:checked {
            border-color: ${checkedColor};
            box-shadow: ${checkedColor} 0 0 0 16px inset;
            background-color: ${checkedColor};
        }
        
        .jas-switch:checked:before {
            left: 22px;
        }
        
        .jas-switch.jas-switch-anim {
            transition: border cubic-bezier(0, 0, 0, 1) 0.4s, box-shadow cubic-bezier(0, 0, 0, 1) 0.4s;
        }
        
        .jas-switch.jas-switch-anim:before {
            transition: left 0.3s;
        }
        
        .jas-switch.jas-switch-anim:checked {
            box-shadow: ${checkedColor} 0 0 0 16px inset;
            background-color: ${checkedColor};
            transition: border ease 0.4s, box-shadow ease 0.4s, background-color ease 1.2s;
        }
        
        .jas-switch.jas-switch-anim:checked:before {
            transition: left 0.3s;
        }
        `
    }

    export function create(name: string, checked?: boolean, cb?: (input: HTMLInputElement) => void): HTMLDivElement {
        const switchButton = document.createElement('div');
        switchButton.style.display = 'flex';
        switchButton.style.justifyContent = 'space-between';
        switchButton.style.alignItems = 'center';


        const inputEle = document.createElement('input');
        inputEle.classList.add("jas-switch", "jas-switch-anim");
        inputEle.setAttribute("type", "checkbox");
        if (checked) {
            inputEle.toggleAttribute("checked");
        }

        const txtEle = document.createElement('div');
        txtEle.innerText = name;

        switchButton.append(txtEle, inputEle);
        cb?.call(undefined, inputEle);

        return switchButton;
    }
}

export namespace ImgTxtSwitchButton {

    export function createStyle(
        size: number = 50,
        checkedTextColor: string = '#1677FF',
        checkedBorder: string = "2px solid #1677FF",
        hoverBorder: string = "2px solid black") {

        return `
        .jas-img-txt-switch-button{
            cursor: pointer;
        }
        
        .jas-img-txt-switch-button-img{
            height: ${size}px;
            width: ${size}px;
            margin: auto;
            box-shadow: 0 0 0 2px rgb(0 0 0 / 10%);
            box-sizing: border-box;
            border-radius: 4px;
            background-color: white;
            background-size: ${size - 4}px;
            background-repeat: no-repeat;
            background-position-x: center;
            background-position-y: center;
        }

        .jas-img-txt-switch-button-img:hover{
            border: ${hoverBorder};
            box-sizing: border-box;
        }

        .jas-img-txt-switch-button.checked .jas-img-txt-switch-button-img{
            border: ${checkedBorder};
        }

        .jas-img-txt-switch-button-txt{
            text-align: center;
            font-size: 12px;
            line-height: 16px;
            margin-top: 4px;
        }

        .jas-img-txt-switch-button.checked .jas-img-txt-switch-button-txt{
            color: ${checkedTextColor};
        }
        `;
    }

    export function create(name: string, backgroundImage: string = "", checked?: boolean): HTMLDivElement {
        const imgTxtButton = document.createElement('div');
        imgTxtButton.classList.add("jas-img-txt-switch-button");

        const imgDiv = document.createElement('div');
        imgDiv.style.backgroundImage = `url('${backgroundImage}')`;
        imgDiv.classList.add("jas-img-txt-switch-button-img");

        const txtDiv = document.createElement('div');
        txtDiv.innerText = name;
        txtDiv.classList.add("jas-img-txt-switch-button-txt");

        const class_name = "checked";

        if (checked) {
            imgDiv.classList.add(class_name);
            txtDiv.classList.add(class_name);
        }

        imgTxtButton.append(imgDiv, txtDiv);

        imgTxtButton.addEventListener('click', e => {
            if (imgTxtButton.classList.contains(class_name))
                imgTxtButton.classList.remove(class_name);
            else
                imgTxtButton.classList.add(class_name);
        })

        return imgTxtButton;
    }
}

export type NullAbleCSSStyleDeclaration = Partial<CSSStyleDeclaration>;

export interface UIElementOptions {
    parent: UIElementBase | HTMLElement,
    style?: NullAbleCSSStyleDeclaration,
    className?: string,
    innerText?: string,
}

export class UIElementBase {
    private _show: boolean = true;
    private _display: string | undefined = undefined;
    private _parent: HTMLElement;

    readonly element: HTMLElement;


    /**
     *
     */
    constructor(tagName: keyof HTMLElementTagNameMap, options: UIElementOptions) {
        const { parent, style, className, innerText } = options;

        this._parent = parent instanceof UIElementBase ? parent.element : parent;
        this.element = document.createElement(tagName);
        this.element.className = className || "";

        if (style)
            this.setStyle(style);

        if (innerText)
            this.element.innerText = innerText;

        this._parent.append(this.element);
    }

    remove() {
        this._parent.removeChild(this.element);
    }

    get show() {
        return this._show;
    }

    set show(value: boolean) {
        if (value) {
            if (this._display !== undefined)
                this.style.display = this._display;
        } else {
            this._display = this.element.style.display;
            this.style.display = 'none';
        }

        this._show = value;
    }

    setStyle(style: NullAbleCSSStyleDeclaration) {
        for (let prop in style) {
            if (style[prop]) {
                (this.element.style as any)[prop] = style[prop];
            }
        }
    }

    private get style() {
        return this.element.style;
    }
}

export namespace Button {
    type ButtonType = "default" | "primary" | "success" | "info" | "warning" | "danger";

    interface ButtonOptions extends UIElementOptions {
        clickEvent?: (event: MouseEvent) => void
    }

    interface ButtonBaseOptions extends ButtonOptions {
        type: ButtonType
    }

    interface ButtonCloseOptions extends ButtonOptions {
        size?: number
    }

    interface ButtonIconOptions extends ButtonOptions, Icon.IconBaseOptions {
        iconSize?: number;
    }

    const styleConfig = new Map<ButtonType, NullAbleCSSStyleDeclaration>(
        [
            ['default', {
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.15)'
            }],
            ['primary', {
                backgroundColor: '#1677FF',
                border: '1px solid #1677FF'
            }],
            ['success', {
                backgroundColor: '#c3e88d',
                border: '1px solid #c3e88d'
            }],
            ['info', {
                backgroundColor: '#888888',
                border: '1px solid #888888'
            }],
            ["warning", {
                backgroundColor: '#c2b36e',
                border: '1px solid #c2b36e'
            }],
            ['danger', {
                backgroundColor: '#8c0909',
                border: '1px solid #8c0909'
            }]
        ]
    )

    class Button extends UIElementBase {
        /**
         *
         */
        constructor(tagName: keyof HTMLElementTagNameMap, options: ButtonOptions) {
            options.style = {
                cursor: 'pointer',
                ...options.style
            }
            super(tagName, options);

            if (options.clickEvent)
                this.element.addEventListener('click', options.clickEvent);
        }
    }

    export class ButtonBase extends Button {

        constructor(options: ButtonBaseOptions) {
            options.style = {
                boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.02)',
                borderRadius: '8px',
                padding: '5px 16px',
                height: '32px',
                ...styleConfig.get(options.type)!,
                ...options.style
            }

            super('button', options);
        }
    }

    export class Icon<T extends Icon.IconBase> extends Button {
        /**
         *
         */
        constructor(t: new (options: Icon.IconBaseOptions) => T, options: ButtonIconOptions) {
            options.style = {
                width: 'fit-content',
                ...options.style
            }
            super('div', options);
            new t({ parent: this.element, height: options.iconSize, width: options.iconSize });
        }
    }

    export function createIcon<T extends Icon.IconBase>(t: new (options: Icon.IconBaseOptions) => T, options: ButtonIconOptions) {
        const svg = new t(options);

        svg.setStyle({
            cursor: 'pointer',
        });

        if (options.clickEvent)
            svg.element.addEventListener('click', options.clickEvent);

        return svg;
    }
}

export namespace Card {
    export interface CardOptions extends UIElementOptions {

    }

    export class CardBase extends UIElementBase {
        /**
         *
         */
        constructor(options: CardOptions) {
            options.style = {
                padding: '16px 24px',
                borderRadius: '10px',
                background: '#fff',
                boxShadow: " 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)",
                ...options.style
            }
            super('div', options);
        }

    }

    export class HCFCard extends CardBase {
        readonly header: UIElementBase;
        readonly content: UIElementBase;
        readonly footer: UIElementBase;

        /**
         *
         */
        constructor(options: CardOptions) {
            super(options);

            this.setStyle({
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto'
            });

            this.element.addEventListener('click', e => {
                e.stopPropagation();
            })

            this.header = new UIElementBase('div', {
                parent: this,
                style: {
                    fontSize: '17px',
                    fontWeight: '550',
                }
            });

            this.content = new UIElementBase('div', {
                parent: this,
                style: {
                    width: '100%',
                    height: '100%'
                }
            });

            this.footer = new UIElementBase('div', {
                parent: this
            })
        }
    }
}

export namespace Icon {
    export interface IconBaseOptions extends UIElementOptions {
        height?: number,
        width?: number
    }

    export abstract class IconBase extends UIElementBase {
        /**
         *
         */
        constructor(options: IconBaseOptions) {
            options.height ??= 10;
            options.width ??= 10;
            options.style = {
                width: 'fit-content',
                ...options.style
            }
            super('div', options);

            this.element.innerHTML = this.getIconSvgString(options.height, options.width);
        }

        protected abstract getIconSvgString(height: number, width: number): string;
    }

    export class IconClose extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg width="${width}" height="${height}" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.70807 5L9.29694 0.72207C9.35709 0.650977 9.30651 0.542969 9.21354 0.542969H8.12252C8.05826 0.542969 7.99674 0.57168 7.95436 0.620898L4.9944 4.14961L2.03444 0.620898C1.99342 0.57168 1.9319 0.542969 1.86627 0.542969H0.775256C0.682287 0.542969 0.631701 0.650977 0.691858 0.72207L4.28072 5L0.691858 9.27793C0.678382 9.29378 0.669737 9.31316 0.666948 9.33377C0.66416 9.35438 0.667345 9.37537 0.676126 9.39422C0.684907 9.41308 0.698915 9.42902 0.716486 9.44016C0.734058 9.45129 0.754455 9.45715 0.775256 9.45703H1.86627C1.93053 9.45703 1.99205 9.42832 2.03444 9.3791L4.9944 5.85039L7.95436 9.3791C7.99537 9.42832 8.0569 9.45703 8.12252 9.45703H9.21354C9.30651 9.45703 9.35709 9.34902 9.29694 9.27793L5.70807 5Z" fill="black" fill-opacity="0.45"/>
            </svg>
            `
        }
    }

    export class IconProject extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg t="1677308424063" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2807" data-darkreader-inline-fill="" width="${width}" height="${height}">
            <path d="M505.6 576c-4.266667 0-6.4 0-10.666667-2.133333L96 362.666667c-6.4-2.133333-10.666667-10.666667-10.666667-17.066667s4.266667-14.933333 10.666667-19.2L507.733333 108.8c6.4-4.266667 12.8-4.266667 19.2 0L928 320c6.4 4.266667 10.666667 10.666667 10.666667 19.2s-4.266667 14.933333-10.666667 19.2L516.266667 573.866667c-4.266667 2.133333-8.533333 2.133333-10.666667 2.133333zM151.466667 345.6l352 185.6 366.933333-192-352-187.733333-366.933333 194.133333z" fill="#333333" p-id="2808" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#262a2b;"></path>
            <path d="M505.6 746.666667c-4.266667 0-6.4 0-10.666667-2.133334L96 533.333333c-10.666667-6.4-14.933333-19.2-8.533333-29.866666 6.4-8.533333 19.2-12.8 29.866666-6.4l388.266667 204.8L906.666667 490.666667c10.666667-6.4 23.466667-2.133333 29.866666 8.533333 6.4 10.666667 2.133333 23.466667-8.533333 29.866667L516.266667 744.533333c-4.266667 2.133333-8.533333 2.133333-10.666667 2.133334z" fill="#333333" p-id="2809" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#262a2b;"></path>
            <path d="M505.6 917.333333c-4.266667 0-6.4 0-10.666667-2.133333L96 704c-10.666667-6.4-14.933333-19.2-8.533333-29.866667 6.4-8.533333 19.2-12.8 29.866666-6.4l388.266667 204.8L906.666667 661.333333c10.666667-6.4 23.466667-2.133333 29.866666 8.533334 6.4 10.666667 2.133333 23.466667-8.533333 29.866666L516.266667 915.2c-4.266667 2.133333-8.533333 2.133333-10.666667 2.133333z" fill="#333333" p-id="2810" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#262a2b;"></path></svg>`
        }
    }

    export class IconPoint extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg t="1659591725628" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1369" width="${width}" height="${height}">
            <g fill="none" stroke="black">
            <path stroke-width="60" d="M512 427.023m-90 0a90 90 0 1 0 180 0 90 90 0 1 0-180 0Z" fill="" p-id="1370"></path>
            <path stroke-width="60" d="M512 910.402c-19.14 0-37.482-5.854-53.042-16.929-14.063-10.01-24.926-23.596-31.589-39.46L255.043 585.177l-0.154-0.25C225.522 537.209 210 482.605 210 427.021c0-80.667 31.414-156.506 88.454-213.546S431.333 125.021 512 125.021s156.506 31.414 213.546 88.454C782.587 270.515 814 346.354 814 427.021c0 55.849-15.655 110.671-45.274 158.539l-0.264 0.419-172.081 268.716c-6.755 15.726-17.66 29.176-31.704 39.055-15.485 10.895-33.7 16.652-52.677 16.652zM309.246 551.141l175.494 273.78 1.194 3.197c4.149 11.107 14.381 18.284 26.066 18.284 11.584 0 21.791-7.071 26.004-18.015l1.165-3.028L714.43 551.678C737.701 513.983 750 470.884 750 427.021c0-63.572-24.756-123.339-69.709-168.292-44.952-44.951-104.719-69.708-168.291-69.708s-123.339 24.756-168.292 69.708S274 363.449 274 427.021c0 43.64 12.186 86.552 35.246 124.12z" p-id="1371"></path>
            </g></svg>`
        }
    }

    export class IconLine extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg t="1659590346220" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="745" width="${width}" height="${height}">
            <g fill="none" stroke="black">
            <path stroke-width="20" d="M413.583 452.419L363.1 503.368l27.576 27.576a35.548 35.548 0 0 0 50.484 0 35.548 35.548 0 0 0 0-50.483l-27.577-28.042z m-91.146 91.15l-50.483 50.484 27.576 27.576a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.483l-27.576-27.576z m-91.146 91.147L180.808 685.2l27.576 27.577a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.484l-27.576-27.576zM687.022 178.98l-50.483 50.483 27.576 27.576a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.483l-27.576-27.576zM504.73 361.272l-50.484 50.95 27.577 27.576a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.483l-27.576-28.043z" fill="#333333" p-id="746"></path>
            <path stroke-width="20" d="M959.995 279.946L747.786 67.738a35.548 35.548 0 0 0-50.483 0L64.425 700.62a35.548 35.548 0 0 0 0 50.483l211.743 211.743a35.548 35.548 0 0 0 50.483 0l633.344-632.423c13.553-14.023 13.553-36.46 0-50.478zM301.87 887.122l-161.26-161.26 35.523-35.522 146.77-146.77 40.663-40.663 50.483-50.483 40.663-40.663 50.484-50.484 40.663-40.663 50.483-50.483 40.663-40.663 50.483-50.483 35.523-35.523 160.793 161.726L301.87 887.122z" fill="#333333" p-id="747"></path>
            <path stroke-width="20" d="M595.876 270.126l-50.483 50.483 27.576 27.577a35.548 35.548 0 0 0 50.483 0 35.548 35.548 0 0 0 0-50.484l-27.576-27.576z" fill="#333333" p-id="748"></path>
            </g></svg>`
        }
    }

    export class IconPolygon extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg t="1659591707587" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1188" width="${width}" height="${height}">
            <g fill="none" stroke="black">
                <path stroke-width="18" d="M898.56 284.672c15.36 0 27.648-12.288 27.648-27.136V126.976c0-15.36-12.288-27.648-27.648-27.648H768c-15.36 0-27.648 12.288-27.648 27.648v29.696H286.208v-29.696c0-15.36-12.288-27.648-27.648-27.648H128c-15.36 0-27.648 12.288-27.648 27.648v130.048c0 15.36 12.288 27.648 27.648 27.648h31.744v452.096H128c-15.36 0-27.648 12.288-27.648 27.648v130.56c0 15.36 12.288 27.648 27.648 27.648h130.56c14.848 0 27.136-12.288 27.648-27.648v-33.28h454.144v33.28c0 15.36 12.288 27.648 27.648 27.648h130.56c15.36 0 27.648-12.288 27.648-27.648v-130.56c0-15.36-12.288-27.648-27.648-27.648H865.28V284.672h33.28zM155.648 229.376V154.112h75.264v75.264H155.648z m75.264 637.952H155.648v-75.264h75.264v75.264z m509.44-102.912v33.28H286.208v-33.28c0-15.36-12.288-27.648-27.648-27.648h-34.816V284.672h34.816c14.848 0 27.136-12.288 27.648-27.136v-36.864h454.144v36.352c0 15.36 12.288 27.648 27.648 27.648h33.28v452.096H768c-15.36 0-27.648 12.288-27.648 27.648z m130.56 27.648v75.264h-75.264v-75.264h75.264zM795.648 229.376V154.112h75.264v75.264h-75.264z" fill="#333333" p-id="1189"></path>
                <path stroke-width="18" d="M680.96 383.488c17.92-8.192 47.616-21.504 56.832-50.176 4.608-14.336 2.56-30.72-5.632-44.544-8.192-13.824-20.992-23.552-35.84-26.624-27.648-6.144-54.784 8.704-68.096 35.84-4.608 9.728-1.024 20.992 8.704 25.6 9.728 4.608 20.992 1.024 25.6-8.704 5.632-11.776 15.36-17.408 25.6-15.36 5.632 1.536 9.216 6.144 10.752 8.704 3.072 4.608 3.584 10.24 2.56 13.824-3.584 11.264-20.48 19.968-35.84 26.624-32.256 14.336-35.328 57.344-35.328 61.952-0.512 5.12 1.536 10.24 5.12 13.824 3.584 4.096 8.704 6.144 13.824 6.144h70.656c10.24 0 18.944-9.216 18.944-19.456s-8.192-18.944-18.944-18.944h-46.592c2.048-3.584 4.608-7.168 7.68-8.704zM516.096 377.344H355.328c-13.824 0-24.576 11.264-24.576 24.576v242.688c0 13.824 11.264 24.576 24.576 24.576 13.824 0 24.576-11.264 24.576-24.576V426.496h70.144v217.6c0 13.824 11.264 24.576 24.576 24.576 13.824 0 24.576-10.752 24.576-24.576V426.496h16.896c16.896 0 29.184 3.584 36.352 10.752 10.24 10.24 10.24 29.184 10.24 40.448v166.4c0 13.824 11.264 24.576 24.576 24.576 13.312 0 24.576-10.752 24.576-25.088V477.696c0-16.384 0-50.176-24.576-75.264-16.896-16.384-40.448-25.088-71.168-25.088z" fill="#333333" p-id="1190"></path>
            </g></svg>`
        }

    }

    export class IconEdit extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg width="${width}" height="${height}" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0366 0.528862C9.91156 0.403743 9.74189 0.333462 9.56499 0.333496C9.38808 0.33353 9.21844 0.403875 9.09343 0.529041L2.19506 7.43567C2.07021 7.56068 2.00008 7.73012 2.00008 7.9068V10.3335C2.00008 10.7017 2.29856 11.0002 2.66675 11.0002H5.10581C5.28268 11.0002 5.45229 10.9299 5.57732 10.8048L12.4716 3.9075C12.7318 3.64717 12.7318 3.22522 12.4716 2.96489L10.0366 0.528862ZM3.33341 8.1827L9.56529 1.94336L11.0575 3.4362L4.82959 9.66683H3.33341V8.1827Z" fill="black" fill-opacity="0.88"/>
            <path d="M1.33341 12.3335C0.965225 12.3335 0.666748 12.632 0.666748 13.0002C0.666748 13.3684 0.965225 13.6668 1.33341 13.6668H13.3334C13.7016 13.6668 14.0001 13.3684 14.0001 13.0002C14.0001 12.632 13.7016 12.3335 13.3334 12.3335H1.33341Z" fill="black" fill-opacity="0.88"/>
            </svg>
            `
        }

    }

    export class IconDelete extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg width="${width}" height="${height}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.66675 5.99984C7.03494 5.99984 7.33341 6.29831 7.33341 6.6665V10.9998C7.33341 11.368 7.03494 11.6665 6.66675 11.6665C6.29856 11.6665 6.00008 11.368 6.00008 10.9998V6.6665C6.00008 6.29831 6.29856 5.99984 6.66675 5.99984Z" fill="black" fill-opacity="0.88"/>
            <path d="M10.0001 6.6665C10.0001 6.29831 9.7016 5.99984 9.33341 5.99984C8.96522 5.99984 8.66675 6.29831 8.66675 6.6665V10.9998C8.66675 11.368 8.96522 11.6665 9.33341 11.6665C9.7016 11.6665 10.0001 11.368 10.0001 10.9998V6.6665Z" fill="black" fill-opacity="0.88"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.42975 0.666504C6.18628 0.666504 5.96218 0.799222 5.84515 1.01271L4.9386 2.6665H1.33341C0.965225 2.6665 0.666748 2.96498 0.666748 3.33317C0.666748 3.70136 0.965225 3.99984 1.33341 3.99984H2.33341V14.6665C2.33341 15.0347 2.63189 15.3332 3.00008 15.3332H13.0001C13.3683 15.3332 13.6667 15.0347 13.6667 14.6665V3.99984H14.6667C15.0349 3.99984 15.3334 3.70136 15.3334 3.33317C15.3334 2.96498 15.0349 2.6665 14.6667 2.6665H11.0654L10.1797 1.0177C10.0636 0.801429 9.83795 0.666504 9.59245 0.666504H6.42975ZM9.55189 2.6665L9.19379 1.99984H6.82456L6.45912 2.6665H9.55189ZM3.66675 3.99984V13.9998H12.3334V3.99984H3.66675Z" fill="black" fill-opacity="0.88"/>
            </svg>
            `
        }
    }

    export class IconEye extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg width="${width}" height="${height}" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00008 2.66683C6.71142 2.66683 5.66675 3.71151 5.66675 5.00016C5.66675 6.28882 6.71142 7.3335 8.00008 7.3335C9.28874 7.3335 10.3334 6.28882 10.3334 5.00016C10.3334 3.71151 9.28874 2.66683 8.00008 2.66683ZM7.00008 5.00016C7.00008 4.44789 7.4478 4.00016 8.00008 4.00016C8.55236 4.00016 9.00008 4.44789 9.00008 5.00016C9.00008 5.55244 8.55236 6.00016 8.00008 6.00016C7.4478 6.00016 7.00008 5.55244 7.00008 5.00016Z" fill="black" fill-opacity="0.88"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00008 0.333496C5.92704 0.333496 4.10995 1.45131 2.86059 2.4869C2.22646 3.01253 1.71493 3.53663 1.36169 3.92929C1.18468 4.12606 1.0464 4.29095 0.951306 4.40807C0.903738 4.46665 0.866906 4.51337 0.841369 4.54624C0.828598 4.56268 0.818645 4.57567 0.81158 4.58495L0.803154 4.59607L0.80058 4.5995L0.799705 4.60067C0.799567 4.60085 0.799106 4.60147 1.33341 5.00016L0.799106 4.60147C0.622629 4.83797 0.622629 5.16235 0.799106 5.39886L1.33341 5.00016C0.799106 5.39886 0.798968 5.39867 0.799106 5.39886L0.799705 5.39966L0.80058 5.40083L0.803154 5.40425L0.81158 5.41538C0.818645 5.42466 0.828598 5.43764 0.841369 5.45408C0.866906 5.48695 0.903738 5.53367 0.951306 5.59226C1.0464 5.70937 1.18468 5.87427 1.36169 6.07103C1.71493 6.4637 2.22646 6.9878 2.86059 7.51343C4.10995 8.54901 5.92704 9.66683 8.00008 9.66683C10.0731 9.66683 11.8902 8.54901 13.1396 7.51343C13.7737 6.9878 14.2852 6.4637 14.6385 6.07103C14.8155 5.87427 14.9538 5.70937 15.0489 5.59226C15.0964 5.53367 15.1333 5.48695 15.1588 5.45408C15.1716 5.43764 15.1815 5.42466 15.1886 5.41538L15.197 5.40425L15.1996 5.40083L15.2005 5.39966C15.2006 5.39948 15.2011 5.39886 14.6667 5.00016L15.2011 5.39886C15.3775 5.16235 15.3775 4.83797 15.2011 4.60147L14.6667 5.00016C15.2011 4.60147 15.2012 4.60165 15.2011 4.60147L15.1996 4.5995L15.197 4.59607L15.1886 4.58495C15.1815 4.57567 15.1716 4.56268 15.1588 4.54624C15.1333 4.51337 15.0964 4.46665 15.0489 4.40807C14.9538 4.29095 14.8155 4.12606 14.6385 3.92929C14.2852 3.53663 13.7737 3.01253 13.1396 2.4869C11.8902 1.45131 10.0731 0.333496 8.00008 0.333496ZM2.35294 5.17929C2.29547 5.11541 2.24272 5.05547 2.19488 5.00016C2.24272 4.94486 2.29547 4.88491 2.35294 4.82103C2.6744 4.4637 3.13918 3.9878 3.71148 3.51343C4.87498 2.54901 6.39122 1.66683 8.00008 1.66683C9.60894 1.66683 11.1252 2.54901 12.2887 3.51343C12.861 3.9878 13.3258 4.4637 13.6472 4.82103C13.7047 4.88491 13.7574 4.94486 13.8053 5.00016C13.7574 5.05547 13.7047 5.11541 13.6472 5.17929C13.3258 5.53663 12.861 6.01253 12.2887 6.4869C11.1252 7.45131 9.60894 8.3335 8.00008 8.3335C6.39122 8.3335 4.87498 7.45131 3.71148 6.4869C3.13918 6.01253 2.6744 5.53663 2.35294 5.17929Z" fill="black" fill-opacity="0.88"/>
            </svg>
            `
        }

    }

    export class IconUnEye extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8C3.31736 8.60965 3.79823 9.1752 4.41138 9.6777C6.1305 11.0867 8.8895 12 12 12C15.1105 12 17.8695 11.0867 19.5886 9.6777C20.2018 9.1752 20.6826 8.60965 21 8" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14.4888 12L15.524 15.8637" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.6768 10.6768L21.5052 13.5052" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2.5 13.5052L5.32843 10.6768" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8.46393 15.8638L9.49918 12" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            `
        }
    }
}

export namespace Modal {

    interface ModalBaseOptions {
        title: string,
        cancleText?: string,
        canfireText?: string,

        closeOnMaskClick?: boolean,

        cancleCallback?: () => void,
        canfireCallback?: () => void
    }

    export class ModalBase extends UIElementBase {

        protected content: UIElementBase;

        /**
         *
         */
        constructor(options: ModalBaseOptions) {

            options.cancleText ??= "取消";
            options.canfireText ??= "确认";

            super('div', {
                parent: document.body, className: "jas-modal-mask", style: {
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    position: 'fixed',
                    top: '0',
                    bottom: '0',
                    right: '0',
                    left: '0',
                    zIndex: '10000'
                }
            });

            if (options.closeOnMaskClick)
                this.element.addEventListener('click', () => {
                    options.cancleCallback?.call(undefined);
                    this.remove();
                })

            const container = new Card.HCFCard({
                parent: this.element, className: 'jas-modal-container', style: {
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    minWidth: '400px',
                    minHeight: '200px'
                }
            });

            container.header.setStyle({
                display: 'flex',
                justifyContent: 'space-between',
            })

            const header_title = new UIElementBase('div', {
                parent: container.header,
                className: 'jas-modal-container-header-title',
                innerText: options.title
            });
            const header_close = new UIElementBase('div', {
                parent: container.header,
                style: {
                    cursor: 'pointer'
                },
                innerText: "X"
            });

            this.content = container.content;

            header_close.element.addEventListener('click', () => {
                options.cancleCallback?.call(undefined);
                this.remove();
            });

            container.footer.setStyle({ textAlign: 'right' });

            const cancleBtn = new Button.ButtonBase({
                parent: container.footer,
                className: 'jas-modal-container-foot-cancle',
                type: 'default',
                innerText: options.cancleText,
                clickEvent: e => {
                    options.cancleCallback?.call(undefined);
                    this.remove();
                },
                style: {
                    marginRight: '8px'
                }
            });

            const canfireBtn = new Button.ButtonBase({
                parent: container.footer,
                className: 'jas-modal-container-foot-canfire',
                type: 'primary',
                innerText: options.canfireText,
                clickEvent: e => {
                    options.canfireCallback?.call(undefined);
                    this.remove();
                },
                style: {
                    color: 'white'
                }
            });
        }
    }
}