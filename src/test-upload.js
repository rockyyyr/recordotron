require('dotenv').config();
const google = require('./google-drive/api');

(async () => {
    try {
        const path = '/Users/rocky/Code/168/standalone-mouse-recorder/recordings/2024-02-29_8-42-17_pm';
        const folderName = path.split('/').pop();
        await google.uploadZip(folderName, path);

    } catch (error) {
        console.error(error);
    }
})();