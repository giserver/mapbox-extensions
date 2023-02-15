export const SwitchStyle = `
.switch {
    width: 57px;
    height: 28px;
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

.switch:before {
    content: '';
    width: 26px;
    height: 26px;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 20px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.switch:checked {
    border-color: #64bd63;
    box-shadow: #64bd63 0 0 0 16px inset;
    background-color: #64bd63;
}

.switch:checked:before {
    left: 30px;
}

.switch.switch-anim {
    transition: border cubic-bezier(0, 0, 0, 1) 0.4s, box-shadow cubic-bezier(0, 0, 0, 1) 0.4s;
}

.switch.switch-anim:before {
    transition: left 0.3s;
}

.switch.switch-anim:checked {
    box-shadow: #64bd63 0 0 0 16px inset;
    background-color: #64bd63;
    transition: border ease 0.4s, box-shadow ease 0.4s, background-color ease 1.2s;
}

.switch.switch-anim:checked:before {
    transition: left 0.3s;
}
`;

export default function createSwitchButton(): HTMLInputElement {
    const switchBtn = document.createElement('input');
    switchBtn.classList.add("switch", "switch-anim");

    return switchBtn;
}