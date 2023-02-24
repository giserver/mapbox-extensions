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

interface UIElementOptions {
    parent: HTMLElement,
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

        this._parent = parent;
        this.element = document.createElement(tagName);
        this.element.className = className || "";

        if (style)
            this.setStyle(style);

        if (innerText)
            this.element.innerText = innerText;

        parent.append(this.element);
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
        };
    }

    private get style() {
        return this.element.style;
    }
}

export namespace Button {
    type ButtonType = "default" | "primary" | "success" | "info" | "warning" | "danger";

    interface ButtonOptions extends UIElementOptions {
        type: ButtonType
        clickEvent?: (event: MouseEvent) => void
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

        constructor(options: ButtonOptions) {
            options.style = {
                boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.02)',
                borderRadius: '8px',
                padding: '5px 16px',
                cursor: 'pointer',
                ...options.style,
                ...styleConfig.get(options.type)!
            }
            super('button', options);

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
                parent: this.element,
                style: {
                    fontSize: '17px',
                    fontWeight: '550',
                }
            });

            this.content = new UIElementBase('div', {
                parent: this.element,
                style: {
                    width: '100%',
                    height: '100%'
                }
            });

            this.footer = new UIElementBase('div', {
                parent: this.element
            })
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
                parent: container.header.element,
                className: 'jas-modal-container-header-title',
                innerText: options.title
            });
            const header_close = new UIElementBase('div', {
                parent: container.header.element,
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
                parent: container.footer.element,
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
                parent: container.footer.element,
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