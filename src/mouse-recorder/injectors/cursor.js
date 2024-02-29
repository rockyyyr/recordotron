(() => {
    document.body.style.cursor = 'none';

    const cursorElement = document.createElement('img');
    cursorElement.src = "./assets/imgs/cursor.svg";
    cursorElement.id = 'fake-cursor';

    document.getElementById('main-container').append(cursorElement);
    const moveCursor = e => cursorElement.style.transform = `translate3d(${e.clientX + 3}px, ${e.clientY}px, 0)`;

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('message', e => moveCursor(e.data));
})();
