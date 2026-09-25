from fastapi import FastAPI
from pydantic import BaseModel
from sqlmodel import SQLModel,Field
from datetime import datetime, timezone



class AudioFile(SQLModel):
    name: str = Field(index=True)
    long: float | None = None
    text: str | None = None
    summary: str  | None = None
    status: str = 'processing'

class AudioDB(AudioFile, table = True):
    id: int | None = Field(default=None,primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.
  now(timezone.utc))
    
class AudioResponse(AudioFile):
    id: int
    created_at:datetime

