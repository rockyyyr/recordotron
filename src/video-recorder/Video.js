require('dotenv').config();
const { PROJECT_DIR } = process.env;
const { exec, spawn } = require('child_process');
const Path = require('path');

const mask = Path.join(PROJECT_DIR, 'alpha-mask-720.png');

module.exports = class Video {

    constructor() {
        this.ffmpeg = null;
        this.iina = null;
        this.recording = false;
    }

    preview() {
        const ffmpeg = [
            '-f', 'avfoundation',
            '-r', '30',
            '-video_size', '1280x720',
            '-pix_fmt', '0rgb',
            '-i', '0',
            '-i', mask,
            '-filter_complex', "[0:v]format=rgba[bg]; [1:v]format=rgba[fg]; [bg][fg]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p",
            '-vcodec', 'libx264',
            '-preset', 'ultrafast',
            '-tune', 'zerolatency',
            '-pix_fmt', 'yuv420p',
            '-f', 'mpegts',
            '-'
        ];

        const iina = [
            '--stdin',
        ];

        this.ffmpeg = spawn('ffmpeg', ffmpeg);
        this.iina = spawn('iina', iina);
        this.ffmpeg.stdout.pipe(this.iina.stdin);
    }

    stop() {
        return new Promise(resolve => {
            if (this.iina) {
                this.iina.kill('SIGINT');
                this.iina = null;
            }

            if (this.ffmpeg) {
                if (this.recording) {
                    this.ffmpeg.stderr.on('data', data => {
                        if (data.toString().startsWith('Exiting')) {
                            this.recording = false;
                            resolve();
                        }
                    });
                }
                this.ffmpeg.kill('SIGTERM');
                this.ffmpeg = null;
            }

            if (!this.recording) {
                resolve();
            }
        });
    }

    async record(outputPath) {
        await this.stop();
        return new Promise(resolve => {
            const ffmpeg = [
                '-y',
                '-f', 'avfoundation',
                '-r', '30',
                '-video_size', '1280x720',
                '-pix_fmt', '0rgb',
                '-i', '0',
                '-vcodec', 'libx264',
                '-preset', 'veryslow',
                '-crf', '10',
                '-pix_fmt', 'yuv420p',
                `${outputPath}.mp4`
            ];
            this.ffmpeg = spawn('ffmpeg', ffmpeg);
            this.ffmpeg.stderr.on('data', data => {
                if (data.toString().startsWith('frame=')) {
                    this.recording = true;
                    resolve(`${outputPath}.mp4`);
                }
            });
        });
    }
};
