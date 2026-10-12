# Voice Assistant & Speech-to-Text Service

Асинхронный веб-сервис для записи, загрузки и транскрибации речи (Speech-to-Text). Разработан на базе **FastAPI**, **SQLModel** и **Google Speech Recognition** с поддержкой асинхронного неблокирующего ввода-вывода и контейнеризации в **Docker**.

---

## Архитектура и ключевые особенности

- **Non-blocking Event Loop:** Вызовы транскрибации вынесены в системный пул потоков (`asyncio.to_thread`), что исключает блокировку основного Event Loop сервера при обработке аудио.
- **Асинхронный I/O:** Загрузка и чтение аудиофайлов выполняются асинхронно через `aiofiles` с потоковой записью чанками по 1 МБ.
- **Безопасность хранения:** Генерация уникальных UUID-имен для файлов исключает уязвимости Path Traversal и перезапись файлов при совпадении исходных имен.
- **Асинхронная база данных:** Хранение метаданных и истории транскрибаций через SQLModel с драйвером `aiosqlite`.
- **Современный жизненный цикл приложения:** Инициализация ресурсов и создание таблиц БД реализованы через контекстный менеджер `lifespan`.
- **Интерактивный UI:** Запись звука напрямую с микрофона через Web Audio API / MediaRecorder, drag-and-drop/выбор файлов и быстрое копирование результата в буфер обмена в один клик.

---

## Стек технологий

- **Backend:** Python 3.11, FastAPI, SQLModel, aiosqlite, SQLite, aiofiles, Uvicorn
- **Audio Processing:** SpeechRecognition, pydub, ffmpeg
- **Frontend:** Vanilla JavaScript (MediaRecorder API, Fetch API, Clipboard API), HTML5, CSS3 (Golos Text)
- **DevOps:** Docker, Docker Compose, uv

---

## Структура проекта

```text
voice_assisten/
├── static/
│   ├── app.js             # Логика записи микрофона, отправки на сервер и копирования
│   ├── index.html         # Разметка веб-интерфейса
│   └── style.css          # Стилизация интерфейса
├── uploads/               # Каталог для хранения загруженных аудио
├── ai_service.py          # Модуль транскрибации речи через SpeechRecognition и pydub
├── database.py            # Настройка асинхронного движка SQLite и сессий SQLModel
├── Dockerfile             # Сборка контейнера с предустановленным ffmpeg
├── docker-compose.yml     # Запуск приложения в изолированном контейнере
├── main.py                # Точка входа FastAPI, роуты и управление жизненным циклом
├── models.py              # Схемы данных SQLModel (AudioFile, AudioDB, AudioResponse)
├── pyproject.toml         # Конфигурация проекта и зависимости uv
└── README.md              # Документация проекта
```

---

## API Эндпоинты

- `GET /` — Веб-интерфейс приложения.
- `POST /transcribe/` — Загрузка аудиофайла (Multipart-form `file`), асинхронная обработка, сохранение в БД и возврат распознанного текста:
  ```json
  {
    "id": 1,
    "name": "audio_sample.ogg",
    "long": 4.4,
    "text": "Привет, это проверка транскрибации аудио",
    "status": "completed",
    "created_at": "2026-10-12T19:00:00Z"
  }
  ```
- `GET /records/` — Получение истории всех сохраненных аудиозаписей из БД.
- `GET /docs` — Интерактивная Swagger/OpenAPI документация.

---

## Быстрый запуск

### Вариант 1. Запуск через Docker Compose (Рекомендуемый)

Требуется установленный Docker:
```bash
docker compose up -d --build
```
Сервис станет доступен по адресу: `http://localhost:8000/`.

---

### Вариант 2. Локальный запуск через `uv`

1. Клонируйте репозиторий:
   ```bash
   git clone <URL_РЕПОЗИТОРИЯ>
   cd voice_assisten
   ```

2. Установите зависимости:
   ```bash
   uv sync
   ```

3. Запустите сервер:
   ```bash
   uv run uvicorn main:app --reload --port 8000
   ```

4. Откройте в браузере:
   - Интерфейс: `http://127.0.0.1:8000/`
   - Swagger документация: `http://127.0.0.1:8000/docs`
