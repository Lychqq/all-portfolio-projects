from fastapi import FastAPI, Depends,File,UploadFile
from typing import Annotated
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from database import create_db, SessionDep
from models import AudioDB, AudioResponse
from sqlmodel import select
import shutil
import os
from ai_service import transcribe

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title='Voice Assistant')
app.mount('/static', StaticFiles(directory='static'), name='static')
@app.get('/')
async def get_index():
    return FileResponse('static/index.html')
@app.on_event('startup')
def on_startup():
    os.makedirs("uploads", exist_ok=True)
    create_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


@app.get('/records/', response_model=list[AudioResponse])
def get_records(session: SessionDep):
    records = session.exec(select(AudioDB)).all()
    return records


@app.post('/transcribe/',response_model=AudioResponse, status_code=201)
async def upload_audio(file:UploadFile, session:SessionDep):
    file_path = f'uploads/{file.filename}'
    with open(file_path,'wb') as buffer:
        shutil.copyfileobj(file.file,buffer)
    text, duration = transcribe(file_path)
    new_audio = AudioDB(
    name=file.filename,
    long=duration,
    text=text,
    status='completed')

    session.add(new_audio)
    session.commit()
    session.refresh(new_audio)
    return new_audio




