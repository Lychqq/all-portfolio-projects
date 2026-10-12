from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from typing import Annotated
from fastapi import Depends
from collections.abc import AsyncGenerator

sqlite_url = "sqlite+aiosqlite:///database.db"
engine = create_async_engine(sqlite_url)

async def create_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncGenerator[AsyncSession, None] :
    async with AsyncSession(engine) as session:
        yield session
    

SessionDep = Annotated[AsyncSession,Depends(get_session)]

