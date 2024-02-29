const NEXT = '[aria-label="Next"]';
const CLEAN_URL = /https?:\/\/|www\.|[\/|?].*/g;

const CARD_CONTAINER = '.ykYNg';

async function findBusiness(page, frame, domain) {
    let pageNumber = 0;

    while (true) {
        const business = await readCards(frame, pageNumber, domain);

        if (business) {
            return business;
        }

        const next = await hasNext(frame);

        if (next) {
            await Promise.all([
                showMore(frame),
                page.waitForResponse(res => res.url().includes('batchexecute'))
            ]);
            pageNumber++;

        } else {
            console.log(`Not able to locate ${domain}`);
            break;
        }
    }
}

async function hasNext(page) {
    return page.locator(NEXT).isVisible();
}

async function showMore(page) {
    return page.locator(NEXT).click();
}

async function readCards(page, pageNumber, domain) {
    const organic = await readByCardType(page, pageNumber, domain);
    return organic;
}

async function readByCardType(page, pageNumber, domain) {
    const organicCards = await page.locator(`[data-test-id="organic-list-card"]`);
    const paidCards = await page.locator(`[data-test-id="paid-list-card"]`);
    const cards = organicCards.or(paidCards);

    const length = await cards.count();
    let business = false;

    for (let i = 0; i < length; i++) {
        const card = await cards.nth(i);
        const website = await readCard(card);

        if (website && website.includes(domain)) {
            business = {
                position: i + 1,
                page: pageNumber,
                element: card,
                numOfCards: length
            };
            return business;
        }
    }
    return business;
}

async function readCard(card) {
    const website = await getWebsite(card);
    return website;
}

async function getWebsite(card) {
    const hasWebsite = await card.locator('[aria-label="Website"]').isVisible();

    if (!hasWebsite) {
        return false;
    }

    const aTag = await card.locator('[aria-label="Website"]');
    const website = await aTag.getAttribute('href');
    return website;
}

function deDuplicate(arr) {
    const store = new Map();

    arr.forEach(result => {
        const prevValue = store.get(result.url);

        if (!prevValue || !prevValue.sponsored) {
            store.set(result.url, result);
        }
    });

    return [...store.values()];
}

function formatUrl(url) {
    return url?.replace(CLEAN_URL, '').toLowerCase();
}

async function maybeShiftBusiness(frame, business) {
    const { position, numOfCards } = business;
    const min = 3;
    const max = numOfCards - 1;

    if (position >= min && position <= max) {
        return business;
    }
    const newIndex = (position < min ? min : max) - 1;

    await frame.addScriptTag({
        content: `
        (() => {
            function swap(node1, node2) {
                const afterNode2 = node2.nextElementSibling;
                const parent = node2.parentNode;
                node1.replaceWith(node2);
                parent.insertBefore(node1, afterNode2);
            }
    
            const cards = document.getElementsByClassName('ykYNg')[0].querySelectorAll('[jscontroller="xkZ6Lb"]');
            swap(cards[${newIndex}], cards[${position - 1}]);
        })()
    `});

    return {
        ...business,
        position: newIndex + 1
    };
}

async function positionElement(frame, business) {
    await frame.addScriptTag({
        content: `
            (() => {
                const cards = document.getElementsByClassName('ykYNg')[0].querySelectorAll('[jscontroller="xkZ6Lb"]');
                const container = document.getElementsByClassName('aQOEkf')[0];
                const card = cards[${business.position - 1}];
                container.scrollTo(0, card.offsetTop - (175 * 2));
            })();
    `.trim()
    });
}

module.exports = {
    findBusiness,
    maybeShiftBusiness,
    positionElement
};
