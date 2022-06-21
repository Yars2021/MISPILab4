// Graph parameters
let PARAMETER_R = 3;

// Graph limits
const LIMITS = {
    'x': {
        'min': -5,
        'max': 5
    },
    'y': {
        'min': -4,
        'max': 4
    },
    'r': {
        'min': 1,
        'max': 3
    }
};

// Graph colors
const colors = {
    'background': 'White',
    'axis': 'Black',
    'mark': 'Brown',
    'dot': {
        'hit': 'Lime',
        'miss': 'Red'
    },
    'figure': '#1E90FFAF',
    'crosshair': {
        'lines': 'MediumSeaGreen',
        'sight': 'DarkGreen'
    }
};

// Current mouse coordinates
const mouse = {
    x: undefined,
    y: undefined
}

let dots = [];
let drawing = false;

// Canvas definition
const WIDTH = 480;
const HEIGHT = 480;
const DPI_WIDTH = WIDTH * 2;
const DPI_HEIGHT = HEIGHT * 2;

const BIGGER_AXIS = WIDTH > HEIGHT ? WIDTH : HEIGHT;

const canvas = document.getElementById('graph-layer');
const ctx = canvas.getContext('2d');

canvas.style.width = WIDTH + 'px';
canvas.style.height = HEIGHT + 'px';
canvas.width = DPI_WIDTH;
canvas.height = DPI_HEIGHT;

const canvasCrosshair = document.getElementById('crosshair-layer');
const ctxCrosshair = canvas.getContext('2d');

canvasCrosshair.style.width = WIDTH + 'px';
canvasCrosshair.style.height = HEIGHT + 'px';
canvasCrosshair.style.backgroundColor = 'transparent';
canvasCrosshair.width = DPI_WIDTH;
canvasCrosshair.height = DPI_HEIGHT;


const metrics = getMetrics(LIMITS);

// Get max value for the scale calculation
function getMaxMetric(data) {
    let max = 0;
    const keys = Object.keys(data);
    keys.forEach(key => {
        let limits = Object.keys(data[key]);
        limits.forEach(limit => {
            if (Math.abs(data[key][limit]) > max) {
                max = Math.abs(data[key][limit]);
            }
        })
    });
    return max + 1;
}

function graphToCanvasCoordinates(gX, gY, step) {
    let x = WIDTH + gX * step;
    let y = HEIGHT - gY * step;
    return [x, y];
}

function canvasToGraphCoordinates(cX, cY, step) {
    let x = (cX - WIDTH) / step;
    let y = (HEIGHT - cY) / step;
    return [x.toFixed(1), y.toFixed(1)];
}

function getMetrics(definition) {
    let maxMetric = getMaxMetric(definition);
    let STEP = BIGGER_AXIS / maxMetric;
    return {
        "maxMetric": maxMetric,
        "step": STEP
    }
}

// Pass 'true' to force dark theme, 'false' otherwise
function setTheme(forceDark) {
    if (forceDark) {
        colors.background = '#333';
        colors.axis = 'Lime';
        colors.mark = 'White';
        colors.dot.hit = 'White';
        colors.dot.miss = 'Brown';
        colors.figure = 'rgba(30,255,67,0.69)';
        colors.crosshair.lines = 'Yellow';
        colors.crosshair.sight = 'Orange';
    } else {
        colors.background = 'White';
        colors.axis = 'Black';
        colors.mark = 'Brown';
        colors.dot.hit = 'Lime';
        colors.dot.miss = 'Red';
        colors.figure = '#1E90FFAF';
        colors.crosshair.lines = 'MediumSeaGreen';
        colors.crosshair.sight = 'DarkGreen';
    }
}

