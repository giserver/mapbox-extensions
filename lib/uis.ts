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

    export class ButtonBase extends UIElementBase {

        constructor(options: ButtonBaseOptions) {
            options.style = {
                boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.02)',
                borderRadius: '8px',
                padding: '5px 16px',
                cursor: 'pointer',
                height: '32px',
                ...styleConfig.get(options.type)!,
                ...options.style
            }
            super('button', options);

            if (options.clickEvent)
                this.element.addEventListener('click', options.clickEvent);
        }
    }

    export class Close extends UIElementBase {
        constructor(options: ButtonCloseOptions) {
            options.style = {
                cursor: 'pointer',
                ...options.style
            }
            super('div', options);

            const size = options.size || 10;

            this.element.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.70807 5L9.29694 0.72207C9.35709 0.650977 9.30651 0.542969 9.21354 0.542969H8.12252C8.05826 0.542969 7.99674 0.57168 7.95436 0.620898L4.9944 4.14961L2.03444 0.620898C1.99342 0.57168 1.9319 0.542969 1.86627 0.542969H0.775256C0.682287 0.542969 0.631701 0.650977 0.691858 0.72207L4.28072 5L0.691858 9.27793C0.678382 9.29378 0.669737 9.31316 0.666948 9.33377C0.66416 9.35438 0.667345 9.37537 0.676126 9.39422C0.684907 9.41308 0.698915 9.42902 0.716486 9.44016C0.734058 9.45129 0.754455 9.45715 0.775256 9.45703H1.86627C1.93053 9.45703 1.99205 9.42832 2.03444 9.3791L4.9944 5.85039L7.95436 9.3791C7.99537 9.42832 8.0569 9.45703 8.12252 9.45703H9.21354C9.30651 9.45703 9.35709 9.34902 9.29694 9.27793L5.70807 5Z" fill="black" fill-opacity="0.45"/>
            </svg>
            `
            if (options.clickEvent)
                this.element.addEventListener('click', options.clickEvent);
        }
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
    interface IconBaseOptions extends UIElementOptions {
        height?: number,
        width?: number
    }

    abstract class IconBase extends UIElementBase {
        /**
         *
         */
        constructor(options: IconBaseOptions) {
            options.height ??= 10;
            options.width ??= 10;
            super('div', options);

            this.element.innerHTML = this.getIconSvgString(options.height, options.width);
        }

        protected abstract getIconSvgString(height: number, width: number): string;
    }

    export class IconProject extends IconBase {
        protected getIconSvgString(height: number, width: number): string {
            return `<svg t="1677308424063" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2807" data-darkreader-inline-fill="" width="${width}" height="${height}">
            <path d="M505.6 576c-4.266667 0-6.4 0-10.666667-2.133333L96 362.666667c-6.4-2.133333-10.666667-10.666667-10.666667-17.066667s4.266667-14.933333 10.666667-19.2L507.733333 108.8c6.4-4.266667 12.8-4.266667 19.2 0L928 320c6.4 4.266667 10.666667 10.666667 10.666667 19.2s-4.266667 14.933333-10.666667 19.2L516.266667 573.866667c-4.266667 2.133333-8.533333 2.133333-10.666667 2.133333zM151.466667 345.6l352 185.6 366.933333-192-352-187.733333-366.933333 194.133333z" fill="#333333" p-id="2808" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#262a2b;"></path>
            <path d="M505.6 746.666667c-4.266667 0-6.4 0-10.666667-2.133334L96 533.333333c-10.666667-6.4-14.933333-19.2-8.533333-29.866666 6.4-8.533333 19.2-12.8 29.866666-6.4l388.266667 204.8L906.666667 490.666667c10.666667-6.4 23.466667-2.133333 29.866666 8.533333 6.4 10.666667 2.133333 23.466667-8.533333 29.866667L516.266667 744.533333c-4.266667 2.133333-8.533333 2.133333-10.666667 2.133334z" fill="#333333" p-id="2809" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#262a2b;"></path>
            <path d="M505.6 917.333333c-4.266667 0-6.4 0-10.666667-2.133333L96 704c-10.666667-6.4-14.933333-19.2-8.533333-29.866667 6.4-8.533333 19.2-12.8 29.866666-6.4l388.266667 204.8L906.666667 661.333333c10.666667-6.4 23.466667-2.133333 29.866666 8.533334 6.4 10.666667 2.133333 23.466667-8.533333 29.866666L516.266667 915.2c-4.266667 2.133333-8.533333 2.133333-10.666667 2.133333z" fill="#333333" p-id="2810" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#262a2b;"></path></svg>`
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