from fastapi import FastAPI, Request, Response, Depends, HTTPException, status
from fastapi.templating import Jinja2Templates
from sqlmodel import SQLModel, Field, create_engine, Session, select
from contextlib import asynccontextmanager
from typing import Optional
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
import jwt
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str
    password_hash: str



class Subscription(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    price: float
    billing_cycle: str = Field(default="monthly")
    is_active: bool = Field(default=True)
    user_id: int | None = Field(default=None, foreign_key="user.id")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)





sqlite_url = "sqlite:///database.db"

engine = create_engine(sqlite_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Сервер запускается")
    create_db_and_tables()
    
    yield

    print("Сервер останавливается")

app = FastAPI(lifespan=lifespan)

templates = Jinja2Templates(directory="templates")

class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/register")
async def register(user: UserCreate):
    with Session(engine) as session:
        exiting_user = session.exec(select(User).where(User.username == user.username)).first()
        if exiting_user:
            raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")
        new_user = User(username=user.username, password_hash=get_password_hash(user.password))
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
    return {"message": "Пользователь успешно зарегистрирован"}

@app.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == form_data.username)).first()
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(status_code=400, detail="Неправильное имя пользователя или пароль")
        access_token = create_access_token({"sub": user.username})
        
        # Устанавливаем HttpOnly Cookie
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            samesite="lax",
            max_age=86400
        )
    return {"message": "Успешный вход"}

async def get_current_user(request: Request):
    token_header = request.cookies.get("access_token")
    if not token_header or not token_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Не авторизован")
        
    token = token_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Неправильный токен")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Недействительный токен")
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == username)).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user

@app.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Успешный выход"}
    

@app.get("/")
async def root(request: Request):
    with Session(engine) as session:
        statement = select(Subscription)
        results = session.exec(statement).all()
    return templates.TemplateResponse(request=request, name="index.html", context={"subscriptions": results})
    
@app.post("/subscriptions/")
async def create_subscription(sub: Subscription, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        sub.user_id = user.id
        session.add(sub)
        session.commit()
        session.refresh(sub)
    return sub


@app.get("/subscriptions/")
async def get_subscriptions(user: User = Depends(get_current_user)):
    with Session(engine) as session:
        statement = select(Subscription).where(Subscription.user_id == user.id)
        results = session.exec(statement).all()
    return results

@app.patch("/subscriptions/{sub_id}")
async def update_subscription(sub_id: int, new_price: float, user: User = Depends(get_current_user)):
    with Session(engine) as session:
       sub = session.get(Subscription, sub_id)
       if sub and sub.user_id == user.id:
           sub.price = new_price
           session.add(sub)
           session.commit()
           session.refresh(sub)
           return sub
       return {'error': "Подписка не найдена или нет доступа"}

@app.delete("/subscriptions/{sub_id}")
async def delete_subscription(sub_id: int, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        sub = session.get(Subscription, sub_id)
        if sub and sub.user_id == user.id:
            session.delete(sub)
            session.commit()
            return {"message": "Подписка удалена"}
        return {"error": "Подписка не найдена или нет доступа"}