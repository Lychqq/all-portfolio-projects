# Task State: Portfolio Website Migration (Jorge Toloza Style)

## Goals
- Создать полноценную статическую страницу портфолио в репозитории `all-portfolio-projects` под GitHub Pages.
- Полностью воспроизвести визуальный стиль, эффекты и интерактивность сайта `https://jorgetoloza.co/`:
  - Навигация по углам экрана с эффектом анимированных букв `hover-letters`.
  - Центральный хедер с центральной монограммой и 3D-вращением слов направлений вокруг центра (`word-rotate` / `word-rotate-reverse`) с `mix-blend-mode: difference`.
  - Плавный скролл Lenis + многослойный параллакс изображений (`elastic-image-mask` с разной скоростью `data-speed`).
  - Фиксированный блок информации о текущем проекте в нижнем левом углу с кинетической анимацией строк.
  - Кастомный курсор мыши с режимом инверсии (`mix-blend-mode: difference`) и индикатором действия `View Project ↗`.
  - Полная мобильная адаптивность.
- Разместить реальные проекты Николая Львова:
  1. О!дин запрос — Хакатон Островка 2026 (Пакетные туры под ключ, отель + перелет + трансфер, GigaChat + Groq)
  2. AI Challenge 3D DINOv2 (SOTA детекция дефектов сеток, score 12.0+)
  3. MovieRecSys (Курсовая рекомендательная система со свайпами Tinder)
  4. VK Support Analytics & AI Triage (FastAPI + LLM Qwen2.5-3B-Instruct)
  5. Voice Assistant & Speech-to-Text (FastAPI + Web Audio API)
  6. Expense & Subscription Tracker (FastAPI + Jinja2 + SQLite)
  7. Telegram Automation Suite (Python + SQLite)
  8. JavaScript Coursework & Labs Suite (CMS, Canvas 2D, REST Blog)

## Checklist
- [x] Анализ референса `https://jorgetoloza.co/` (DOM, CSS, JS, Lenis, структура `/projects/data.json`).
- [x] Сбор информации обо всех проектах пользователя.
- [x] Генерация и пересъемка всех скриншотов через Playwright в `assets/projects/` (по 3 уникальных экрана на каждый проект).
- [x] Верстка и логика интерактивного сайта портфолио (`index.html`, `style.css`, `app.js`).
- [x] Тестирование в Chrome DevTools (рендеринг, скролл, параллакс, мобильная версия).
- [x] Фиксация изменений в git.
- [x] Post-Execution Protocol (Memory & Growth log).
