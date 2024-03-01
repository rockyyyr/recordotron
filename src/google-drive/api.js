const { PROJECT_DIR, RECORDINGS_FOLDER } = process.env;
const { google } = require("googleapis");
const Path = require("path");
const fs = require("fs");
const archiver = require('archiver');


const KEY_FILE_PATH = Path.join(PROJECT_DIR, "private-key.json");

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
});

const api = google.drive({ version: 'v3', auth });

async function upload(folderName, folderPath) {
    const folderId = await createFolder(folderName);

    const mouseFilePath = Path.join(folderPath, 'recording.json');
    const videoFilePath = Path.join(folderPath, 'recording.webm');

    await Promise.all([
        uploadContent(folderId, mouseFilePath, 'recording.json', 'utf-8'),
        uploadContent(folderId, videoFilePath, 'recording.webm')
    ]);
}

async function uploadZip(folderPath) {
    const folderName = folderPath.split(Path.sep).pop();
    const fileName = `${folderName}.zip`;
    const zipFilePath = Path.join(PROJECT_DIR, 'recordings', fileName);

    rmIfExists(zipFilePath);

    await zipDirectory(folderPath, zipFilePath);

    const resource = {
        parents: [RECORDINGS_FOLDER],
        name: fileName
    };
    const media = {
        body: fs.createReadStream(zipFilePath),
        mimeType: 'application/zip'
    };

    try {
        await api.files.create({ resource, media });

    } catch (error) {
        throw error;

    } finally {
        rmIfExists(zipFilePath);
    }
}

function rmIfExists(path) {
    if (fs.existsSync(path)) {
        fs.rmSync(path);
    }
}

function uploadContent(folderId, filePath, fileName, encoding) {
    const resource = {
        parents: [folderId],
        name: fileName
    };
    const media = {
        body: fs.createReadStream(filePath, encoding || 'binary'),
        mimeType: 'application/octet-stream'
    };

    return api.files.create({ resource, media });
}

async function createFolder(folderName) {
    const resource = {
        name: folderName,
        parents: [RECORDINGS_FOLDER],
        mimeType: 'application/vnd.google-apps.folder',
    };

    const file = await api.files.create({
        resource,
        fields: 'id',
    });
    return file.data.id;
}

function zipDirectory(sourceDir, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(outPath);

    return new Promise((resolve, reject) => {
        archive
            .directory(sourceDir, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

module.exports = {
    upload,
    uploadZip
};
