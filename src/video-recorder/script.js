(async () => {
    const buttonStart = document.querySelector('#buttonStart');
    const buttonStop = document.querySelector('#buttonStop');
    const previewToggle = document.querySelector('#buttonPreview');
    const maskToggle = document.querySelector('#buttonMask');
    const led = document.querySelector('#led');
    const recordingIndicator = document.querySelector('#recording-indicator');
    const preview = document.querySelector('#preview');
    const previewContainer = document.querySelector('.preview-container');
    const recording = document.querySelector('#recording');
    const recordingContainer = document.querySelector('.recording-container');
    const mask = document.querySelector('.alpha-mask');
    const upload = document.querySelector('#uploadButton');
    const durationEl = document.querySelector('#duration');
    const modalElement = document.querySelector('#modal');
    const modalTitle = document.querySelector('#modal-title');
    const modalContent = document.querySelector('#modal-content');
    const modalButton = document.querySelector('#modal-button');
    const spinner = document.querySelector('#spinner');
    const spinnerMessage = document.querySelector('#spinner-message');

    let duration = 0;
    let spinnerInterval = null;
    let messageInterval = null;
    let messages = ['UPLOADING', 'PREPARING THE NUKES', 'LAUNCHING', 'ROUNDING UP THE JEWS', 'GASSING UP THE CHAMBER', 'ALLAHU AKBAR'];
    let messageIndex = 0;

    const Modal = {
        open: (title, message) => {
            modalTitle.innerText = title;
            modalContent.innerText = message || '';
            modalElement.classList.remove('hidden');
        },
        close: () => {
            modalTitle.innerText = '';
            modalContent.innerText = '';
            modalElement.classList.add('hidden');
        }
    };

    modalButton.addEventListener('click', () => modalElement.classList.add('hidden'));

    previewToggle.addEventListener('click', event => {
        if (previewContainer.classList.contains('hidden')) {
            recording.pause();
            recordingContainer.classList.add('hidden');
            previewContainer.classList.remove('hidden');
            previewToggle.classList.add('preview-active');
        } else {
            recordingContainer.classList.remove('hidden');
            previewContainer.classList.add('hidden');
            previewToggle.classList.remove('preview-active');
        }
    });

    maskToggle.addEventListener('click', event => {
        if (mask.classList.contains('hidden')) {
            mask.classList.remove('hidden');
        } else {
            mask.classList.add('hidden');
        }
    });

    const stream = await navigator.mediaDevices.getUserMedia({ // <1>
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            aspectRatio: { ideal: 16 / 9 }
        },
        audio: true,
    });

    preview.srcObject = stream;
    let blob;

    const mediaRecorder = new MediaRecorder(stream, { // <3>
        mimeType: 'video/webm;codecs=vp9',
    });

    let durationInterval;

    buttonStart.addEventListener('click', async () => {
        await fetch('http://localhost:4141/mouse-recorder/start');
        resetVideo();
        durationInterval = setInterval(() => {
            duration++;
            durationEl.innerText = formatSeconds(duration);

            if (recordingIndicator.style.opacity === '1') {
                recordingIndicator.style.opacity = 0.1;
            } else {
                recordingIndicator.style.opacity = 1;
            }

        }, 1000);
        mediaRecorder.start(); // <4>
        buttonStart.setAttribute('disabled', '');
        buttonStop.removeAttribute('disabled');
        led.classList.add('led-blink');
    });

    buttonStop.addEventListener('click', async () => {
        if (durationInterval) {
            clearInterval(durationInterval);
            durationInterval = null;
        }

        await fetch('http://localhost:4141/mouse-recorder/stop');
        mediaRecorder.stop(); // <5>
        buttonStart.removeAttribute('disabled');
        buttonStop.setAttribute('disabled', '');
        led.classList.remove('led-blink');
        recordingIndicator.innerText = '';
        previewToggle.disabled = false;
    });

    mediaRecorder.addEventListener('dataavailable', event => {
        blob = event.data;
        recording.src = URL.createObjectURL(event.data);
        upload.disabled = false;
    });

    upload.addEventListener('click', async event => {
        try {
            showSpinner();

            const response = await fetch('http://localhost:4141/mouse-recorder/upload', {
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream"
                },
                body: blob,
            });

            hideSpinner();

            if (response.status !== 201) {
                console.warn(response.status);
                const text = await response.text();
                console.warn(text);

                Modal.open('Somethings fucked', text);

            } else if (response.status === 201) {
                Modal.open('Success!');
            }

        } catch (err) {
            console.error(err);
            Modal.open('Somethings fucked', err);
        }
    });

    function resetVideo() {
        duration = 0;
        blob = null;
        upload.disabled = true;
        previewToggle.disabled = true;
        recording.pause();
        recordingIndicator.innerText = 'RECORDING';
        recordingContainer.classList.add('hidden');
        previewContainer.classList.remove('hidden');
    }

    function formatSeconds(s) {
        return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
    }

    function showSpinner() {
        spinner.classList.remove('hidden');
        spinnerInterval = setInterval(() => {
            if (spinnerMessage.style.opacity === '1') {
                spinnerMessage.style.opacity = 0;
            } else {
                spinnerMessage.style.opacity = 1;
            }
        }, 1000);
        spinnerMessage.innerText = messages[0];
        messageInterval = setInterval(() => {
            spinnerMessage.innerText = messages[++messageIndex % messages.length];
        }, 20000);
    }

    function hideSpinner() {
        spinner.classList.add('hidden');
        if (spinnerInterval) {
            clearInterval(spinnerInterval);
            spinnerInterval = null;
        }
        if (messageInterval) {
            clearInterval(messageInterval);
            messageInterval = null;
        }
        messageIndex = 0;
    }
})();
