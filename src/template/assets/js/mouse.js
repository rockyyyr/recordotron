const mapTab = document.getElementById('map-tab');
const siteTab = document.getElementById('site-tab');
const siteIframe = document.getElementById('site-iframe');
const mapIframe = document.getElementById('map-iframe');
const searchBar = document.getElementById('searchbar');

function isCursorInElement(cursor, element) {
    const c = cursor;
    const b = element.getBoundingClientRect();
    return (c.y + 4) < b.bottom && (c.y - 4) > b.top && c.x > b.left && c.x < b.right;
}

function interpolatePoints(points, numPointsToInsert) {
    let interpolatedPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
        let startPoint = points[i];
        let endPoint = points[i + 1];

        interpolatedPoints.push(startPoint);

        for (let j = 1; j <= numPointsToInsert; j++) {
            let fraction = j / (numPointsToInsert + 1);
            let interpolatedX = startPoint.x + fraction * (endPoint.x - startPoint.x);
            let interpolatedY = startPoint.y + fraction * (endPoint.y - startPoint.y);
            interpolatedPoints.push({ x: interpolatedX, y: interpolatedY });
        }
    }

    interpolatedPoints.push(points[points.length - 1]);
    return interpolatedPoints;
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;
const points = mouseMovements;

const cursor = new Image();
cursor.src = './assets/imgs/cursor.svg';
cursor.onload = function () {
    const start = points[0];
    drawCursor(start.x, start.y);
};

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
}

(async () => {

    let index = 0;
    const step = 2;

    function draw() {
        if (index < points.length - 1) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const { x, y } = points[index];
            drawCursor((x - 150) * dpr, (y - 80) * dpr);

            index += step;
            requestAnimationFrame(draw);

            if (isCursorInElement({ x: (x - 150), y: y - 80 }, mapTab)) {
                mapTab.classList.add('tab-hover');
                setTimeout(() => {
                    siteTab.classList.add('tab-hidden');
                    siteIframe.classList.add('hidden');
                    mapTab.classList.remove('tab-hidden');
                    mapIframe.classList.remove('hidden');
                    searchBar.innerText = 'medspa florida';
                }, 300);
            } else {
                if (mapTab.classList.contains('tab-hover')) {
                    mapTab.classList.remove('tab-hover');
                }
            }
        }
    }

    setTimeout(() => requestAnimationFrame(draw), 3000);

    function drawCursor(x, y) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(cursor, x, y);
    }
})();