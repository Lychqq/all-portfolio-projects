'use strict';

let mediaRecorder;

let audioChunks = [];

const recordBtn = document.getElementById('recordBtn');

const statusText = document.getElementById('status');

const resultText = document.getElementById('resultText');

const fileInput= document.getElementById('audioFileInput');

const uploadBtn = document.getElementById('uploadBtn')


recordBtn.addEventListener('click', async() =>{
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio:true});
            mediaRecorder = new MediaRecorder(stream);

            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);

            };
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                await sendAudioToBackend(audioBlob, 'microphone_record.wav');
            };

            mediaRecorder.start();
            recordBtn.textContent = 'Остановить запись';
            recordBtn.style.backgroundColor = '#ff4d4d';
            statusText.textContent = 'Идет запись...';
        } catch (err) {
            statusText.textContent = 'Ошибка: доступ к микрофону запрещен';
        }
    } else {
        mediaRecorder.stop();
        recordBtn.textContent = 'Начать запись';
        recordBtn.style.backgroundColor = '';
        statusText.textContent = 'Обработка аудио...';
    }
});

uploadBtn.addEventListener('click', async() => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Пожалуйста, выберите файл')
        return;
    }
    statusText.textContent = 'Загрузка и распознонание';
    await sendAudioToBackend(file, file.name);


});

async function sendAudioToBackend(fileBlob, filename) {
    const formData = new FormData();

    formData.append('file', fileBlob, filename);

    try {
        const response = await fetch('http://127.0.0.1:8000/transcribe/', {
            method:'POST',
            body: formData
        })
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        const data = await response.json();

        resultText.textContent = data.text;
        statusText.textContent = `Готово! Длительность ${data.long} сек`;

    } catch (err) {
        statusText.textContent = 'Не удалось распознать аудио';
        resultText.textContent =err.message;
        
    }
}