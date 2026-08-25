# Expense & Subscription Tracker

Веб-сервис для учёта регулярных расходов, подписок и персональных финансов с JWT-аутентификацией и рендерингом страниц через Jinja2.

---

## Стек технологий

- **Backend:** FastAPI (Python 3.10+)
- **ORM:** SQLModel (SQLAlchemy Core + Pydantic)
- **База данных:** SQLite
- **Безопасность:** JWT (OAuth2 Password Bearer), HttpOnly Cookies, PBKDF2 SHA-256 (`passlib`)
- **Frontend:** Jinja2 Templates, HTML/CSS

---

## Архитектура и функционал

1. **Аутентификация и безопасность:**
   - Регистрация и авторизация пользователей с валидацией входных данных через Pydantic.
   - Хэширование паролей алгоритмом `pbkdf2_sha256`.
   - Защита сессий через HttpOnly Cookie и JWT-токены с ограниченным временем жизни.

2. **Управление подписками (CRUD):**
   - Добавление, редактирование и удаление записей расходов.
   - Привязка записей к пользователю через внешний ключ (`user_id`).
   - Автоматический расчет суммарных затрат за период.

---

## Установка и запуск

1. **Клонировать репозиторий:**
   ```bash
   git clone https://github.com/Lychqq/all-poryfolio-proects.git
   cd all-poryfolio-proects/expense-tracker
   ```

2. **Создать и активировать виртуальное окружение:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```

3. **Установить зависимости:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Настроить переменные окружения:**
   ```bash
   cp .env.example .env
   ```

5. **Запустить сервер:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Документация Swagger UI: `http://localhost:8000/docs`
