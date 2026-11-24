# Task State: Portfolio Website Migration (Jorge Toloza Style)

## Goals
- Создать полноценную статическую страницу портфолио в репозитории `all-portfolio-projects` под GitHub Pages.
- Полностью воспроизвести визуальный стиль, эффекты и интерактивность сайта `https://jorgetoloza.co/`:
  - Навигация по углам экрана с эффектом анимированных букв `hover-letters`.
  - Центральный хедер с центральной монограммой и 3D-вращением слов направлений вокруг центра (`word-rotate` / `word-rotate-reverse`).
  - Плавный скролл Lenis + многослойный параллакс изображений (`elastic-image-mask` с разной скоростью `data-speed`).
  - Фиксированный блок информации о текущем проекте в нижнем левом углу с кинетической анимацией строк.
  - Кастомный курсор мыши с режимом инверсии (`mix-blend-mode: difference`) и индикатором действия.
  - Полная мобильная адаптивность.
- Разместить реальные проекты Николая Львова:
  1. AI Challenge 3D DINOv2 (SOTA детекция дефектов сеток, score 12.0+)
  2. MovieRecSys (Курсовая рекомендательная система со свайпами Tinder)
  3. VK Support Analytics & AI Triage (FastAPI + LLM Qwen2.5-3B-Instruct)
  4. Voice Assistant & Speech-to-Text (FastAPI + Web Audio API)
  5. Expense & Subscription Tracker (FastAPI + Jinja2 + SQLite)
  6. Telegram Automation Suite (Python + SQLite)
  7. JavaScript Coursework & Labs Suite (CMS, Canvas 2D, REST Blog)

## Checklist
- [x] Анализ референса `https://jorgetoloza.co/` (DOM, CSS, JS, Lenis, структура `/projects/data.json`).
- [x] Сбор информации обо всех проектах пользователя.
- [ ] Генерация визуальных обложек/превьюшек для каждого проекта в папку `assets/projects/`.
- [ ] Верстка и логика интерактивного сайта портфолио (`index.html`, `style.css`, `app.js`).
- [ ] Тестирование в Chrome DevTools (рендеринг, скролл, параллакс, мобильная версия).
- [ ] Фиксация изменений в git.
- [ ] Post-Execution Protocol (Memory & Growth log).
