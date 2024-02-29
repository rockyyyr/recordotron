(() => {
    document.body.style.cursor = 'none';
    document.body.style.margin = 0;
    document.body.style.padding = 0;

    document.addEventListener('mousemove', event => {
        window.parent.postMessage({
            clientX: event.clientX,
            clientY: event.clientY + 92.56
        }, '*');
    });
})();
