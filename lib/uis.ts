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

class UIElementBase<K extends keyof HTMLElementTagNameMap> {
    readonly element: HTMLElementTagNameMap[K];

    /**
     *
     */
    constructor(private parent: HTMLElement, tagName: K, className: string, styleAction?: (style: CSSStyleDeclaration) => void, innerText?: string) {
        this.element = document.createElement(tagName);
        this.element.className = className;

        if (styleAction) {
            styleAction(this.element.style);
        }

        if (innerText)
            this.element.innerText = innerText;

        parent.append(this.element);
    }

    remove() {
        this.parent.removeChild(this.element);
    }
}

export namespace Modal {

    export class ModalBase extends UIElementBase<'div'>{

        /**
         *
         */
        constructor(title: string, show: boolean = false) {
            super(document.body, 'div', "jas-modal-mask", style => {
                style.backgroundColor = "rgba(0,0,0,0.6)";
                style.position = 'fixed';
                style.top = '0';
                style.bottom = '0';
                style.right = '0';
                style.left = '0';
                style.zIndex = '10000';
            });

            const container = new UIElementBase(this.element, 'div', "jas-modal-container", style => {
                style.left = '50%';
                style.top = '50%';
                style.transform = 'translate(-50%,-50%)';
                style.padding = '10px';
                style.borderRadius = '10px';
                style.position = 'absolute';
            });

            const header = new UIElementBase(container.element, 'div', "jas-modal-container-header", style => {
                style.display = 'flex';
                style.justifyContent = 'space-between';
            })
            const header_title = new UIElementBase(header.element, 'div', 'jas-modal-container-header-title', style => {
                style.fontSize = '15px';
                style.fontWeight = '550';
            }, title)
            const header_close = new UIElementBase(header.element, 'div', 'jas-modal-container-header-title', style => {
                style.fontSize = '15px';
                style.fontWeight = '550';
            }, "x")

            const content = new UIElementBase(container.element, 'div', "jas-modal-container-content", style => {

            })

            const foot = new UIElementBase(container.element, 'div', "jas-modal-container-foot", style => {

            })
            const cancleBtn = new UIElementBase(foot.element, 'button', "jas-modal-container-foot-cancle", style => {

            }, "取消");
            const canfireBtn = new UIElementBase(foot.element, 'button', "jas-modal-container-foot-canfire", style => {

            }, "确认");
        }
    }
}