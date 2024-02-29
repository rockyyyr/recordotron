(() => {
    const searchBar = document.getElementById('searchbar');

    const hideTab = 'tab-hidden';
    const hideFrame = 'hidden';

    const iframes = [...document.getElementsByTagName('iframe')];
    const tabs = [...document.getElementsByClassName('tab')];

    tabs.forEach(tab => {
        const iframe = document.querySelector(`iframe[data-id="${tab.id}"]`);
        tab.addEventListener('click', () => {
            iframes.forEach(frame => frame.classList.add(hideFrame));
            iframe.classList.remove(hideFrame);
            tabs.forEach(tab => tab.classList.add(hideTab));
            tab.classList.remove(hideTab);

            searchBar.innerText = tab.getAttribute('data-url');
        });
    });
})();
