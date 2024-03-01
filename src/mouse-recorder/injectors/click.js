(() => {
    if (typeof window.mouseRecorder === 'undefined') {
        window.mouseRecorder = {};
    }

    let clicks;

    window.mouseRecorder.getClicks = () => clicks;
    window.mouseRecorder.recordClicks = () => {
        clicks = [];
        window.addEventListener('click', e => {
            const click = { x: e.clientX, y: e.clientY, time: Date.now() };
            clicks.push(click);
            console.log(click);
        });
    };
})();
