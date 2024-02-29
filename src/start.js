const { PROJECT_DIR } = process.env;

const Path = require('path');
const { chromium } = require('playwright-chromium');
const fs = require('fs');
const Mouse = require('./mouse-recorder');
const MapBot = require('./bot/google-map');

const args = [
    '--enable-gpu',
    '--use-angle',
    "--no-sandbox",
    "--disable-setuid-sandbox",
    '--force-gpu-rasterization',
    '--window-position=-5,-5',
    '--battery-saver-mode-available',
    '--use-fake-ui-for-media-stream'
];

const ignoreDefaultArgs = [
    // '--enable-automation',
    '--hide-scrollbars'
];

const GOOGLE_MAP_CLASS = 'aQOEkf';
const mapElement = `document.getElementsByClassName('${GOOGLE_MAP_CLASS}')[0]`;
const IgnorableHeaders = ['x-frame-options', 'content-security-policy', 'x-content-type-options'];
const template = Path.join(PROJECT_DIR, 'src', 'template', 'browser.html');
const jsPaths = Path.join(PROJECT_DIR, 'src', 'template', 'assets', 'js');
const Injectable = {
    scroll: Path.join(jsPaths, 'scroll.js'),
    probe: Path.join(jsPaths, 'probe.js'),
    prime: Path.join(jsPaths, 'prime.js'),
    style: Path.join(PROJECT_DIR, 'src', 'template', 'assets', 'css', 'inject.css')
};

const fps = 30;
const viewport = {
    width: 1920,
    height: 1080
};

const testDomain = {
    domain: 'capitoldentistry.ca',
    keyword: 'dentist',
    location: 'toronto'
};

(async () => {
    try {
        const { domain, keyword, location } = testDomain;

        const browser = await chromium.launch({ headless: false, args, ignoreDefaultArgs });
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();

        await page.goto('file://' + template, { waitUntil: 'domcontentloaded' });
        await removeIframeHeader(context);

        const mouse = new Mouse({ fps, page, dataPath: Path.join(PROJECT_DIR, 'recordings') });

        exitListeners(browser, page, mouse);

        const mapIframe = await setupMapIframe(page, domain, keyword, location);
        await mouse.addTarget(mapIframe, 'map-iframe', mapElement);
        await page.locator('#site-tab').click();

        console.log('map loaded');

        const siteIframe = await setupSiteIframe(page, domain);
        await mouse.addTarget(siteIframe, 'site-iframe');

        const videoPage = await context.newPage();
        videoPage.on('dialog', dialog => dialog.accept());
        await videoPage.goto('file://' + Path.join(PROJECT_DIR, 'src', 'video-recorder', 'index.html'));

        await mouse.initialize();
        await mouse.ready();


    } catch (error) {
        console.error(error);
    }
})();

function exitListeners(browser, page, mouse) {
    browser.on('disconnected', async () => {
        if (browser) {
            await browser.close();
        }
        await mouse.disconnect();
        process.exit(0);
    });

    for (const event of ['close', 'crash']) {
        page.on(event, async () => {
            if (browser) {
                await browser.close();
            }
            await mouse.disconnect();
            process.exit(0);
        });
    }
}

async function removeIframeHeader(page) {
    await page.route('**/*', async route => {
        try {
            if (route.request().url().startsWith('file://')) {
                await route.continue();
                return;
            }

            const response = await route.fetch();
            const headers = await response.headersArray();
            const newHeaders = headers.filter(header => !IgnorableHeaders.includes(header.name.toLowerCase()));
            const body = await response.body();

            await route.fulfill({
                status: response.status(),
                headers: convertArrayToObject(newHeaders),
                body: body,
            });

        } catch (error) { }
    });
}


async function setupSiteIframe(page, domain) {
    const frame = await page.frame('site-iframe');
    await frame.goto(`https://${domain}`, { waitUntil: 'load' });
    const title = await frame.title();
    const favicon = await getFavicon(frame);

    if (favicon) {
        await page.addScriptTag({
            content: `
            document.getElementById('injectable-tab-image').innerHTML = '<img class="tab-image tab-image-injected" src="${favicon}" />'
        `});
    }

    await page.addScriptTag({
        content: `
            document.getElementById('site-tab-title').innerText = '${title}';;
            document.getElementById('site-tab').setAttribute('data-url', '${domain}');
            document.getElementById('searchbar').innerText = '${domain}';
        `
    });

    return frame;
}

