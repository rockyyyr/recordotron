const canvas = document.getElementById('plot');
const context = canvas.getContext("2d");
const slider = document.getElementById('slider');
// const numSlider = document.getElementById('numSlider');

const BLUE = 'rgb(102, 217, 239)';

const Colors = {
    BLUE: 'rgb(102, 217, 239)',
    GREEN: '#90c920',
    GREY: '#686868',
    WHITE: '#f8f8f2',
    RED: '#f92672',
    BLACK: '#070707'
};

let showFullPath = true;

const toggleFullPath = () => {
    showFullPath = !showFullPath;
    draw();
};

const fps = 30;
const timeStepSize = 1000 / fps;

const padding = 30;
const fontSize = 10;
const topGridHeight = 35;

const events = recording.events;
const interpolated = temporalInterpolate(events, fps);

console.log({ eventLength: events.length });
console.log({ interLength: interpolated.length });

// const matchingEvents = [];

// for (let i = 0; i < events.length; i++) {
//     const { x, y } = events[i];
//     const inter = interpolated[i];

//     if (x === inter.x && y === inter.y) {
//         matchingEvents.push(inter);
//     }
// }

// console.log({ matchLength: matchingEvents.length });


const viewSize = 59;
let viewStart = 0;
let viewEnd = viewSize;
let viewStep = 1;
let focusedEvent = 0;
slider.max = events.length - viewSize;

canvas.width = window.innerWidth - padding;
canvas.height = window.innerHeight;
context.font = fontSize + 'px Arial';
context.fillStyle = Colors.WHITE;

const lineY = canvas.height - (padding * 3);
const lineLength = viewSize * timeStepSize;
const tickHeight = 20;

function right() {
    if (viewEnd + viewStep < events.length - 1) {
        viewStart++;
        viewEnd++;
        focusedEvent++;
        slider.value = viewStart;
    }
    draw();
}

let playing = false;
let playInterval;

function play() {
    if (!playing) {
        playInterval = setInterval(() => {
            if (viewEnd + viewStep < events.length - 1) {
                viewStart++;
                viewEnd++;
                focusedEvent++;
                draw();
            }
        }, timeStepSize);
        playing = true;

    } else {
        clearInterval(playInterval);
        playing = false;
        draw();
    }
}

function left() {
    if (viewStart - viewStep >= 0) {
        viewStart--;
        viewEnd--;
        focusedEvent--;
        slider.value = viewStart;
    }
    draw();
}

function reset() {
    viewStart = 0;
    viewEnd = viewSize;
    draw();
}

slider.addEventListener('input', event => {
    if (slider.value >= 0 && slider.value < events.length - viewSize - 1) {
        viewStart = parseInt(slider.value);
        focusedEvent = parseInt(slider.value);
        viewEnd = viewStart + viewSize;
        draw();
    }
});

function drawTicks() {
    context.font = fontSize + 'px Arial';
    let tickX = padding;
    context.fillStyle = Colors.WHITE;
    context.strokeStyle = Colors.WHITE;

    for (let i = viewStart; i < viewEnd; i++) {
        context.fillText(i, tickX - (fontSize / 3), lineY + padding);

        const index = i - viewStart;
        const event = events[i];
        const nextEvent = events[i + 1];

        tickX += timeStepSize;
        const gap = nextEvent.time - event.time;

        const pointX = (gap * index) + padding;
        const pointY = lineY - tickHeight - 1;

        context.beginPath();
        context.fillRect(pointX - 2.5, pointY, 5, 5);
        context.closePath();
    }

    context.fillText(viewEnd + 1, tickX, lineY + padding);
}

function drawInterpolatedTicks(events) {
    context.fillStyle = Colors.BLUE;
    for (let i = viewStart; i < (viewEnd * 2); i++) {

        const index = i - viewStart;
        const event = events[i];
        const nextEvent = events[i + 1];

        const gap = nextEvent.time - event.time;

        const pointX = (gap * index) + padding;
        const pointY = timeStepSize * (topGridHeight - 1) - 2.5;

        context.beginPath();
        context.fillRect(pointX - 2.5, pointY, 5, 5);
        context.closePath();

        // if (index === focusedEvent) {
        //     context.fillText(index, pointX - (fontSize / 2), pointY - fontSize);
        // }
    }
}


function drawGrid() {
    let lineX = padding;
    context.fillStyle = Colors.WHITE;
    context.strokeStyle = Colors.GREY;

    context.beginPath();
    context.moveTo(lineX, lineY - tickHeight);
    context.lineTo(lineX, tickHeight);
    context.stroke();

    for (let i = viewStart; i < viewEnd; i++) {
        lineX += timeStepSize;

        context.beginPath();
        context.moveTo(lineX, lineY - tickHeight);
        context.lineTo(lineX, tickHeight);
        context.stroke();
    }

    for (let i = 1; i < topGridHeight; i++) {
        const y = timeStepSize * i;
        context.beginPath();
        context.moveTo(padding, y);
        context.lineTo(lineLength + padding, y);
        context.stroke();
    }
}

function drawRect(x, y, color, opacity = 1) {
    context.fillStyle = color;
    context.globalAlpha = opacity;
    context.beginPath();
    context.fillRect(x, y, 5, 5);
    context.closePath();
    context.globalAlpha = 1;
}

function drawPath(events, color, offset = 0) {
    for (let i = 0; i < events.length; i++) {
        const { x, y } = events[i];

        if (showFullPath) {
            drawRect(x + offset, y, color, 0.5);

        } else if (i >= viewStart && i <= viewEnd) {
            const opacity = 1 / (i / 30);
            drawRect(x + offset, y, color, opacity);
        }
    }
}

function drawEvents() {
    if (showFullPath) {
        const event = events[focusedEvent];
        context.beginPath();
        context.arc(event.x, event.y, 5, 0, 2 * Math.PI, false);
        context.fillStyle = Colors.BLUE;
        context.fill();

        const offset = 15;
        const inter = interpolated[focusedEvent];
        context.beginPath();
        context.arc(inter.x + offset, inter.y, 5, 0, 2 * Math.PI, false);
        context.fillStyle = Colors.RED;
        context.fill();

        // if (inter.x != event.x || inter.y != event.y) {
        drawDialog([
            `Event: { x: ${event.x}, y: ${event.y} }`,
            `Inter: { x: ${inter.x}, y: ${inter.y} }`
        ], inter.x, inter.y);
        // }
    }
}

function drawDialog(content, x, y) {
    context.fillStyle = Colors.BLACK;
    context.strokeStyle = Colors.GREY;
    context.lineWidth = 1;
    context.beginPath();
    context.roundRect(x + 100, y, 330, 75, 10); // x, y, width, height, radius
    context.fill();
    context.stroke();
    context.closePath();

    context.font = fontSize * 2 + 'px monospace';

    content.forEach((line, i) => {
        context.fillStyle = i === 0 ? Colors.BLUE : Colors.RED;
        context.fillText(line, x + 120, y + (30 * (i + 1)));
    });
}


function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawPath(events, Colors.BLUE);
    drawPath(interpolated, Colors.RED, 15);


    drawGrid();
    drawTicks();
    drawInterpolatedTicks(interpolated);
    drawEvents();
}

draw();