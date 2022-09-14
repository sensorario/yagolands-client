const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const buildings = [];

const BASE_CELL_SIZE = 50;
const BORDER_WIDTH = 0.04;
const FONT_SIZE = 12;
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

/**
 * Return the coordinates of the cell at the given x,y coordinates of the canvas
 * @param {number} x x coord
 * @param {number} y y coord
 * @return {number[]}
 */
export const cellAt = (x, y) => {
    const diffX = x - xShift;
    const diffY = y - yShift;
    return [Math.floor(diffX / currentCellSize), Math.floor(diffY / currentCellSize)];
};

/**
 * Multiply the zoom level by the given factor, clamping it at [0.2, 5],
 * centering the effect on the given canvas coordinates
 * @param {number} x x coord
 * @param {number} y y coord
 * @param {number} factor factor to multiply the zoom level with
 */
export const zoomAt = (x, y, factor) => {
    const diffX = xShift - x;
    const diffY = yShift - y;
    zoom = Math.max(Math.min(zoom * factor, 5), 0.2);
    currentCellSize = BASE_CELL_SIZE * zoom;
    xShift = x + diffX * factor;
    yShift = y + diffY * factor;
    render();
};

export const render = () => {
    context.fillStyle = '#eee';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    const [xStart, yStart] = cellAt(0, 0);
    const [xEnd, yEnd] = cellAt(canvasWidth, canvasHeight);
    const innerCellSize = currentCellSize * (1 - 2 * BORDER_WIDTH);
    for (let yIdx = yStart; yIdx <= yEnd; yIdx++) {
        for (let xIdx = xStart; xIdx <= xEnd; xIdx++) {
            const x = xShift + currentCellSize * (xIdx + BORDER_WIDTH);
            const y = yShift + currentCellSize * (yIdx + BORDER_WIDTH);
            context.fillStyle = xIdx || yIdx ? '#fff' : '#fdd';
            context.fillRect(x, y, innerCellSize, innerCellSize);
            context.fillStyle = '#333';
            context.font = `${FONT_SIZE * zoom}px sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(
                `${xIdx},${yIdx}`,
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
canvas.addEventListener('wheel', ({ pageX, pageY, deltaY }) => {
    const { top, left } = canvas.getBoundingClientRect();
    zoomAt(pageX - left, pageY - top, 1.1 ** (deltaY / -150));
});