function drawLayout(metrics) {
    let strokeStyle = ctx.strokeStyle;
    let fillStyle = ctx.fillStyle;
    let lineWidth = ctx.lineWidth;

    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, DPI_WIDTH, DPI_HEIGHT);
    ctx.beginPath();

    ctx.strokeStyle = colors.axis;
    ctx.fillStyle = colors.mark;
    ctx.lineWidth = 2;
    // Axis
    ctx.moveTo(0, HEIGHT);
    ctx.lineTo(DPI_WIDTH, HEIGHT);
    ctx.moveTo(WIDTH, 0);
    ctx.lineTo(WIDTH, DPI_HEIGHT);
    // X axis arrow
    ctx.moveTo(DPI_WIDTH - 16, HEIGHT - 8);
    ctx.lineTo(DPI_WIDTH, HEIGHT);
    ctx.lineTo(DPI_WIDTH - 16, HEIGHT + 8);
    // Y axis arrow
    ctx.moveTo(WIDTH - 8, 16);
    ctx.lineTo(WIDTH, 0);
    ctx.lineTo(WIDTH + 8, 16);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 1;
    // X axis marks
    ctx.font = 'normal 16px sans-serif';
    for (let i = 1; i < metrics.maxMetric; i++) {
        ctx.moveTo(WIDTH - metrics.step * i, HEIGHT - 8);
        ctx.lineTo(WIDTH - metrics.step * i, HEIGHT + 8);
        ctx.fillText('-' + i, WIDTH - metrics.step * i - 16, HEIGHT + 16);
        ctx.moveTo(WIDTH + metrics.step * i, HEIGHT - 8);
        ctx.lineTo(WIDTH + metrics.step * i, HEIGHT + 8);
        ctx.fillText('' + i, WIDTH + metrics.step * i + 4, HEIGHT + 16);
    }
    // Y axis marks
    for (let i = 1; i < metrics.maxMetric; i++) {
        ctx.moveTo(WIDTH - 8, HEIGHT - metrics.step * i);
        ctx.lineTo(WIDTH + 8, HEIGHT - metrics.step * i);
        ctx.fillText('' + i, WIDTH + 4, HEIGHT - metrics.step * i - 4);
        ctx.moveTo(WIDTH - 8, HEIGHT + metrics.step * i);
        ctx.lineTo(WIDTH + 8, HEIGHT + metrics.step * i);
        ctx.fillText('-' + i, WIDTH + 4, HEIGHT + metrics.step * i + 16);
    }

    // Display graph
    ctx.stroke();
    ctx.closePath();

    // Axis labels
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('0', WIDTH - 32, HEIGHT + 32);
    ctx.fillText('X', DPI_WIDTH - 20, HEIGHT + 32);
    ctx.fillText('Y', WIDTH - 32, 24);
    ctx.fillStyle = colors.figure;
    ctx.fillText('-R', WIDTH - PARAMETER_R * metrics.step - 24, HEIGHT + 40);
    ctx.fillText('R/2', WIDTH + PARAMETER_R * metrics.step / 2, HEIGHT + 40);
    ctx.fillText('-R/2', WIDTH - 55, HEIGHT + PARAMETER_R * metrics.step / 2 + 16);
    ctx.fillText('R', WIDTH - 26, HEIGHT - PARAMETER_R * metrics.step - 4);

    ctx.lineWidth = lineWidth;
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
}

