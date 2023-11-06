export function download(fileName: string, value: string) {
    const url = window.URL || window.webkitURL || window;
    const blob = new Blob([value]);
    const saveLink = document.createElement('a');
    saveLink.href = url.createObjectURL(blob);
    saveLink.download = fileName;
    saveLink.click();
}