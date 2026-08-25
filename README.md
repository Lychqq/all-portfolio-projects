# Backend & AI Engineering Portfolio

Репозиторий содержит практические проекты в области Backend-разработки (FastAPI), Telegram-автоматизации (Aiogram 3 / FSM) и прикладного машинного обучения.

---

## Проекты в репозитории

### 1. [Expense & Subscription Tracker](./expense-tracker)
**Стек:** FastAPI, SQLModel (SQLAlchemy), SQLite, JWT (OAuth2 Password Bearer), Passlib (PBKDF2 SHA-256), Jinja2.
- Веб-сервис для контроля подписок и персональных расходов с аутентификацией пользователей.
- Хэширование паролей, сессии на HttpOnly Cookies и JWT-токенах.
- Реляционная схема данных с внешними ключами и каскадной целостностью.

### 2. [Telegram Automation Suite](./tg-bots)
**Стек:** Aiogram 3.x, Asyncio, FSM, SQLite, Aiohttp, Telegram Payments API.
- SaaS-бот для автоматизации каналов: отложенный постинг с учётом часовых поясов, кастомный AlbumMiddleware для медиа-каруселей, монетизация и биллинг квот через ЮKassa.
- Мультиплеерный интерактивный бот с инлайн-режимом для групп.

---

## Связанные проекты

### [Pet-Bank-RAG (Банковский AI-ассистент с мультимодальным OCR)](https://github.com/Lychqq/pet-bank-rag)
**Стек:** LangChain, Google Gemini Vision, pgvector, PostgreSQL, Ragas, SentenceTransformers.
- Корпоративный RAG-ассистент с Corrective RAG (CRAG) и гибридным поиском (Dense векторы + BM25).
- Извлечение данных из сканов документов и паспортов через Gemini Vision с детерминированной валидацией (100% unit-test coverage).
- Оценка качества поиска и генерации через метрики Ragas (Context Precision, Faithfulness).

---

## Технический стек

- **Языки:** Python 3.10+, SQL (PostgreSQL, SQLite)
- **Backend:** FastAPI, SQLModel, SQLAlchemy, Pydantic, Jinja2, Uvicorn
- **Data Science & ML:** Pandas, NumPy, Scikit-Learn, LangChain, SentenceTransformers, pgvector, Ragas
- **Асинхронность & Боты:** Aiogram 3, Asyncio, Aiohttp, FSM, Webhooks
- **Инструменты:** Git, GitHub, Unit Testing (unittest/pytest), REST API
