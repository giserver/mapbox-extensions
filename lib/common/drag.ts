export function DragBox(drag: HTMLElement, handle?: HTMLElement) {
  let initX = 0;
  let initY = 0;
  let isDrag = false;
  let top = getCss(drag, 'top')
  let left = getCss(drag, 'left')

  handle ??= drag;

  handle.style.cursor = "move";
  handle.addEventListener('mousedown', e => {
    isDrag = true;
    initX = e.clientX;
    initY = e.clientY;
  })

  document.addEventListener('mousemove', e => {
    if (isDrag) {
      const nowY = e.clientY - initY + top;
      const nowX = e.clientX - initX + left;
      drag.style.top = nowY + 'px'
      drag.style.left = nowX + 'px'
    }
  })

  document.addEventListener('mouseup', e => {
    isDrag = false;
    top = getCss(drag, 'top');
    left = getCss(drag, 'left');
  })

  function getCss(ele: HTMLElement, prop: any) {
    return parseInt(ele.style[prop].split('px')[0])
  }
}