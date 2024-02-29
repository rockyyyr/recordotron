(() => {
    if (typeof window.mouseRecorder === 'undefined') {
        window.mouseRecorder = {};
    }
    let scrolls;

    window.mouseRecorder.getScrolls = () => scrolls;
    window.mouseRecorder.recordScrolls = (mapElement) => {
        scrolls = [];
        const element = mapElement || window;

        let prevDelta = 0;
        let scrollIndex = 0;
        let start = true;

        const isNewScroll = (delta, prevDelta) => Math.abs(delta) > prevDelta;
        const captureEvent = () => ({ y: mapElement ? element.scrollTop : element.scrollY, time: Date.now() });

        function onWheel(e) {
            if (isNewScroll(e.wheelDeltaY, prevDelta) && (scrolls[scrolls.length - 1]?.end || start)) {
                start = false;
                scrolls.push({ start: captureEvent() });
            }
            prevDelta = e.wheelDeltaY;
        }

        function onScrollEnd() {
            scrolls[scrollIndex].end = captureEvent();
            scrollIndex++;
        }

        element.addEventListener('wheel', onWheel, { passive: true });
        element.addEventListener('scrollend', onScrollEnd);
    };
})();