// Draw dot on the graph
function drawDot(x, y, metrics, push, hit = false) {
    let fillStyle = ctx.fillStyle;
    ctx.beginPath();
    let [cX, cY] = graphToCanvasCoordinates(x, y, metrics.step);
    ctx.fillStyle = Boolean(hit) ? ctx.fillStyle = colors.dot.hit : ctx.fillStyle = colors.dot.miss;
    ctx.arc(cX, cY, 4, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    if (push) {
        addDot(x, y, hit);
    }
}

// Adds dot to the dots array
function addDot(x, y, hit) {
    dots.push({'x': x, 'y': y, 'hit': hit});
}

// Reads proper mouse position inside Canvas
function getMousePos(evt, metrics) {
    const rect = canvas.getBoundingClientRect();
    return canvasToGraphCoordinates(evt.clientX * 2 - rect.left * 2, evt.clientY * 2 - rect.top * 2, metrics.step);
}

function updateCoordinates(x, y) {
    let [gX, gY] = canvasToGraphCoordinates(x, y, metrics.step);
    document.getElementById('coordinateX').innerText = gX;
    document.getElementById('coordinateY').innerText = gY;
}

// Block the page if enabled
function drawDots() {
    if (!drawing) {
        drawing = true;
        dots.map((dot) => {
            drawDot(dot.x, dot.y, metrics, false, dot.hit)
        })
        drawing = false;
    }
}

function drawFigure(r) {
    let fillStyle = ctx.fillStyle;
    ctx.fillStyle = colors.figure;
    ctx.beginPath();
    [startX, startY] = graphToCanvasCoordinates(0, 0, metrics.step);
    moveTo(startX, startY);
    [toX, toY] = graphToCanvasCoordinates(r / 2, 0, metrics.step);
    ctx.lineTo(toX, toY);
    [toX, toY] = graphToCanvasCoordinates(r / 2, -r, metrics.step);
    ctx.lineTo(toX, toY);
    [toX, toY] = graphToCanvasCoordinates(0, -r, metrics.step);
    ctx.lineTo(toX, toY);
    ctx.lineTo(startX, startY);
    [startX, startY] = graphToCanvasCoordinates(0, 0, metrics.step);
    ctx.moveTo(startX, startY);
    [toX, toY] = graphToCanvasCoordinates(0, -r / 2, metrics.step);
    ctx.lineTo(toX, toY);
    [toX, toY] = graphToCanvasCoordinates(-r, 0, metrics.step);
    ctx.lineTo(toX, toY);
    ctx.lineTo(startX, startY);
    ctx.arc(startX, startY, metrics.step * r, Math.PI, Math.PI * 1.5, false);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = fillStyle;
}

function drawCrosshair() {

    let strokeStyle = ctxCrosshair.strokeStyle;
    let fillStyle = ctxCrosshair.fillStyle;

    ctxCrosshair.strokeStyle = colors.crosshair.lines;
    ctxCrosshair.fillStyle = colors.crosshair.lines;

    ctxCrosshair.beginPath();
    ctxCrosshair.moveTo(0, mouse.y + 0.5);
    ctxCrosshair.lineTo(ctxCrosshair.canvas.width, mouse.y + 0.5);
    ctxCrosshair.moveTo(mouse.x + 0.5, 0);
    ctxCrosshair.lineTo(mouse.x + 0.5, ctxCrosshair.canvas.height);
    ctxCrosshair.stroke();
    ctxCrosshair.closePath();
    ctxCrosshair.strokeStyle = colors.crosshair.sight;
    ctxCrosshair.fillStyle = colors.crosshair.sight;
    ctxCrosshair.beginPath();
    ctxCrosshair.arc(mouse.x, mouse.y, 16, 0, 2 * Math.PI);
    ctxCrosshair.stroke();
    ctxCrosshair.closePath();
    ctxCrosshair.beginPath();
    ctxCrosshair.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
    ctxCrosshair.stroke();
    ctxCrosshair.closePath();
    ctxCrosshair.beginPath();
    ctxCrosshair.arc(mouse.x, mouse.y, 4, 0, 2 * Math.PI);
    ctxCrosshair.fill();
    ctxCrosshair.closePath();
    ctxCrosshair.fillStyle = fillStyle;
    ctxCrosshair.strokeStyle = strokeStyle;
}


// Add 'onMouseDown' listener to the canvas
canvasCrosshair.onmousedown = function (e) {
    let [x, y] = getMousePos(e, metrics);
    checkPoint(x, y);
    //drawDot(x, y, metrics, true, _hit);
}

// Add 'onMouseDown' listener to the canvas
canvasCrosshair.onmousemove = function (e) {
    let rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX * 2 - rect.left * 2;
    mouse.y = e.clientY * 2 - rect.top * 2;
    updateCoordinates(mouse.x, mouse.y, metrics);
}

// Draws the scene
function drawScene(r, metrics) {
    drawLayout(metrics);
    drawFigure(r);
    drawDots();
    drawCrosshair();
}

// Starts animation cycle to show the scene and crosshair
function animate() {
    ctxCrosshair.clearRect(0, 0, canvas.width, canvas.height);
    drawScene(PARAMETER_R, metrics);
    requestAnimationFrame(animate);
}

animate();