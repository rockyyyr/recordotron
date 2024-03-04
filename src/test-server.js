require('dotenv').config();
const Mouse = require('./mouse-recorder');

(async () => {
    try {
        const mouse = new Mouse({ dataPath: './recordings' });
        mouse.initServer();

    } catch (error) {
        console.error(error);
    }
})();
