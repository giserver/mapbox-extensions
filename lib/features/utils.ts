export class Dict<TKey, TValue> extends Map<TKey, TValue>{ }


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