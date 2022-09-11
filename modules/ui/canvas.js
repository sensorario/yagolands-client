const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const buildings = [];

const BASE_CELL_SIZE = 50;
const BORDER_WIDTH = 0.04;
const FONT_SIZE = 16;
let zoom = 1;
let currentCellSize = BASE_CELL_SIZE * zoom;

let canvasWidth = canvas.clientWidth;
let canvasHeight = canvas.clientHeight;
let xShift = canvasWidth / 2 - currentCellSize / 2;
let yShift = canvasHeight / 2 - currentCellSize / 2;

const resizeObserver = new ResizeObserver(([entry]) => {
    ({ width: canvasWidth, height: canvasHeight } = entry.contentRect);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    render();
});
resizeObserver.observe(canvas);

export const render = () => {
    context.fillStyle = '#eee';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    const xStart = Math.floor(xShift / -currentCellSize);
    const yStart = Math.floor(yShift / -currentCellSize);
    const xEnd = Math.floor((canvasWidth - xShift) / currentCellSize);
    const yEnd = Math.floor((canvasHeight - yShift) / currentCellSize);
    const innerCellSize = currentCellSize * (1 - 2 * BORDER_WIDTH);
    for (let yIdx = yStart; yIdx <= yEnd; yIdx++) {
        for (let xIdx = xStart; xIdx <= xEnd; xIdx++) {
            const x = xShift + currentCellSize * (xIdx + BORDER_WIDTH);
            const y = yShift + currentCellSize * (yIdx + BORDER_WIDTH);
            context.fillStyle = xIdx || yIdx ? '#fff' : '#fdd';
            context.fillRect(x, y, innerCellSize, innerCellSize);
            context.fillStyle = '#333';
            context.font = `normal ${FONT_SIZE * zoom}px`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(
                `${xIdx}, ${yIdx}`,
                x + currentCellSize * BORDER_WIDTH + innerCellSize / 2,
                y + currentCellSize * BORDER_WIDTH + innerCellSize / 2
            );
        }
    }
};

let panStart = null;
canvas.addEventListener('pointerdown', ({ pageX, pageY }) => {
    panStart = { x: pageX, y: pageY };
    canvas.classList.add('panning');
});
const endPan = () => {
    panStart = null;
    canvas.classList.remove('panning');
};
canvas.addEventListener('pointerleave', endPan);
canvas.addEventListener('pointerup', endPan);
canvas.addEventListener('pointermove', ({ pageX, pageY }) => {
    if (!panStart) return;
    const diffX = pageX - panStart.x;
    const diffY = pageY - panStart.y;
    if (diffX || diffY) {
        xShift += diffX;
        yShift += diffY;
        render();
        panStart = { x: pageX, y: pageY };
    }
});
