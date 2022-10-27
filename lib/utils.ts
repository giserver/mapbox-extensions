export class Dict<TKey, TValue> extends Map<TKey, TValue>{ }


/**
 * 创建uuid
 * @returns uuid
 */
export function createUUID(): string {
    let d: number = new Date().getTime();
    if (typeof window?.performance?.now === 'function') {
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

/**
 * 设置object类型的默认值
 * @param obj 
 * @param prop 
 * @param value 
 */
export function setDefaultValue<T, K extends keyof T>(obj: T, prop: K, value: T[K]) {
    if (!obj[prop]) {
        obj[prop] = value;
    }
}

/**
 * 复制到剪切板
 * @param textToCopy 
 * @returns 
 */
export function copyToClipboard(textToCopy: string) {
    // navigator clipboard 需要https等安全上下文
    if (navigator.clipboard && window.isSecureContext) {
        // navigator clipboard 向剪贴板写文本
        return navigator.clipboard.writeText(textToCopy);
    } else {
        // 创建text area
        let textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        // 使text area不在viewport，同时设置不可见
        textArea.style.position = "absolute";
        textArea.style.opacity = "0";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise<void>((res, rej) => {
            // 执行复制命令并移除文本框
            document.execCommand('copy') ? res() : rej();
            textArea.remove();
        });
    }
}

export function changeSvgColor(svg: SVGElement, color: string) {
    for (let i = 0; i < svg.children.length; i++) {
        const path = svg.children[i];
        const attr = path.attributes.getNamedItem("fill");
        if (attr)
            attr.value = color;
    }
}