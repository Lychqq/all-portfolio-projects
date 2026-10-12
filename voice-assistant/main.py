from fastapi import FastAPI, Depends,File,UploadFile
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
from database import create_db, SessionDep
from models import AudioDB, AudioResponse
from sqlmodel import select
import os
import uuid
import asyncio
from pathlib import Path
import aiofiles
from ai_service import transcribe
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


@asynccontextmanager
async def lifespan(app:FastAPI):
    os.makedirs("uploads", exist_ok=True)
    await create_db()
    yield

app = FastAPI(title='Voice Assistant',lifespan=lifespan)
app.mount('/static', StaticFiles(directory='static'), name='static')
@app.get('/')
async def get_index():
    return FileResponse('static/index.html')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


@app.get('/records/', response_model=list[AudioResponse])
async def get_records(session: SessionDep):
    result = await session.exec(select(AudioDB))
    records = result.all()
    return records


@app.post('/transcribe/', response_model=AudioResponse, status_code=201)
async def upload_audio(file: UploadFile, session: SessionDep):
    extension = Path(file.filename).suffix.lower() if file.filename else ".mp3"
    safe_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join("uploads", safe_filename)

    async with aiofiles.open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            await buffer.write(chunk)

    text, duration = await asyncio.to_thread(transcribe, file_path)

    new_audio = AudioDB(
        name=file.filename or "recording.mp3",
        long=duration,
        text=text,
        status='completed',
    )

    session.add(new_audio)
    await session.commit()
    await session.refresh(new_audio)
    return new_audio




