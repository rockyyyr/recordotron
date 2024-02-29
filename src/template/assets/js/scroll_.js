(() => {
    const negate = num => -num;
    const seconds = num => num * 1000;
    const scroll = amount => window.scrollBy({ top: amount, left: 0, behavior: 'smooth' });
    const checkForBottom = () => (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 2;
    const checkForTop = () => window.scrollY === 0;
    const getRandomScroll = (min = 200, max = 600) => () => Math.floor(Math.random() * (max - min + 1)) + min;

    // const timer = document.createElement('h1');
    // let counter = 0;
    // timer.style.color = 'red';
    // timer.style.position = 'fixed';
    // timer.style.top = '400px';
    // timer.style.left = '400px';
    // timer.style.zIndex = '10000000';
    // timer.innerText = counter;

    // document.body.append(timer);

    // setInterval(() => {
    //     timer.innerText = ++counter;
    // }, 1000);

    function doScroll(amount, pause, hitBottom) {
        return () => {
            if (!hitBottom) {
                hitBottom = checkForBottom();
                if (hitBottom) {
                    pause = true;
                }
            }

            if (!pause) {
                const to = hitBottom
                    ? negate(amount * 3)
                    : amount;

                scroll(to);
            } else {
                pause = false;
            }
        };
    }

    const timeout1 = setTimeout(scene1, seconds(0.5));

    // const timeout2 = setTimeout(scene2, seconds(22));

    //20 seconds
    function scene1() {
        const profile = Array(100).fill(0).map(getRandomScroll());

        let total = 0;
        let pause = false;
        let hitBottom = false;
        let hitTop = false;

        const timeouts = [];

        setTimeout(() => timeouts.forEach(timeout => clearTimeout(timeout)), 9000);

        profile.forEach(amount => {
            total += (amount * 2);
            timeouts.push(setTimeout(() => {
                if (!hitBottom) {
                    hitBottom = checkForBottom();
                    if (hitBottom) {
                        pause = true;
                    }
                }

                if (!pause) {
                    const to = hitBottom
                        ? negate(amount * 3)
                        : amount;

                    scroll(to);
                } else {
                    pause = false;
                }

                if (hitBottom && checkForTop()) {
                    timeouts.forEach(timeout => clearTimeout(timeout));
                }

            }, total));
        });
    }

    function scene2() {
        clearTimeout(timeout1);
        const profile = Array(50).fill(0).map(getRandomScroll(400, 800));

        let total = 0;
        let pause = false;
        let hitBottom = false;

        profile.forEach(amount => {
            total += (amount * 2);
            setTimeout(doScroll(amount, pause, hitBottom), total);
        });
    }
})();
