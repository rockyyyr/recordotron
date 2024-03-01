const { PORT } = process.env;

module.exports = {
    elements: `
        <style>
            #indicator-container {
                position: absolute;
                top: 20px;
                right: 20px;
                z-index: 9999999999;
                display: flex;
                justify-content: space-around;
                gap: 30px;
                background-color: rgba(0, 0, 0, 0.7);
                padding: 10px;
                border-radius: 10px;
            }

            #recording-indicator {
                width: 30px;
                height: 30px;
                background-color: rgba(62, 14, 14, 0.391);
                border: 2px solid white;
                border-radius: 50%;
                color: white;
                text-align: center;
                line-height: 25px;
            }

            #recording-duration {
                width: 60px;
                color: white;
                text-align: right;
                font-size: 20px;
            }

            .recording-started {
                background-color: rgb(228, 30, 30) !important;
            }

            .recording-button {
                background: transparent;
                border: none;
                border-radius: 5px;
                border: 2px solid white;
                color: white;
                height: 30px;
                display: none;
            }

            .recording-button:active {
                color: rgb(170, 170, 170);
                border-color: rgb(170, 170, 170);
            }

        </style>
        <div id="indicator-container">
            <div id="recording-indicator"></div>
            <div id="recording-duration"></div>
            <button id="recording-start" class="recording-button" disabled>Start</button>
            <button id="recording-stop" class="recording-button" disabled>Stop</button>
        </div>`,

    script: `
            (() => {
                const stopButton = document.getElementById('recording-stop');
                const startButton = document.getElementById('recording-start');

                window.mouseRecorder.doStop = function() {
                    if(window.mouseRecorder?.needsStopping) {
                        clearInterval(window.mouseRecorder.needsStopping)
                    }
                    stopButton.disabled = true;
                    startButton.disabled = false;
                }

                stopButton.addEventListener('click', () => {
                    setTimeout(async () => {
                        await fetch('http://localhost:${PORT}/mouse-recorder/stop');
                        window.mouseRecorder.doStop();

                    }, 2000);
                });

                startButton.addEventListener('click', () => fetch('http://localhost:${PORT}/mouse-recorder/start'));

                window.mouseRecorder.ready = () => {
                    startButton.disabled = false;
                }
            
                window.mouseRecorder.countDownRecording = () => {
                    return new Promise(resolve => {
                        const indicator = document.getElementById('recording-indicator');
                        const duration = document.getElementById('recording-duration');
                        let durationCount = 0;
                        resolve();
                        indicator.classList.add('recording-started');
                        duration.innerText = '0s';
                        window.mouseRecorder.needsStopping = setInterval(() => {
                            duration.innerText = ++durationCount + 's';
                            indicator.classList.remove('recording-started');
                            setTimeout(() => indicator.classList.add('recording-started'), 250);
                        }, 1000);
                    });
                }
            })();`
};