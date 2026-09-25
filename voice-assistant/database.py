from sqlmodel import SQLModel, create_engine,Session
from typing import Annotated
from fastapi import Depends
sqlite_url = "sqlite:///database.db"
engine = create_engine(sqlite_url)

def create_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
    

SessionDep = Annotated[Session,Depends(get_session)]

