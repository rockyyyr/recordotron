(() => {
    if (typeof window.mouseRecorder === 'undefined') {
        window.mouseRecorder = {};
    }
    window.mouseRecorder.recordClicks = () => {
        window.mouseRecorder.clicks = [];
        window.addEventListener('click', e => window.mouseRecorder.clicks.push({ x: e.clientX, y: e.clientY, time: Date.now() }));
    };
})();
