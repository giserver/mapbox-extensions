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

    export function create(options: {
        checked?: boolean
    }): HTMLInputElement {
        options.checked ??= false;

        const switchBtn = document.createElement('input');
        switchBtn.classList.add("jas-switch", "jas-switch-anim");
        switchBtn.setAttribute("type", "checkbox");

        if (options.checked) {
            switchBtn.toggleAttribute("checked");
        }

        return switchBtn;
    }
}