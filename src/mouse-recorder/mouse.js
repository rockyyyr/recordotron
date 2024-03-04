const { PORT, PROJECT_DIR, NO_UPLOAD } = process.env;

const robot = require('robotjs');
const fs = require('fs');
const { performance } = require('perf_hooks');
const Path = require('path');
const express = require('express');
const recordingHUDInjector = require('./injectors/hud');
const google = require('../google-drive/api');

const injectors = Path.join(PROJECT_DIR, 'src', 'mouse-recorder', 'injectors');

const Init = {
    Root: { path: Path.join(injectors, 'init.js') },
    Cursor: { path: Path.join(injectors, 'cursor.js') },
};

const Recorders = {
    Click: { path: Path.join(injectors, 'click.js') },
    Scroll: { path: Path.join(injectors, 'scroll.js') },
};

const IFrames = {
    BindMouseEvents: { path: Path.join(injectors, 'iframes', 'bindMouseEvents.js') }
};

const browserBarHeight = 110;

module.exports = class Mouse {

    constructor({ fps, dataPath, outputFileName, page, server, recording }) {
        this.page = page;
        this.fps = fps || 60;
        this.dataPath = dataPath || './data';
        this.outputFileName = outputFileName || false;
        this.events = [];
        this.scrolls = [];
        this.clickInjected = false;
        this.scrollInjected = false;
        this.stopped = true;
        this.targets = [];
        this.prevEvent = { x: -1, y: -1 };
        this.recordingPath = recording;
        this.scrollHeights = {};
        this.outputPath = null;

        this.server = server || express();
        this.server.use(middleware);
        this.serverInstance = null;
    }

    initServer() {
        this.server.get('/mouse-recorder/start', async (req, res) => {
            try {
                res.end();
                if (this.stopped) {
                    console.log('recording');
                    await this.record();
                }

            } catch (error) {
                console.error(error);
            }
        });
        this.server.get('/mouse-recorder/stop', async (req, res) => {
            try {
                res.end();
                if (!this.stopped) {
                    console.log('stopping');
                    this.stop();
                }

            } catch (error) {
                console.error(error);
            }
        });
        this.server.post('/mouse-recorder/upload', async (req, res) => {
            try {
                if (!fs.existsSync(this.outputPath)) {
                    fs.mkdirSync(this.outputPath);
                }

                const outputFilePath = Path.join(this.outputPath, "recording.webm");

                await this._handleVideoUpload(req, outputFilePath);
                await this.doExit();

                if (!NO_UPLOAD) {
                    await google.uploadZip(this.outputPath);
                }

                return res.status(201).end();

            } catch (error) {
                res.status(500).send(error);
                console.error(error);
            }
        });
        this.serverInstance = this.server.listen(PORT);
    }

    _handleVideoUpload(req, outputPath) {
        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(outputPath);
            req.on('data', chunk => {
                writeStream.write(chunk);
            });
            req.on('end', () => {
                writeStream.end();
                resolve();
            });
            req.on('error', (err) => {
                writeStream.close();
                reject(err);
            });
            writeStream.on('error', (err) => {
                writeStream.close();
                reject(err);
            });
        });
    }

    async initialize() {
        await this.page.addScriptTag(Init.Root);
        this.targets.forEach(async target => await target.frame.addScriptTag(Init.Root));
    }

    countDown() {
        return this.page.evaluate('window.mouseRecorder.countDownRecording()');
    }

    async addTarget(frame, id, element = false) {
        await this._getTargetScrollHeight(id, frame, element);
        this.targets.push({
            id,
            frame,
            element
        });
    }

    async ready() {
        this.initServer();
        // await this.enableCursor();
        await this.injectRecordingHUD();
        await this.injectClickRecorder();
        await this.injectScrollRecorder();
        await this.page.evaluate('window.mouseRecorder.ready()');
    }

    async record() {
        return new Promise(async (resolve) => {
            this.stopped = false;
            this.outputPath = Path.join(this.dataPath, getDate());

            if (!this.hudInjected) {
                await this.injectRecordingHUD();
            }
            await this.countDown();

            const delay = this.calculateDelay(this.fps);

            const recorders = [];

            if (this.clickInjected) {
                recorders.push(this.page.evaluate(`window.mouseRecorder.recordClicks()`));
            }

            if (this.scrollInjected) {
                for (const { frame, element } of this.targets) {
                    recorders.push(frame.evaluate(`window.mouseRecorder.recordScrolls(${element || ''})`));
                }
            }

            await Promise.all(recorders);

            const recordingStart = performance.now();

            const interval = setInterval(() => {
                const { x, y } = robot.getMousePos();
                this.events.push({
                    x,
                    y,
                    pTime: performance.now(),
                    time: Date.now(),
                    timeline: performance.now() - recordingStart
                });

                if (this.stopped) {
                    clearInterval(interval);
                    resolve();
                }
            }, delay);
        });

        // while (!this.stopped) {

        // const start = performance.now();
        // const { x, y } = robot.getMousePos();
        // this.events.push({ x, y, time: Date.now(), timeline: Date.now() - recordingStart });
        // const duration = performance.now() - start;
        // await this._delayFrame(delay - duration);
        // }
        // console.log('recording finished');
    }

    async enableCursor() {
        await this.page.addScriptTag(Init.Cursor);

        for (const { frame } of this.targets) {
            await frame.addScriptTag(IFrames.BindMouseEvents);
        }
    }

    async _getTargetScrollHeight(id, frame, element) {
        const target = element || 'document.documentElement';
        this.scrollHeights[id] = await frame.evaluate(`${target}.scrollHeight - ${target}.clientHeight`);
    }

    _scaleScrollHeights(config, events) {
        return events.map(e => {
            const event = e;
            event.y = e.y - browserBarHeight;

            if (event.scroll) {
                const id = event.scroll.targetId;
                const recordedHeight = config.scrollHeights[id];
                const currentHeight = this.scrollHeights[id];
                const multiple = currentHeight / recordedHeight;
                event.scroll.event.start.y = Math.floor(event.scroll.event.start.y * multiple);
                event.scroll.event.end.y = Math.floor(event.scroll.event.end.y * multiple);
            }
            return event;
        });
    }

    async _tickFrame(event, targets) {
        const { x, y, click, scroll } = event;

        if (this.prevEvent.x !== x && this.prevEvent.y !== y) {
            this.page.mouse.move(x, y);
            this.prevEvent = event;
        }

        if (click) {
            await this.page.mouse.click(click.x, click.y, { delay: 25 });
        }

        if (scroll) {
            const { frame, element } = targets[scroll.targetId];
            frame.evaluate(`${element || 'window'}.scrollTo({ top: ${scroll.event.end.y}, behavior: 'smooth' })`);
        }
    }

    async _initPlayback() {
        await this.enableCursor();

        const file = fs.readFileSync(this.recordingPath, { encoding: 'utf-8' });
        const data = JSON.parse(file);
        const { config, events: _events } = data;
        let events = this._scaleScrollHeights(config, _events);
        const targets = this._targetsAsObject();

        if (this.fps > config.fps) {
            events = this._interpolateEvents(events, config.fps, this.fps);

        } else if (this.fps < config.fps) {
            events = this._reduceEvents(events, config.fps, this.fps);
        }

        return {
            config,
            events,
            targets
        };
    }

    async frames() {
        const { config, events, targets } = await this._initPlayback();
        const frames = events.length;
        let index = 0;

        return {
            next: () => index < frames && this._tickFrame(events[index++], targets),
            config
        };
    }

    async play() {
        const { config, events, targets } = await this._initPlayback();
        const delay = this.calculateDelay(config.fps);

        for (const event of events) {
            const start = performance.now();

            await this._tickFrame(event, targets);

            const duration = performance.now() - start;
            await this._delayFrame(delay - duration);
        }
    };

    async injectRecordingHUD() {
        this.hudInjected = true;
        await this.page.addScriptTag({ content: `document.body.insertAdjacentHTML('beforeend', \`${recordingHUDInjector.elements}\`)` });
        await this.page.addScriptTag({ content: recordingHUDInjector.script });
    }

    async injectClickRecorder() {
        this.clickInjected = true;
        await this.page.addScriptTag(Recorders.Click);
    }

    async injectScrollRecorder() {
        this.scrollInjected = true;
        for (const { frame } of this.targets) {
            await frame.addScriptTag(Recorders.Scroll);
        }
    }

    stop() {
        this.stopped = true;
    }

    disconnect() {
        return new Promise((resolve) => {
            if (this.serverInstance) {
                try {
                    this.serverInstance.close(resolve);
                } catch (error) {
                    console.error(error);
                }
            } else {
                return resolve();
            }
        });
    }

    async doExit() {
        if (this.clickInjected) {
            this.clicks = await this.page.evaluate('window.mouseRecorder.getClicks()');
        }

        if (this.scrollInjected) {
            for (const { id, frame } of this.targets) {
                const events = await frame.evaluate('window.mouseRecorder.getScrolls()');

                if (events && Array.isArray(events) && events.length > 0) {
                    this.scrolls.push({ id, events });
                }
            }
        }

        this.writeToFile();
    }

    async writeToFile() {
        if (this.clicks.length > 0) {
            this._mergeClicks();
        }

        if (this.scrolls.length > 0) {
            this._mergeScrolls();
        }

        fs.writeFileSync(Path.join(this.outputPath, 'recording.json'), JSON.stringify({
            config: this.writeConfig(),
            events: this.events,
        }));
    }

    calculateDelay(fps) {
        return 1000 / fps;
    }

    setFps(fps) {
        if (fps) {
            this.fps = fps;
        }
    }

    _mergeClicks() {
        if (this.clicks.length === 0) {
            return;
        }

        let clickIndex = 0;

        const clickEvents = this.clicks;
        const clickLength = this.clicks.length;
        const eventLength = this.events.length;

        for (let i = 0; i < eventLength - 1; i++) {
            const click = clickEvents[clickIndex];
            const event = this.events[i];

            if (click.time < event.time) {
                this.events[i].click = click;
                clickIndex++;

            }

            if (clickIndex === clickLength) {
                return;
            }
        }
    }

    _mergeScrolls() {
        if (this.scrolls.length === 0) {
            return;
        }

        const eventLength = this.events.length;

        for (const { id, events } of this.scrolls) {
            const scrolls = events;
            const scrollLength = scrolls.length;

            let scrollIndex = 0;

            for (let i = 0; i < eventLength; i++) {
                const scroll = scrolls[scrollIndex];
                const event = this.events[i];

                if (scroll.start.time < event.time) {
                    this.events[i].scroll = { targetId: id, event: scroll };
                    scrollIndex++;
                }

                if (scrollIndex === scrollLength) {
                    break;
                }
            }
        }
    }

    _targetsAsObject() {
        const array = this.targets;
        const result = {};
        for (let i = 0; i < array.length; i++) {
            const { id, frame, element } = array[i];
            result[id] = {
                frame,
                element
            };
        }
        return result;
    }

    writeConfig() {
        const config = {
            fps: this.fps,
            duration: this.events.length / this.fps,
            scrollHeights: {}
        };
        for (const key of Object.keys(this.scrollHeights)) {
            config.scrollHeights[key] = this.scrollHeights[key];
        }
        return config;
    }

    _delayFrame(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    _interpolateEvents(events, fromFps, targetFps) {
        const framesToInsert = targetFps / fromFps - 1;
        const result = [];

        for (let i = 0; i < events.length - 1; i++) {
            const startPoint = events[i];
            const endPoint = events[i + 1];

            result.push(startPoint);

            for (let j = 1; j <= framesToInsert; j++) {
                const fraction = j / (framesToInsert + 1);
                const interpolatedX = startPoint.x + fraction * (endPoint.x - startPoint.x);
                const interpolatedY = startPoint.y + fraction * (endPoint.y - startPoint.y);
                result.push({ x: interpolatedX, y: interpolatedY });
            }
        }

        result.push(events[events.length - 1]);
        return result;
    }

    _reduceEvents(events, fromFps, targetFps) {
        const step = fromFps / targetFps;
        const dropFrames = step - 1;
        const result = [];

        for (let i = 0; i < events.length; i += step) {
            const event = events[i];

            for (let j = 1; j <= dropFrames; j++) {
                const droppedFrame = events[i + j];

                if (droppedFrame.click) {
                    event.click = droppedFrame.click;
                }

                if (droppedFrame.scroll) {
                    event.scroll = droppedFrame.scroll;
                }
            }
            result.push(event);
        }
        return result;
    }
};

function getDate() {
    const date = new Date();
    return date
        .toLocaleString('en-CA', { timeZone: 'AMERICA/VANCOUVER' })
        .replace(/,|\./g, '')
        .replace(/\s/g, '_')
        .replaceAll(':', '-');
}

function middleware(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
}
