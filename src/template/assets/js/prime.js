async function primePage(duration) {
    let currentScrollPosition = window.scrollY || document.documentElement.scrollTop;

    function getHeight() {
        const body = document.body;
        const html = document.documentElement;
        return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight) - document.documentElement.clientHeight;
    }

    const height = getHeight();

    // Playback function
    async function playbackScrolls() {
        await smoothScrollTo(height);
        await wait(1000);
        await smoothScrollTo(0);
        return;
    }

    async function wait(millis) {
        return new Promise(resolve => setTimeout(resolve, millis));
    }

    // Smooth scroll function
    function smoothScrollTo(targetPosition) {
        return new Promise(resolve => {
            const startTime = performance.now();
            const startScrollPosition = currentScrollPosition;
            const distance = targetPosition - startScrollPosition;

            // Animation frame callback
            const scrollFrame = (currentTime) => {
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / 2500, 1); // Adjust duration as needed

                // Apply an easing function here for smoothness and momentum
                const easeProgress = easeInOutCubic(progress);
                currentScrollPosition = startScrollPosition + distance * easeProgress;

                window.scrollTo(0, currentScrollPosition, { behavior: 'smooth' });

                if (progress < 1) {
                    requestAnimationFrame(scrollFrame);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(scrollFrame);
        });
    }

    // Example easing function for smoothness and momentum
    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }


    return playbackScrolls();
}