async function setupMapIframe(page, domain, keyword, location, skipMapSearch) {
    const url = businessSearch(keyword, location);
    const frame = await page.frame('map-iframe');
    await frame.goto(url, { waitUntil: 'load' });

    const locator = page.frameLocator('#map-iframe').locator('body');
    const acceptAllIsVisible = await locator.getByRole('button', { name: 'Accept all' }).isVisible();

    if (acceptAllIsVisible) {
        await Promise.all([
            locator.getByRole('button', { name: 'Accept all' }).click(),
            frame.waitForNavigation()
        ]);
    }

    const title = await frame.title();
    await page.addScriptTag({
        content: `
        document.getElementById('map-tab-title').innerText = '${title}';
        document.getElementById('map-tab').setAttribute('data-url', '${title}');
        `
    });
    await frame.addStyleTag({ path: Injectable.style });

    let business;

    if (!skipMapSearch) {
        business = await MapBot.findBusiness(page, locator, domain);

        if (!business) {
            throw new Error('Unable to find business in google search');
        }

        business = await MapBot.maybeShiftBusiness(frame, business);
        await MapBot.positionElement(frame, business);
    }
    return frame;
}

function convertArrayToObject(array) {
    return array.reduce((acc, cur) => {
        acc[cur.name] = cur.value;
        return acc;
    }, {});
}

const businessSearch = (keywordRaw, locationRaw) => {
    const keyword = encodeURI(keywordRaw);
    const location = encodeURI(locationRaw);
    return 'https://www.google.com/localservices/prolist?' + [
        // 'g2lbs=ANTchaMxcKmGB72-GMXbz2K_ED5m5VKaiPyI95N0C72baO1M9nKum6D4SmI52JgV-x_ZUz_OlWMdC-fiHROxg3DeL1K5QqCoe_TExPc827yiRg7pyveM74g%3D',
        'hl=en-CA',
        'gl=ca',
        'ssta=1',
        `q=${keyword}+${location}`,
        `oq=${keyword}+${location}`,
        'scp=ChBnY2lkOm1lZGljYWxfc3BhEk4SEgm_KlaRZXbBiBHQTsdb0xMu9xoSCQs2MuSEtepUEUK33kOSuTscIgxGbG9yaWRhLCBVU0EqFA3IlIoOFeD5w8sdUF96EiWs41TQMAAaBm1lZHNwYSIObWVkc3BhIGZsb3JpZGEqC01lZGljYWwgc3Bh',
        // 'slp=MgA6HENoTUk4SWFCMHVpN2d3TVZVZlhJQ2gyNmdBTm1SAggCYACSAbICCg0vZy8xMWxmX25jdmdnCgsvZy8xdnA2X19xNwoNL2cvMTFnMDc5ZmdyeAoNL2cvMTFjMHJ2cDE5cAoLL2cvMXRkNGt4c2sKDS9nLzExYnl0d3Rra3gKDS9nLzExcXB0ajMxcmoKCy9nLzF0Y3ZxMWg4Cg0vZy8xMXJ0OGg0eXoxCg0vZy8xMXJna3pydjdtCg0vZy8xMWZnbTFfejc0Cg0vZy8xMWgxM2gzd21mCg0vZy8xMWdtNXNsdjF5Cg0vZy8xMWxsbnp0ZzJfCg0vZy8xMWozeGxtZGN5Cg0vZy8xMXNiOW4wcnczCg0vZy8xMWM2c2Q3a3NrCg0vZy8xMWg0ZjZweWs0Cg0vZy8xMWZtcms1bWh2Cg0vZy8xMWRmMm1yXzJ0EgQSAggBEgQKAggBmgEGCgIXGRAA',
        'src=2',
        'serdesk=1',
        'sa=X',
        'ved=2ahUKEwini_rR6LuDAxWolIkEHceDDZIQjGp6BAgiEAE'
    ].join('&');
};

async function getFavicon(frame) {
    const favicon = await frame.evaluate(() => {
        function getIcons() {
            var links = document.getElementsByTagName('link');
            var icons = [];

            for (var i = 0; i < links.length; i++) {
                var link = links[i];

                var rel = link.getAttribute('rel');
                if (rel) {
                    if (rel.toLowerCase().indexOf('icon') > -1) {
                        var href = link.getAttribute('href');
                        if (href) {
                            if (href.toLowerCase().indexOf('https:') == -1 && href.toLowerCase().indexOf('http:') == -1
                                && href.indexOf('//') != 0) {
                                var absoluteHref = window.location.protocol + '//' + window.location.host;

                                if (window.location.port) {
                                    absoluteHref += ':' + window.location.port;
                                }
                                if (href.indexOf('/') == 0) {
                                    absoluteHref += href;
                                }
                                else {
                                    var path = window.location.pathname.split('/');
                                    path.pop();
                                    var finalPath = path.join('/');

                                    absoluteHref += finalPath + '/' + href;
                                }

                                icons.push(absoluteHref);
                            }
                            else if (href.indexOf('//') == 0) {
                                var absoluteUrl = window.location.protocol + href;

                                icons.push(absoluteUrl);
                            }
                            else {
                                icons.push(href);
                            }
                        }
                    }
                }
            }

            return icons;
        }
        return getIcons();
    });

    return Array.isArray(favicon) && favicon.length > 0 && favicon[0];
}