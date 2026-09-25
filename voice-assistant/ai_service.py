import speech_recognition as sr
import os
from pydub import AudioSegment
r = sr.Recognizer()
def transcribe(file_path:str):
    audio = AudioSegment.from_file(file_path)
    duration = len(audio) / 1000.0

    wav_path = file_path + '.wav'
    audio.export(wav_path,format='wav')

    with sr.AudioFile(wav_path) as source:
        audio_data = r.record(source)
        try:
            text = r.recognize_google(audio_data,language='ru-RU')
        except sr.UnknownValueError:
            text = '[Речь не распознана или тишина]'
        except Exception as e:
            text = f'[Ошибка распознания: {e}]'
    
    if os.path.exists(wav_path):
        os.remove(wav_path)
    
    return text, duration
