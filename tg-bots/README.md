# Telegram Automation Suite

Набор асинхронных Telegram-ботов на базе aiogram 3.x с поддержкой FSM, очередей публикации и платежей.

---

## Состав модулей

### 1. `main.py` — Commercial Channel Management Bot
SaaS-решение для управления публикациями в каналах:
- **Отложенный постинг:** планирование отправки сообщений с поддержкой временных зон (`tz_offset`).
- **Медиагруппы:** кастомный `AlbumMiddleware` для перехвата и группировки входящих фото/видео в единые альбомы.
- **Монетизация:** интеграция с платежными системами через Telegram Payments API / ЮKassa (обработка `PreCheckoutQuery` и биллинг квот).
- **Контроль доступа:** проверка обязательной подписки на спонсорские каналы через `get_chat_member`.

### 2. `party_bot.py` — Multiplayer Interactive Bot
Игровой бот с поддержкой инлайн-режима (`InlineQuery`) для групп и динамическим управлением состояниями игровых комнат.

### 3. `carousel_bot.py` — Media Carousel Engine
Микромодуль сборки и публикации форматированных медиа-каруселей с HTML-разметкой.

---

## Стек технологий

- **Фреймворк:** Python 3.10+, `aiogram` 3.x
- **Асинхронный HTTP:** `aiohttp` / `aiohttp.web`
- **База данных:** SQLite
- **Архитектура:** FSM (Finite State Machine), Middleware, `.env` конфигурация

---

## Установка и запуск

1. **Перейти в папку модуля:**
   ```bash
   cd all-portfolio-projects/tg-bots
   ```

2. **Установить зависимости:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Сконфигурировать `.env`:**
   ```bash
   cp .env.example .env
   ```

4. **Запустить:**
   ```bash
   python main.py
   ```
