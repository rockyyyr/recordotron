(() => {
    let currentScrollPosition = window.scrollY || document.documentElement.scrollTop;

    function getHeight() {
        const body = document.body;
        const html = document.documentElement;
        return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight) - document.documentElement.clientHeight;
    }

    const height = getHeight();

    const downIntervals = [0.18, 0.41, 0.65, 0.82, 1];
    const downDurations = [1, 1.3, 1.1, 0.9, 1];
    const scrollDown = Array(downIntervals.length).fill(0).map((_, i) => downIntervals[i] * height);

    const upIntervals = [0.75, 0.50, 0.25, 0];
    const upDurations = [1, 0.95, 1.1, 1];
    const scrollUp = Array(upIntervals.length).fill(0).map((_, i) => upIntervals[i] * height);

    // const downDuration = downDurations.reduce((acc, cur) => acc + cur, 0);
    // const upDuration = upDurations.reduce((acc, cur) => acc + cur, 0);
    const midpointDelay = 1.5;


    // const totalDuration = downDuration + upDuration + midpointDelay;

    playbackScrolls(scrollDown, scrollUp);

    function playbackScrolls(down, up) {
        let total = 0;

        down.forEach((position, index) => {
            const duration = downDurations[index];
            total += duration;

            setTimeout(() => {
                smoothScrollTo(position, duration);
            }, total * 1000);
        });

        total += midpointDelay;

        up.forEach((position, index) => {
            const duration = upDurations[index];
            total += duration;

            setTimeout(() => {
                smoothScrollTo(position, duration);
            }, total * 1000);
        });
    }

    function smoothScrollTo(targetPosition, duration_) {
        const startTime = performance.now();
        const startScrollPosition = currentScrollPosition;
        const distance = targetPosition - startScrollPosition;
        const duration = duration_ * 1000;

        const scrollFrame = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            const easeProgress = easeInOutCubic(progress);
            currentScrollPosition = startScrollPosition + distance * easeProgress;

            window.scrollTo(0, currentScrollPosition);

            if (progress >= 1) {
                return true;
            }

            // if (progress < 1) {
            //     requestAnimationFrame(scrollFrame);
            // }
        };

        // requestAnimationFrame(scrollFrame);

        const interval = setInterval(() => {
            // const timestamp = window.timingCorrection.getTimestamp();
            const finished = scrollFrame(performance.now());

            if (finished) {
                clearInterval(interval);
            }
        }, 1 / 60);
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
})();