(() => {

    const negate = num => -num;
    const seconds = num => num * 1000;
    const scroll = function (element, scrollPosition, duration) {
        const style = element.style;
        style.webkitTransition = style.transition = duration + 's';
        style.webkitTransitionTimingFunction = style.TransitionTimingFunction = 'ease-in-out';
        style.webkitTransform = style.Transform = 'translate3d(0, ' + -scrollPosition + 'px, 0)';
    };

    const scrollBody = scroll.bind(null, document.getElementsByTagName('body')[0]);
    const checkForBottom = () => (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 2;
    const checkForTop = () => window.scrollY === 0;

    function getHeight() {
        const body = document.body;
        const html = document.documentElement;
        return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight) - document.documentElement.clientHeight;
    }

    const height = getHeight();

    const downIntervals = [0.18, 0.41, 0.65, 0.72, 1];
    const downDurations = [0.6, 0.8, 0.7, 0.6, 0.7];
    const scrollDown = Array(5).fill(0).map((_, i) => downIntervals[i] * height);

    const upIntervals = [0.66, 0.33, 0];
    const upDurations = [0.5, 0.63, 0.4];
    const scrollUp = Array(5).fill(0).map((_, i) => upIntervals[i] * height);

    setTimeout(scene, seconds(0.5));

    const timeouts = [];

    function scene() {
        let total = 0;
        for (const [i, amount] of scrollDown.entries()) {
            const duration = downDurations[i];
            total += duration;
            timeouts.push(setTimeout(() => scrollBody(amount, duration), total * 1000));
        }

        total += 1.5;

        for (const [i, amount] of scrollUp.entries()) {
            const duration = upDurations[i];
            total += duration;
            timeouts.push(setTimeout(() => scrollBody(amount, duration), total * 1000));
        }
    }
})();
