
const express = require('express');
const fs = require('fs');
const Path = require('path');
const server = express();


function getDate() {
    const date = new Date();
    return date
        .toLocaleString('en-CA', { timeZone: 'AMERICA/VANCOUVER' })
        .replace(/,|\./g, '')
        .replace(/\s/g, '_')
        .replaceAll(':', '-');
}

server.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

server.get('/mouse-recorder/start', async (req, res) => {
    res.end();
    console.log('starting');
});

server.post('/mouse-recorder/upload', async (req, res) => {
    try {
        const outputPath = Path.join('.', 'test-recordings');

        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }
        const outputFilePath = Path.join(outputPath, "recording.webm");

        await handleVideoUpload(req, outputFilePath);
        console.log('video uploaded');

        await doExit();
        console.log('mouse recording saved');

        return res.status(201).end();

    } catch (error) {
        res.status(500).send(error);
        console.error(error);
    }
});

function handleVideoUpload(req, outputPath) {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(outputPath);
        req.on('data', (chunk) => writeStream.write(chunk));
        req.on('end', () => {
            console.log('received end');
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


server.post('/mouse-recorder/upload', async (req, res) => {
    try {
        const outputPath = Path.join('.', 'test-recordings');

        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }

        const [video] = await Promise.all([
            handleUpload(req),
            doExit()
        ]);

        console.log(video);

        const filePath = Path.join(outputPath, getDate() + ".webm");

        fs.writeFileSync(filePath, video);
        res.status(201).end();

    } catch (error) {
        res.status(500).send(error);
        console.error(error);
    }
});

// function handleVideoUpload(req) {
//     return new Promise((resolve, reject) => {
//         const chunks = [];
//         req.on("data", (chunk) => chunks.push(chunk));
//         req.on("end", () => resolve(Buffer.concat(chunks)));
//         req.on("error", (err) => reject(err));
//     });
// }

function doExit() {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

server.listen(4141);