import os
import asyncio
import html
import sqlite3
import datetime
import json
from typing import Any, Dict, List
from dotenv import load_dotenv

import aiohttp
from aiohttp import web
from aiogram import Bot, Dispatcher, F, BaseMiddleware
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    Message, ChatMemberUpdated, InlineKeyboardMarkup, 
    InlineKeyboardButton, CallbackQuery, ReplyKeyboardMarkup, KeyboardButton,
    LabeledPrice, PreCheckoutQuery, SuccessfulPayment, LinkPreviewOptions
)
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State

load_dotenv()

TOKEN = os.getenv("BOT_TOKEN", "")
API_URL = "https://api.telegram.org/bot" + TOKEN
WEB_SERVER_HOST = os.getenv("WEB_SERVER_HOST", "http://localhost:8080")
ADMIN_ID = int(os.getenv("ADMIN_ID", "0"))
SHOP_ID = os.getenv("SHOP_ID", "")
SECRET_KEY = os.getenv("PAYMENT_SECRET_KEY", "")

bot = Bot(token=TOKEN)
dp = Dispatcher()

# ----------------- БАЗА ДАННЫХ -----------------
def init_db():
    conn = sqlite3.connect("bot_features_database.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS channels (chat_id INTEGER PRIMARY KEY, chat_title TEXT, owner_id INTEGER)''')
    c.execute('''CREATE TABLE IF NOT EXISTS scheduled_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id INTEGER, owner_id INTEGER, html_content TEXT, send_at INTEGER)''')
    c.execute('''CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY, tz_offset INTEGER, free_posts INTEGER DEFAULT 1, paid_posts INTEGER DEFAULT 0, sub_until INTEGER DEFAULT 0, referrer_id INTEGER DEFAULT 0)''')
    c.execute('''CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)''')
    for col, default in [("free_posts", "1"), ("paid_posts", "0"), ("sub_until", "0"), ("referrer_id", "0")]:
        try: c.execute(f"ALTER TABLE users ADD COLUMN {col} INTEGER DEFAULT {default}")
        except: pass
    try: c.execute("ALTER TABLE users ADD COLUMN username TEXT DEFAULT ''")
    except: pass
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('force_sub', '0')")
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('force_channels', '[]')")
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('vp_post_data', '')")
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('total_posts_published', '0')")
    try: c.execute("ALTER TABLE users ADD COLUMN vp_owed INTEGER DEFAULT 0")
    except: pass
    try: c.execute("ALTER TABLE scheduled_posts ADD COLUMN is_vp INTEGER DEFAULT 0")
    except: pass
    try: c.execute("ALTER TABLE users ADD COLUMN last_active INTEGER DEFAULT 0")
    except: pass
    conn.commit()
    conn.close()

init_db()

def get_setting(key: str) -> str:
    conn = sqlite3.connect("bot_features_database.db")
    c = conn.cursor()
    c.execute("SELECT value FROM settings WHERE key=?", (key,))
    res = c.fetchone()
    conn.close()
    return res[0] if res else ""

def set_setting(key: str, value: str):
    conn = sqlite3.connect("bot_features_database.db")
    c = conn.cursor()
    c.execute("UPDATE settings SET value=? WHERE key=?", (value, key))
    conn.commit()
    conn.close()

async def check_forced_sub(user_id: int) -> bool:
    if user_id == ADMIN_ID: return True
    if get_setting("force_sub") == "0": return True
    channels = json.loads(get_setting("force_channels"))
    if not channels: return True
    for ch in channels:
        try:
            member = await bot.get_chat_member(ch, user_id)
            if member.status == "left": return False
        except: pass
    return True

def get_user_status(user_id: int) -> dict:
    if user_id == ADMIN_ID:
        return {"free_posts": 999, "paid_posts": 999, "sub_until": 2147483647, "referrer_id": 0}
    conn = sqlite3.connect("bot_features_database.db")
    c = conn.cursor()
    c.execute("SELECT free_posts, paid_posts, sub_until, referrer_id FROM users WHERE user_id=?", (user_id,))
    res = c.fetchone()
    conn.close()
    if res: return {"free_posts": res[0], "paid_posts": res[1], "sub_until": res[2], "referrer_id": res[3]}
    return {"free_posts": 1, "paid_posts": 0, "sub_until": 0, "referrer_id": 0}

def has_quota(user_id: int) -> bool:
    if user_id == ADMIN_ID: return True
    st = get_user_status(user_id)
    now = int(datetime.datetime.now().timestamp())
    if st["sub_until"] > now: return True
    if st["free_posts"] > 0 or st["paid_posts"] > 0: return True
    return False

def consume_quota(user_id: int) -> bool:
    if user_id == ADMIN_ID: return True
    st = get_user_status(user_id)
    now = int(datetime.datetime.now().timestamp())
    if st["sub_until"] > now: return True
    conn = sqlite3.connect("bot_features_database.db")
    c = conn.cursor()
    if st["free_posts"] > 0:
        c.execute("UPDATE users SET free_posts = free_posts - 1 WHERE user_id=?", (user_id,))
        conn.commit(); conn.close(); return True
    if st["paid_posts"] > 0:
        c.execute("UPDATE users SET paid_posts = paid_posts - 1 WHERE user_id=?", (user_id,))
        conn.commit(); conn.close(); return True
    conn.close(); return False

def parse_date_time(text: str, user_now: datetime.datetime) -> datetime.datetime:
    text = text.strip()
    for fmt in ["%H:%M", "%d.%m %H:%M", "%d.%m.%Y %H:%M"]:
        try:
            dt = datetime.datetime.strptime(text, fmt)
            if fmt == "%H:%M":
                target_dt = datetime.datetime.combine(user_now.date(), dt.time())
                if target_dt < user_now: target_dt += datetime.timedelta(days=1)
                return target_dt
            elif fmt == "%d.%m %H:%M":
                target_dt = dt.replace(year=user_now.year)
                if target_dt < user_now: target_dt = target_dt.replace(year=user_now.year + 1)
                return target_dt
            else: return dt
        except ValueError: pass
    raise ValueError("Invalid format")

def add_watermarks(html_content: str) -> str:
    watermark = '<blockquote>Сделано в <a href="https://t.me/layerPost_bot">@layerPost_bot</a></blockquote>'
    return f"{html_content}{watermark}"

# ----------------- СОСТОЯНИЯ FSM -----------------
class BuilderState(StatesGroup):
    waiting_for_tz = State()
    main_editor = State()
    choose_block = State()
    
    add_text = State(); add_quote_style = State(); add_quote_text = State()
    add_table_dims = State(); add_table_cell = State()
    add_list_style = State(); add_list_item = State(); add_list_subitem = State()
    add_details_summary = State(); add_details_content = State()
    add_map = State(); add_photo = State(); add_collage = State(); add_slideshow = State()
    add_video = State(); add_audio = State()
    main_editor = State()
    waiting_for_time = State()
    waiting_for_channel = State()
    waiting_for_time_input = State()

class AdminState(StatesGroup):
    waiting_for_user_id = State()
    waiting_for_broadcast_type = State()
    waiting_for_broadcast_text = State()
    waiting_for_channel_add = State()
    waiting_for_bc_time = State()
    waiting_for_bc_time_input = State()

class SettingsState(StatesGroup):
    waiting_for_tz_change = State()

# ----------------- ИНТЕРФЕЙС И МИДЛВАРЫ -----------------
class AlbumMiddleware(BaseMiddleware):
    def __init__(self): self.album_data: Dict[str, List[Message]] = {}
    async def __call__(self, handler, event: Message, data: Dict[str, Any]):
        if not event.media_group_id: return await handler(event, data)
        mid = event.media_group_id
        if mid not in self.album_data:
            self.album_data[mid] = [event]; await asyncio.sleep(1.0); data["album"] = self.album_data.pop(mid); return await handler(event, data)
        else: self.album_data[mid].append(event); return

class ForceSubMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data: Dict[str, Any]):
        user = data.get("event_from_user")
        if user:
            try:
                conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
                c.execute("UPDATE users SET last_active=? WHERE user_id=?", (int(datetime.datetime.now().timestamp()), user.id))
                conn.commit(); conn.close()
            except: pass
            
        if not user or user.id == ADMIN_ID: return await handler(event, data)
        
        if get_setting("force_sub") == "1":
            channels = json.loads(get_setting("force_channels"))
            if channels:
                bot: Bot = data.get("bot")
                not_subbed = []
                for ch in channels:
                    try:
                        member = await bot.get_chat_member(ch, user.id)
                        if member.status in ["left", "kicked"]: not_subbed.append(ch)
                    except Exception as e:
                        not_subbed.append(ch)
                        try: await bot.send_message(ADMIN_ID, f"⚠️ Ошибка проверки ОП для канала {ch}: {e}\nУбедитесь, что бот добавлен туда в админы!")
                        except: pass
                
                if not_subbed:
                    kb_rows = [[InlineKeyboardButton(text=f"Подписаться", url=f"https://t.me/{ch.replace('@', '')}")] for ch in not_subbed]
                    kb_rows.append([InlineKeyboardButton(text="✅ Проверить подписку", callback_data="check_sub")])
                    kb = InlineKeyboardMarkup(inline_keyboard=kb_rows)
                    
                    if isinstance(event, Message):
                        await event.answer("⚠️ Для использования бота необходимо подписаться на спонсорские каналы:", reply_markup=kb)
                    elif isinstance(event, CallbackQuery):
                        if event.data == "check_sub":
                            await event.answer("❌ Вы не подписались на все каналы!", show_alert=True)
                        else:
                            await event.answer()
                            await event.message.answer("⚠️ Для использования бота необходимо подписаться на спонсорские каналы:", reply_markup=kb)
                    return
        return await handler(event, data)

dp.message.middleware(AlbumMiddleware())
dp.message.middleware(ForceSubMiddleware())
dp.callback_query.middleware(ForceSubMiddleware())

@dp.callback_query(F.data == "check_sub")
async def handle_check_sub_success(call: CallbackQuery):
    await call.answer("✅ Подписка подтверждена! Спасибо.", show_alert=True)
    await call.message.delete()
    # To restore the user experience, we can prompt them to start again.
    await call.message.answer("Продолжите с того места, где остановились, или воспользуйтесь меню.")

def get_main_keyboard(user_id: int):
    vp_owed = 0
    try:
        conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
        c.execute("SELECT vp_owed FROM users WHERE user_id=?", (user_id,)); res = c.fetchone()
        if res: vp_owed = res[0]
        conn.close()
    except: pass
    
    kb = [
        [KeyboardButton(text="📝 Конструктор поста")],
        [KeyboardButton(text="👤 Личный кабинет"), KeyboardButton(text="💳 Подписка")],
        [KeyboardButton(text="📅 Мои посты"), KeyboardButton(text="🤝 Рефералы")],
        [KeyboardButton(text="⏱ Настройки времени")]
    ]
    if vp_owed > 0 or user_id == ADMIN_ID:
        kb.insert(1, [KeyboardButton(text="📢 ВП")])
    if user_id == ADMIN_ID: kb.append([KeyboardButton(text="👑 Админ-панель")])
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)

async def upload_file(bot: Bot, file_id: str) -> str:
    file = await bot.get_file(file_id)
    file_bytes_io = await bot.download_file(file.file_path)
    form = aiohttp.FormData()
    form.add_field("key", "6d207e02198a847aa98d0a2a901485a5"); form.add_field("action", "upload")
    form.add_field("source", file_bytes_io.read(), filename="media.jpg", content_type="image/jpeg")
    async with aiohttp.ClientSession() as session:
        async with session.post("https://freeimage.host/api/1/upload", data=form) as resp:
            return (await resp.json())["image"]["url"]

async def save_media_locally(bot: Bot, file_id: str, ext: str) -> str:
    import os; os.makedirs("media", exist_ok=True)
    file = await bot.get_file(file_id)
    await bot.download_file(file.file_path, destination=f"media/{file_id}.{ext}")
    return f"{WEB_SERVER_HOST}/media/{file_id}.{ext}"

async def send_rich_message(chat_id: int, final_html: str):
    async with aiohttp.ClientSession() as session:
        async with session.post(API_URL + "/sendRichMessage", json={"chat_id": chat_id, "rich_message": {"html": final_html}}) as resp:
            res = await resp.json()
            if not res.get("ok"):
                raise Exception(res.get("description", str(res)))
            return res

def render_blocks(blocks: List[Dict]) -> str:
    html_parts = []
    for b in blocks:
        btype = b["type"]
        if btype == "text": html_parts.append(f"<p>{b['content']}</p>")
        elif btype == "quote": html_parts.append(f"<{'blockquote' if b['style'] == 'blockquote' else 'aside'}>{b['content']}</{'blockquote' if b['style'] == 'blockquote' else 'aside'}>")
        elif btype == "list":
            tag = 'ul' if b['style'] == 'ul' else 'ol'
            lst_html = f"<{tag}>"
            for it in b['items']:
                lst_html += f"<li>{it['text']}"
                if it.get('subitems'):
                    lst_html += f"<{tag}>"
                    for sub in it['subitems']: lst_html += f"<li>{sub}</li>"
                    lst_html += f"</{tag}>"
                lst_html += "</li>"
            lst_html += f"</{tag}>"
            html_parts.append(lst_html)
        elif btype == "table":
            t = '<table border="1">'
            for r in range(b["rows"]):
                t += "<tr>"
                for c in range(b["cols"]):
                    v = b["data"][r][c] if b["data"][r][c] else " "
                    t += f"<th>{v}</th>" if r == 0 else f"<td>{v}</td>"
                t += "</tr>"
            html_parts.append(t + "</table>")
        elif btype == "details": html_parts.append(f"<details><summary>{b['summary']}</summary><p>{b['content']}</p></details>")
        elif btype == "map": html_parts.append(f'<tg-map lat="{b["lat"]}" lon="{b["lon"]}" zoom="15" width="400" height="300"></tg-map>')
        elif btype == "photo": html_parts.append(f"<figure><img src='{b['url']}'/></figure>")
        elif btype == "collage": html_parts.append(f"<tg-collage>{''.join([f'<img src={u}/>' for u in b['urls']])}</tg-collage>")
        elif btype == "slideshow": html_parts.append(f"<tg-slideshow>{''.join([f'<img src={u}/>' for u in b['urls']])}</tg-slideshow>")
        elif btype == "video": html_parts.append(f"<figure><video src='{b['url']}'></video></figure>")
        elif btype == "audio": html_parts.append(f"<figure><audio src='{b['url']}'></audio></figure>")
    return "".join(html_parts)

# ----------------- ПРИВЕТСТВИЕ И РЕГИСТРАЦИЯ -----------------
@dp.my_chat_member()
async def on_my_chat_member(update: ChatMemberUpdated):
    if update.chat.type == "channel":
        if update.new_chat_member.status in ["administrator", "creator"]:
            owner_id = update.from_user.id
            conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
            c.execute("INSERT OR REPLACE INTO channels (chat_id, chat_title, owner_id) VALUES (?, ?, ?)", (update.chat.id, update.chat.title, owner_id))
            conn.commit(); conn.close()
            try: await bot.send_message(owner_id, f"✅ Канал <b>{update.chat.title}</b> успешно привязан! Теперь вы можете публиковать в него посты.", parse_mode="HTML")
            except: pass
        elif update.new_chat_member.status in ["left", "kicked"]:
            conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
            c.execute("DELETE FROM channels WHERE chat_id=?", (update.chat.id,))
            conn.commit(); conn.close()

@dp.message(CommandStart())
async def start_cmd(message: Message, state: FSMContext):
    await state.clear(); await state.update_data(blocks=[])
    args = message.text.split()[1:] if len(message.text.split()) > 1 else []
    ref_id = int(args[0].replace("ref", "")) if args and args[0].startswith("ref") else 0
    if ref_id == message.from_user.id: ref_id = 0
    
    username = message.from_user.username or ""
    await state.update_data(ref_id=ref_id, username=username)
    
    conn = sqlite3.connect("bot_features_database.db")
    c = conn.cursor()
    c.execute("SELECT tz_offset FROM users WHERE user_id=?", (message.from_user.id,))
    user = c.fetchone()
    
    if user:
        c.execute("UPDATE users SET username=? WHERE user_id=?", (username, message.from_user.id))
        conn.commit()
        
    conn.close()
    
    welcome_text = (
        "👋 **Добро пожаловать в LayerPost!**\n\n"
        "Я мощный бот-конструктор. Со мной вы можете создавать невероятно красивые посты для Telegram:\n"
        "🔹 Слайдшоу (Карусели) и Коллажи\n"
        "🔹 Кликабельные Спойлеры\n"
        "🔹 Таблицы, Цитаты, Интерактивные Карты\n\n"
        "Попробуйте нажать кнопку **«📝 Конструктор поста»** ниже!"
    )
    
    if not user:
        kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="⏭ Продолжить с МСК", callback_data="skip_tz")]])
        await message.answer(welcome_text + "\n\nНо сначала давайте настроим ваш часовой пояс (например, напишите +3 для МСК), либо нажмите кнопку ниже:", reply_markup=kb, parse_mode="Markdown")
        await state.set_state(BuilderState.waiting_for_tz)
    else:
        await message.answer(welcome_text, reply_markup=get_main_keyboard(message.from_user.id), parse_mode="Markdown")
        await show_editor(message, state, message.from_user.id)

@dp.callback_query(BuilderState.waiting_for_tz, F.data == "skip_tz")
async def skip_tz_cmd(call: CallbackQuery, state: FSMContext):
    await _register_user(call.from_user.id, 3, state)
    await call.message.delete()
    await show_editor(call.message, state, call.from_user.id)

@dp.message(BuilderState.waiting_for_tz)
async def set_tz_cmd(message: Message, state: FSMContext):
    try:
        offset = int(message.text.replace("+", ""))
        await _register_user(message.from_user.id, offset, state)
        await show_editor(message, state, message.from_user.id)
    except: await message.answer("Введите число (например, +3).")

async def _register_user(user_id: int, tz: int, state: FSMContext):
    data = await state.get_data()
    ref_id = data.get("ref_id", 0)
    username = data.get("username", "")
    
    conn = sqlite3.connect("bot_features_database.db")
    c = conn.cursor()
    c.execute("INSERT INTO users (user_id, tz_offset, free_posts, referrer_id, username) VALUES (?, ?, 1, ?, ?)", (user_id, tz, ref_id, username))
    conn.commit()
    if ref_id > 0:
        c.execute("UPDATE users SET free_posts = free_posts + 1 WHERE user_id=?", (ref_id,))
        conn.commit()
        try: await bot.send_message(ref_id, "🎉 По вашей ссылке зарегистрировался реферал! Вы получили +1 бесплатный пост.")
        except: pass
    conn.close()
    await bot.send_message(user_id, "Вы успешно зарегистрированы!", reply_markup=get_main_keyboard(user_id))

@dp.message(F.text == "⏱ Настройки времени")
async def tz_settings_cmd(message: Message, state: FSMContext):
    await message.answer("Укажите ваш часовой пояс относительно UTC (например, напишите +3 для Москвы, +5 для Екатеринбурга):")
    await state.set_state(SettingsState.waiting_for_tz_change)

@dp.message(SettingsState.waiting_for_tz_change)
async def process_tz_change(message: Message, state: FSMContext):
    try:
        offset = int(message.text.replace("+", ""))
        conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
        c.execute("UPDATE users SET tz_offset=? WHERE user_id=?", (offset, message.from_user.id))
        conn.commit(); conn.close()
        await message.answer(f"✅ Часовой пояс успешно изменен на UTC{message.text}!", reply_markup=get_main_keyboard(message.from_user.id))
        await state.clear()
    except: await message.answer("❌ Введите число (например, +3).")

@dp.message(F.text == "👤 Личный кабинет")
async def profile_cmd(message: Message):
    st = get_user_status(message.from_user.id)
    now = int(datetime.datetime.now().timestamp())
    
    if st["sub_until"] > now:
        if st["sub_until"] == 2147483647: sub_text = "Безлимитная 👑 (Навсегда)"
        else: sub_text = f"Активна до {datetime.datetime.fromtimestamp(st['sub_until']).strftime('%d.%m.%Y %H:%M')}"
    else: sub_text = "Нет активной"
        
    text = (
        f"👤 **Ваш Личный Кабинет:**\n\n"
        f"🆔 Ваш ID: `{message.from_user.id}`\n\n"
        f"🆓 Бесплатных постов: `{st['free_posts']}`\n"
        f"💎 Купленных постов: `{st['paid_posts']}`\n"
        f"📅 Подписка: `{sub_text}`"
    )
    await message.answer(text, parse_mode="Markdown")

@dp.message(F.text == "📝 Конструктор поста")
async def constructor_btn(message: Message, state: FSMContext):
    await state.update_data(blocks=[], is_broadcast_mode=False, is_vp_editor=False, is_vp_publish=False)
    await show_editor(message, state, message.from_user.id)

@dp.message(F.text == "📢 ВП")
async def vp_menu(message: Message, state: FSMContext):
    user_id = message.from_user.id
    if user_id == ADMIN_ID:
        await state.update_data(blocks=[], is_broadcast_mode=False, is_vp_editor=True, is_vp_publish=False)
        await show_editor(message, state, user_id)
        return
        
    vp_data = get_setting("vp_post_data")
    if not vp_data: return await message.answer("ВП пост еще не создан администратором.")
    blocks = json.loads(vp_data)
    
    await state.update_data(blocks=blocks, is_vp_publish=True)
    try: await send_rich_message(user_id, render_blocks(blocks))
    except: pass
    
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Опубликовать СЕЙЧАС", callback_data="time_now")],
        [InlineKeyboardButton(text="📅 Отложить (Запланировать)", callback_data="time_delay")]
    ])
    await message.answer("Это обязательный ВП-пост. Куда публикуем?", reply_markup=kb)
    await state.set_state(BuilderState.waiting_for_time)

@dp.message(F.text == "📅 Мои посты")
async def scheduled_posts_cmd(message: Message):
    user_id = message.from_user.id
    conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
    c.execute("SELECT id, send_at, chat_id, is_vp FROM scheduled_posts WHERE owner_id=?", (user_id,))
    posts = c.fetchall()
    c.execute("SELECT tz_offset FROM users WHERE user_id=?", (user_id,))
    tz_res = c.fetchone()
    user_tz = tz_res[0] if tz_res else 3
    conn.close()
    
    if not posts:
        return await message.answer("У вас пока нет запланированных постов.")
        
    text = "📅 **Ваши запланированные посты:**\n\n"
    kb_rows = []
    for pid, send_at, chat_id, is_vp in posts:
        dt = datetime.datetime.fromtimestamp(send_at) + datetime.timedelta(hours=user_tz)
        dest = "Рассылка" if str(chat_id) == "0" else "Канал"
        vp_tag = " [ВП-ПОСТ]" if is_vp == 1 else ""
        text += f"🔹 **Пост #{pid}{vp_tag}** — {dt.strftime('%d.%m.%Y %H:%M')} ({dest})\n"
        kb_rows.append([InlineKeyboardButton(text=f"❌ Отменить #{pid}", callback_data=f"delpost_{pid}")])
        
    await message.answer(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=kb_rows), parse_mode="Markdown")

@dp.callback_query(F.data.startswith("delpost_"))
async def del_scheduled_post(call: CallbackQuery):
    pid = int(call.data.split("_")[1])
    conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
    c.execute("SELECT is_vp FROM scheduled_posts WHERE id=? AND owner_id=?", (pid, call.from_user.id))
    res = c.fetchone()
    if res:
        is_vp = res[0]
        c.execute("DELETE FROM scheduled_posts WHERE id=?", (pid,))
        if is_vp == 1:
            c.execute("UPDATE users SET vp_owed=2 WHERE user_id=?", (call.from_user.id,))
            await call.answer("❌ Вы отменили ВП-пост! Возможность публиковать свои посты заблокирована.", show_alert=True)
            await bot.send_message(call.from_user.id, "Вам необходимо опубликовать ВП-пост для продолжения работы.", reply_markup=get_main_keyboard(call.from_user.id))
        else:
            await call.answer("✅ Пост отменен.")
        conn.commit()
    conn.close()
    await call.message.delete()

@dp.message(F.text == "🤝 Рефералы")
async def ref_program(message: Message):
    bot_info = await bot.get_me()
    ref_link = f"https://t.me/{bot_info.username}?start=ref{message.from_user.id}"
    text = ("🤝 **Реферальная программа**\n\nПриглашайте людей и получайте бонусы:\n"
            "🔸 За каждого нового реферала: **+1 бесплатный пост**.\n"
            "🔸 Реферал купил 1 месяц подписки: **Вам +1 неделя подписки**.\n"
            "🔸 Реферал купил 3 месяца: **Вам +21 день подписки**.\n"
            "🔸 Реферал купил 6 месяцев: **Вам +2 месяца подписки**.\n\n"
            f"🔗 Ваша ссылка:\n`{ref_link}`")
    await message.answer(text, parse_mode="Markdown")

# ----------------- БИЛЛИНГ И ПЛАТЕЖИ -----------------
@dp.message(F.text == "💳 Подписка")
async def billing_cmd(message: Message):
    text = (
        "🛒 **Магазин LayerPost**\n\n"
        "**💎 Что дает 1 Пост?**\n"
        "Позволяет один раз опубликовать или отложить пост без встроенного водяного знака бота. Идеально для разовых рекламных интеграций.\n\n"
        "**👑 Что дает Подписка?**\n"
        "Открывает безлимитный доступ ко всем функциям! Вы сможете публиковать и планировать неограниченное количество постов без водяных знаков на весь период действия подписки. А также **полностью отключает рекламные рассылки** от бота.\n\n"
        "Выберите тариф:"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="💳 1 Пост (40 руб)", callback_data="buy_post_1")],
        [InlineKeyboardButton(text="💳 1 Месяц (399 руб)", callback_data="buy_sub_1")],
        [InlineKeyboardButton(text="💳 3 Месяца (1137 руб) -5%", callback_data="buy_sub_3")],
        [InlineKeyboardButton(text="💳 6 Месяцев (2034 руб) -15%", callback_data="buy_sub_6")]
    ])
    await message.answer(text, reply_markup=kb, parse_mode="Markdown")

@dp.callback_query(F.data.startswith("buy_"))
async def buy_handler(call: CallbackQuery):
    await call.answer()
    prices = {"buy_post_1": ("Один премиум-пост", 40), "buy_sub_1": ("Подписка на 1 месяц", 399), "buy_sub_3": ("Подписка на 3 месяца", 1137), "buy_sub_6": ("Подписка на 6 месяцев", 2034)}
    title, price = prices[call.data]
    
    import uuid, base64
    url = "https://api.yookassa.ru/v3/payments"
    auth = base64.b64encode(f"{SHOP_ID}:{SECRET_KEY}".encode()).decode('utf-8')
    headers = {"Authorization": f"Basic {auth}", "Idempotence-Key": str(uuid.uuid4()), "Content-Type": "application/json"}
    data = {
        "amount": {"value": f"{price}.00", "currency": "RUB"},
        "capture": True,
        "confirmation": {"type": "redirect", "return_url": "https://t.me/your_bot_username"},
        "description": title,
        "metadata": {"payload": call.data, "user_id": call.from_user.id}
    }
    
    msg = await call.message.answer("⏳ Создаю ссылку на оплату...")
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=data) as resp:
            res = await resp.json()
            if "id" not in res: return await msg.edit_text(f"❌ Ошибка создания платежа: {res}")
            
            pay_url = res["confirmation"]["confirmation_url"]
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="💳 Оплатить", url=pay_url)],
                [InlineKeyboardButton(text="🔄 Проверить оплату", callback_data=f"chkpay_{res['id']}_{call.data}")]
            ])
            await msg.edit_text(f"Оплата: **{title}**\nСумма: **{price} руб**\n\nПерейдите по ссылке для оплаты, а затем нажмите кнопку проверки.", reply_markup=kb, parse_mode="Markdown")

@dp.callback_query(F.data.startswith("chkpay_"))
async def check_payment_handler(call: CallbackQuery):
    _, payment_id, payload = call.data.split("_", 2)
    
    import base64
    url = f"https://api.yookassa.ru/v3/payments/{payment_id}"
    auth = base64.b64encode(f"{SHOP_ID}:{SECRET_KEY}".encode()).decode('utf-8')
    headers = {"Authorization": f"Basic {auth}"}
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            res = await resp.json()
            status = res.get("status")
            
            if status == "pending": return await call.answer("⏳ Платеж еще не прошел. Попробуйте через минуту.", show_alert=True)
            elif status != "succeeded": return await call.answer(f"❌ Ошибка или отмена платежа (статус: {status})", show_alert=True)
            
            # Payment succeeded!
            user_id = call.from_user.id
            st = get_user_status(user_id)
            now = int(datetime.datetime.now().timestamp())
            conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
            bonus_sub_days = 0
            
            if payload == "buy_post_1":
                c.execute("UPDATE users SET paid_posts = paid_posts + 1 WHERE user_id=?", (user_id,))
                await call.message.edit_text("🎉 Оплата прошла успешно! Вы купили 1 премиум-пост.")
            else:
                days = 30 if "sub_1" in payload else (90 if "sub_3" in payload else 180)
                new_sub = max(now, st["sub_until"]) + days * 24 * 3600
                c.execute("UPDATE users SET sub_until=? WHERE user_id=?", (new_sub, user_id))
                await call.message.edit_text(f"🎉 Оплата прошла успешно! Подписка активирована на {days} дней.")
                if "sub_1" in payload: bonus_sub_days = 7
                elif "sub_3" in payload: bonus_sub_days = 21
                elif "sub_6" in payload: bonus_sub_days = 60

            if st["referrer_id"] > 0 and bonus_sub_days > 0:
                c.execute("SELECT sub_until FROM users WHERE user_id=?", (st["referrer_id"],)); ref_st = c.fetchone()
                if ref_st:
                    r_sub = max(now, ref_st[0]) + bonus_sub_days * 24 * 3600
                    c.execute("UPDATE users SET sub_until=? WHERE user_id=?", (r_sub, st["referrer_id"]))
                    try: await bot.send_message(st["referrer_id"], f"🎉 Ваш реферал купил подписку! Вам начислено +{bonus_sub_days} дней подписки.")
                    except: pass
            conn.commit(); conn.close()

# ----------------- АДМИНКА И РАССЫЛКА -----------------
@dp.message(F.text == "👑 Админ-панель")
async def admin_panel_cmd(message: Message, state: FSMContext):
    if message.from_user.id != ADMIN_ID: return
    force_st = "ВКЛ" if get_setting("force_sub") == "1" else "ВЫКЛ"
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📊 Статистика", callback_data="admin_stats")],
        [InlineKeyboardButton(text="🎁 Выдать (За ВП)", callback_data="admin_grant_vp"), InlineKeyboardButton(text="🎁 Выдать (БЕЗ ВП)", callback_data="admin_grant_free")],
        [InlineKeyboardButton(text="❌ Забрать подписку", callback_data="admin_revoke")],
        [InlineKeyboardButton(text="📣 Рассылка рекламная", callback_data="admin_broadcast_menu")],
        [InlineKeyboardButton(text=f"⚙️ Обяз. подписка: {force_st}", callback_data="admin_toggle_force")],
        [InlineKeyboardButton(text="📝 Добавить канал в ОП", callback_data="admin_add_channel")],
        [InlineKeyboardButton(text="⚙️ Управление каналами ОП", callback_data="admin_list_channels")]
    ])
    await message.answer("Админ-панель:", reply_markup=kb)

@dp.callback_query(F.data == "admin_stats")
async def admin_stats(call: CallbackQuery):
    conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM users"); total_users = c.fetchone()[0]
    
    now = int(datetime.datetime.now().timestamp())
    c.execute("SELECT COUNT(*) FROM users WHERE last_active >= ?", (now - 86400,)); dau = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM users WHERE last_active >= ?", (now - 2592000,)); mau = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM users WHERE sub_until > ?", (now,)); premium_users = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM channels"); total_channels = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM scheduled_posts"); pending_posts = c.fetchone()[0]
    
    c.execute("SELECT value FROM settings WHERE key='total_posts_published'"); res = c.fetchone()
    total_published = res[0] if res else "0"
    conn.close()
    
    text = (
        "📊 **Статистика бота:**\n\n"
        f"👥 Всего пользователей: **{total_users}**\n"
        f"🌟 С активной подпиской: **{premium_users}**\n\n"
        f"🔥 Активных за 24 часа: **{dau}**\n"
        f"🔥 Активных за месяц: **{mau}**\n\n"
        f"📢 Привязано каналов: **{total_channels}**\n"
        f"📝 Всего опубликовано постов: **{total_published}**\n"
        f"⏳ Ожидают публикации: **{pending_posts}**"
    )
    await call.message.edit_text(text, parse_mode="Markdown")

@dp.callback_query(F.data.startswith("admin_"))
async def admin_action_handler(call: CallbackQuery, state: FSMContext):
    if call.from_user.id != ADMIN_ID: return
    await call.answer(); action = call.data
    
    if action == "admin_toggle_force":
        set_setting("force_sub", "1" if get_setting("force_sub") == "0" else "0")
        force_st = "ВКЛ" if get_setting("force_sub") == "1" else "ВЫКЛ"
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🎁 Выдать", callback_data="admin_grant"), InlineKeyboardButton(text="❌ Забрать", callback_data="admin_revoke")],
            [InlineKeyboardButton(text="📣 Рассылка рекламная", callback_data="admin_broadcast_menu")],
            [InlineKeyboardButton(text=f"⚙️ Обяз. подписка: {force_st}", callback_data="admin_toggle_force")],
            [InlineKeyboardButton(text="📝 Добавить канал в ОП", callback_data="admin_add_channel")],
            [InlineKeyboardButton(text="⚙️ Управление каналами ОП", callback_data="admin_list_channels")]
        ])
        await call.message.edit_reply_markup(reply_markup=kb)
    elif action == "admin_list_channels":
        channels = json.loads(get_setting("force_channels"))
        if not channels: return await call.message.answer("Список каналов ОП пуст.")
        kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=f"❌ Удалить {ch}", callback_data=f"admin_delch_{ch}")] for ch in channels])
        await call.message.answer("Список каналов ОП (нажмите для удаления):", reply_markup=kb)
    elif action.startswith("admin_delch_"):
        ch_to_del = action.split("admin_delch_")[1]
        channels = json.loads(get_setting("force_channels"))
        if ch_to_del in channels:
            channels.remove(ch_to_del)
            set_setting("force_channels", json.dumps(channels))
            await call.message.answer(f"✅ Канал {ch_to_del} удален из ОП.")
            await call.message.delete()
    elif action == "admin_add_channel":
        await call.message.answer("Пришлите юзернейм канала (например @mychannel):")
        await state.set_state(AdminState.waiting_for_channel_add)
    elif action == "admin_broadcast_menu":
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Обычный текст", callback_data="admin_bc_text")],
            [InlineKeyboardButton(text="Rich Message (Собрать пост)", callback_data="admin_bc_rich")]
        ])
        await call.message.answer("Выберите формат рекламной рассылки:", reply_markup=kb)
    elif action == "admin_bc_text":
        await call.message.answer("Пришлите сообщение для рассылки (текст, фото, видео или любой другой формат):")
        await state.set_state(AdminState.waiting_for_broadcast_text)
    elif action == "admin_bc_rich":
        await call.message.answer("Вы перешли в режим создания рассылки. Соберите пост в редакторе!")
        await state.update_data(blocks=[], is_broadcast_mode=True, bc_type="rich")
        await show_editor(call.message, state, call.from_user.id)
    else:
        await state.update_data(admin_action=action)
        await call.message.edit_text("Введите **Telegram ID** или **@username** пользователя:", parse_mode="Markdown")
        await state.set_state(AdminState.waiting_for_user_id)

@dp.message(AdminState.waiting_for_channel_add)
async def admin_add_channel(message: Message, state: FSMContext):
    ch = message.text.strip()
    if "t.me/" in ch: ch = "@" + ch.split("t.me/")[-1].split("/")[0]
    elif not ch.startswith("@") and not ch.startswith("-100"): ch = "@" + ch
    
    channels = json.loads(get_setting("force_channels"))
    if ch not in channels: channels.append(ch)
    set_setting("force_channels", json.dumps(channels))
    await message.answer(f"✅ Канал {ch} добавлен в ОП.\n⚠️ **ВАЖНО:** Обязательно добавьте бота @layerPost_bot в этот канал как администратора (хотя бы с минимальными правами), иначе он не сможет проверять подписки!")
    await state.clear()

async def execute_broadcast(bot: Bot, html_content: str = None, text_content: str = None, copy_msg_id: int = None, copy_chat_id: int = None):
    now = int(datetime.datetime.now().timestamp())
    conn = sqlite3.connect("bot_features_database.db")
    c = conn.cursor()
    c.execute("SELECT user_id FROM users WHERE sub_until <= ?", (now,))
    users = c.fetchall()
    conn.close()
    
    count = 0
    await bot.send_message(ADMIN_ID, "⏳ Рассылка началась...")
    for (u_id,) in users:
        try:
            if html_content: await send_rich_message(u_id, html_content)
            elif copy_msg_id and copy_chat_id: await bot.copy_message(chat_id=u_id, from_chat_id=copy_chat_id, message_id=copy_msg_id)
            elif text_content: await bot.send_message(u_id, text_content, parse_mode="HTML")
            count += 1
            await asyncio.sleep(0.05)
        except: pass
    await bot.send_message(ADMIN_ID, f"✅ Рассылка завершена. Доставлено: {count} чел.")

@dp.message(AdminState.waiting_for_broadcast_text)
async def admin_broadcast_text(message: Message, state: FSMContext):
    await state.update_data(bc_msg_id=message.message_id, bc_chat_id=message.chat.id, is_broadcast_mode=True, bc_type="standard")
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Разослать СЕЙЧАС", callback_data="bc_now")],
        [InlineKeyboardButton(text="📅 Запланировать", callback_data="bc_delay")]
    ])
    await message.answer("Что делаем со стандартной рассылкой?", reply_markup=kb)
    await state.set_state(AdminState.waiting_for_bc_time)

@dp.message(AdminState.waiting_for_user_id)
async def admin_process_user_id(message: Message, state: FSMContext):
    if message.from_user.id != ADMIN_ID: return
    
    target_input = message.text.strip()
    target_id = None
    
    conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
    
    if not target_input.isdigit():
        uname = target_input.replace("@", "")
        c.execute("SELECT user_id FROM users WHERE username=? COLLATE NOCASE", (uname,))
        res = c.fetchone()
        if res: target_id = res[0]
    else:
        target_id = int(target_input)
        
    if not target_id:
        conn.close()
        return await message.answer(f"❌ Пользователь `{target_input}` не найден.\n\n⚠️ **Причина:** Скорее всего, этот юзер не нажимал `/start` после обновления бота, поэтому его юзернейм еще не сохранился в базу. Попросите его запустить бота командой `/start` или пришлите его числовой **Telegram ID** (можно узнать через @getmyid_bot).", parse_mode="Markdown")
        
    action = (await state.get_data()).get("admin_action")
    if not action:
        conn.close(); await state.clear()
        return await message.answer("❌ Сессия устарела. Нажмите кнопку в админ-панели еще раз.")
        
    if "grant_vp" in action: 
        c.execute("UPDATE users SET sub_until = 2147483647, vp_owed = 1 WHERE user_id=?", (target_id,))
        try: await bot.send_message(target_id, "🎉 Администратор выдал вам **Премиум Подписку**! Но вам необходимо опубликовать обязательный ВП-пост (кнопка 📢 ВП появится в меню).", parse_mode="Markdown")
        except: pass
    elif "grant_free" in action:
        c.execute("UPDATE users SET sub_until = 2147483647, vp_owed = 0 WHERE user_id=?", (target_id,))
        try: await bot.send_message(target_id, "🎉 Администратор выдал вам **Безлимитную Премиум Подписку** за респект! Никаких обязательных постов, приятного пользования!", parse_mode="Markdown")
        except: pass
    else: 
        c.execute("UPDATE users SET sub_until = 0, vp_owed = 0 WHERE user_id=?", (target_id,))
        try: await bot.send_message(target_id, "❌ Администратор аннулировал вашу подписку.", parse_mode="Markdown")
        except: pass
        
    conn.commit(); conn.close()
    
    await message.answer(f"✅ Выполнено для пользователя `{target_input}` (ID: {target_id})", parse_mode="Markdown")
    await state.clear()

# ----------------- РЕДАКТОР И ПУБЛИКАЦИЯ -----------------
async def show_editor(message: Message, state: FSMContext, user_id: int):
    if not await check_forced_sub(user_id):
        channels = json.loads(get_setting("force_channels"))
        kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="Подписаться", url=f"https://t.me/{c.replace('@','')}")] for c in channels])
        return await bot.send_message(user_id, "⚠️ Для использования бота необходимо подписаться на наши каналы:", reply_markup=kb)

    data = await state.get_data()
    blocks = data.get("blocks", [])
    is_broadcast = data.get("is_broadcast_mode", False)
    is_vp = data.get("is_vp_editor", False)
    
    if is_broadcast: header_text = "📣 РЕЖИМ РЕКЛАМНОЙ РАССЫЛКИ\n\n⚙️ **Редактор поста**"
    elif is_vp: header_text = "📢 СОЗДАНИЕ ВП-ПОСТА\n\n⚙️ **Редактор поста**"
    else: header_text = "⚙️ **Редактор поста**"
    
    if blocks:
        try: await send_rich_message(user_id, render_blocks(blocks))
        except Exception as e: await bot.send_message(user_id, f"❌ Ошибка предпросмотра: {e}")
            
    finish_btn = "🚀 РАЗОСЛАТЬ" if is_broadcast else "✅ ПУБЛИКАЦИЯ"
    kb_lines = [ [InlineKeyboardButton(text="➕ Добавить блок", callback_data="editor_add")] ]
    if blocks:
        kb_lines.append([InlineKeyboardButton(text="⚙️ Управление блоками (Удалить / Переместить)", callback_data="editor_manage")])
        kb_lines.append([InlineKeyboardButton(text="❌ Очистить всё", callback_data="editor_clear")])
    kb_lines.append([InlineKeyboardButton(text=finish_btn, callback_data="editor_finish")])
    kb = InlineKeyboardMarkup(inline_keyboard=kb_lines)
    await bot.send_message(user_id, header_text, reply_markup=kb, parse_mode="Markdown")
    await state.set_state(BuilderState.main_editor)

async def show_manage_menu(message: Message, state: FSMContext):
    data = await state.get_data(); blocks = data.get("blocks", [])
    if not blocks: return await show_editor(message, state, message.chat.id)
    kb_lines = []
    b_names = {"text":"Текст", "photo":"Фото", "video":"Видео", "audio":"Аудио", "collage":"Коллаж", "slideshow":"Карусель", "quote":"Цитата", "list":"Список", "table":"Таблица", "details":"Спойлер", "map":"Карта"}
    for i, b in enumerate(blocks):
        row = []
        if i > 0: row.append(InlineKeyboardButton(text="⬆️", callback_data=f"move_{i}_up"))
        else: row.append(InlineKeyboardButton(text="▪️", callback_data="noop"))
        row.append(InlineKeyboardButton(text=f"{i+1}. {b_names.get(b['type'], b['type'])} ❌", callback_data=f"delblock_{i}"))
        if i < len(blocks) - 1: row.append(InlineKeyboardButton(text="⬇️", callback_data=f"move_{i}_down"))
        else: row.append(InlineKeyboardButton(text="▪️", callback_data="noop"))
        kb_lines.append(row)
    kb_lines.append([InlineKeyboardButton(text="🔙 Назад к предпросмотру", callback_data="editor_back")])
    try: await message.edit_text("⚙️ **Управление блоками**\nВы можете менять блоки местами или удалять их:", reply_markup=InlineKeyboardMarkup(inline_keyboard=kb_lines), parse_mode="Markdown")
    except: pass

@dp.callback_query(F.data == "noop")
async def handle_noop(call: CallbackQuery): await call.answer()

@dp.callback_query(BuilderState.main_editor, F.data.startswith("move_"))
async def handle_move_block(call: CallbackQuery, state: FSMContext):
    await call.answer(); parts = call.data.split("_")
    idx = int(parts[1]); direction = parts[2]
    data = await state.get_data(); blocks = data.get("blocks", [])
    if direction == "up" and idx > 0: blocks[idx], blocks[idx-1] = blocks[idx-1], blocks[idx]
    elif direction == "down" and idx < len(blocks) - 1: blocks[idx], blocks[idx+1] = blocks[idx+1], blocks[idx]
    await state.update_data(blocks=blocks)
    await show_manage_menu(call.message, state)

@dp.callback_query(BuilderState.main_editor, F.data.startswith("delblock_"))
async def handle_delblock(call: CallbackQuery, state: FSMContext):
    await call.answer(); idx = int(call.data.split("_")[1])
    data = await state.get_data(); blocks = data.get("blocks", [])
    if 0 <= idx < len(blocks): blocks.pop(idx); await state.update_data(blocks=blocks)
    await show_manage_menu(call.message, state)

@dp.callback_query(BuilderState.main_editor, F.data.startswith("editor_"))
async def handle_editor_actions(call: CallbackQuery, state: FSMContext):
    await call.answer(); action = call.data.split("_")[1]
    data = await state.get_data()
    
    if action == "add":
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📝 Текст", callback_data="add_text"), InlineKeyboardButton(text="📋 Список", callback_data="add_list")],
            [InlineKeyboardButton(text="💬 Цитата", callback_data="add_quote"), InlineKeyboardButton(text="📊 Таблица", callback_data="add_table")],
            [InlineKeyboardButton(text="📂 Спойлер", callback_data="add_details"), InlineKeyboardButton(text="🗺 Карта", callback_data="add_map")],
            [InlineKeyboardButton(text="📷 Фото", callback_data="add_photo"), InlineKeyboardButton(text="🖼 Коллаж", callback_data="add_collage")],
            [InlineKeyboardButton(text="🎠 Слайдшоу (Карусель)", callback_data="add_slideshow"), InlineKeyboardButton(text="🎬 Видео", callback_data="add_video")],
            [InlineKeyboardButton(text="🎵 Аудио", callback_data="add_audio"), InlineKeyboardButton(text="🔙 Назад", callback_data="add_cancel")]
        ])
        await call.message.edit_text("Какой блок добавить?", reply_markup=kb)
        await state.set_state(BuilderState.choose_block)
    elif action == "manage":
        await show_manage_menu(call.message, state)
    elif action == "back":
        await show_editor(call.message, state, call.from_user.id)
    elif action == "clear":
        await state.update_data(blocks=[])
        await show_editor(call.message, state, call.from_user.id)
    elif action == "finish":
        if not data.get("blocks"): return await call.answer("Пост пуст!", show_alert=True)
        
        if data.get("is_vp_editor"):
            set_setting("vp_post_data", json.dumps(data.get("blocks")))
            await state.update_data(blocks=[], is_vp_editor=False)
            return await call.message.answer("✅ ВП-пост успешно сохранен! Все, кому вы выдадите подписку, должны будут его опубликовать.")
            
        if data.get("is_broadcast_mode"):
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🚀 Разослать СЕЙЧАС", callback_data="bc_now")],
                [InlineKeyboardButton(text="📅 Запланировать рассылку", callback_data="bc_delay")]
            ])
            await call.message.answer("Что делаем с рассылкой?", reply_markup=kb)
            await state.set_state(AdminState.waiting_for_bc_time)
        else:
            user_id = call.from_user.id
            conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
            c.execute("SELECT vp_owed FROM users WHERE user_id=?", (user_id,)); res = c.fetchone()
            vp_owed = res[0] if res else 0; conn.close()
            
            if vp_owed == 2 and not data.get("is_vp_publish"):
                return await call.answer("❌ Вы исчерпали лимит постов! Вам необходимо опубликовать ВП-пост (см. кнопку в меню).", show_alert=True)
                
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🚀 Опубликовать СЕЙЧАС", callback_data="time_now")],
                [InlineKeyboardButton(text="📅 Отложить (Запланировать)", callback_data="time_delay")]
            ])
            await call.message.answer("Что делаем с постом?", reply_markup=kb)
            await state.set_state(BuilderState.waiting_for_time)

@dp.callback_query(AdminState.waiting_for_bc_time, F.data == "bc_now")
async def handle_bc_now(call: CallbackQuery, state: FSMContext):
    await call.answer()
    data = await state.get_data()
    if data.get("bc_type") == "standard": asyncio.create_task(execute_broadcast(bot, copy_msg_id=data["bc_msg_id"], copy_chat_id=data["bc_chat_id"]))
    else: asyncio.create_task(execute_broadcast(bot, html_content=render_blocks(data["blocks"])))
    await state.update_data(blocks=[], is_broadcast_mode=False, bc_type=None)
    await call.message.answer("✅ Рассылка запущена!")
    await show_editor(call.message, state, call.from_user.id)

@dp.callback_query(AdminState.waiting_for_bc_time, F.data == "bc_delay")
async def handle_bc_delay(call: CallbackQuery, state: FSMContext):
    if not has_quota(call.from_user.id): return await call.answer("❌ Нет квот для отложенной рассылки!", show_alert=True)
    await call.answer()
    await call.message.answer("Введите дату и время рассылки (по вашему поясу).\nФорматы: `15:30`, `31.12 15:30` или `31.12.2025 15:30`:", parse_mode="Markdown")
    await state.set_state(AdminState.waiting_for_bc_time_input)

@dp.message(AdminState.waiting_for_bc_time_input)
async def handle_bc_time_input(message: Message, state: FSMContext):
    user_id = message.from_user.id
    if not consume_quota(user_id): return await message.answer("❌ Для отложенного постинга необходимы квоты!")
    try:
        conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
        c.execute("SELECT tz_offset FROM users WHERE user_id=?", (user_id,))
        user_tz = c.fetchone()[0]
        
        now_utc = datetime.datetime.utcnow(); user_now = now_utc + datetime.timedelta(hours=user_tz)
        target_dt = parse_date_time(message.text, user_now)
        send_at_utc = int((target_dt - datetime.timedelta(hours=user_tz)).timestamp())
        
        data = await state.get_data()
        if data.get("bc_type") == "standard":
            j_content = json.dumps({"type": "standard", "msg_id": data["bc_msg_id"], "chat_id": data["bc_chat_id"]})
            c.execute("INSERT INTO scheduled_posts (chat_id, owner_id, html_content, send_at) VALUES (0, ?, ?, ?)", (user_id, j_content, send_at_utc))
        else:
            html_content = render_blocks(data["blocks"])
            c.execute("INSERT INTO scheduled_posts (chat_id, owner_id, html_content, send_at) VALUES (0, ?, ?, ?)", (user_id, html_content, send_at_utc))
        conn.commit(); conn.close()
        
        await message.answer(f"✅ Рассылка запланирована на {target_dt.strftime('%d.%m.%Y %H:%M')} (ваше время).")
        await state.update_data(blocks=[], is_broadcast_mode=False, bc_type=None)
        await show_editor(message, state, user_id)
    except ValueError: await message.answer("❌ Неверный формат времени. Примеры: 15:30, 31.12 15:30")

@dp.callback_query(F.data == "cancel_block")
async def cancel_block_handler(call: CallbackQuery, state: FSMContext):
    await call.answer()
    await show_editor(call.message, state, call.from_user.id)

@dp.callback_query(BuilderState.choose_block, F.data.startswith("add_"))
async def handle_add_block(call: CallbackQuery, state: FSMContext):
    await call.answer(); btype = call.data.split("_")[1]; await call.message.delete()
    cancel_kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_block")]])
    if btype == "cancel": await show_editor(call.message, state, call.from_user.id)
    elif btype == "text": await call.message.answer("Текст:", reply_markup=cancel_kb); await state.set_state(BuilderState.add_text)
    elif btype == "list": await call.message.answer("Какой список?", reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="Маркированный", callback_data="lst_ul")], [InlineKeyboardButton(text="Нумерованный", callback_data="lst_ol")], [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_block")]])); await state.set_state(BuilderState.add_list_style)
    elif btype == "quote": await call.message.answer("Стиль?", reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="Обычная", callback_data="qt_blockquote")], [InlineKeyboardButton(text="По центру", callback_data="qt_aside")], [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_block")]])); await state.set_state(BuilderState.add_quote_style)
    elif btype == "table": await call.message.answer("Размеры (строки столбцы): `2 3`", reply_markup=cancel_kb, parse_mode="Markdown"); await state.set_state(BuilderState.add_table_dims)
    elif btype == "details": await call.message.answer("Заголовок спойлера:", reply_markup=cancel_kb); await state.set_state(BuilderState.add_details_summary)
    elif btype == "map": await call.message.answer("Широта и Долгота: `55.75 37.61`", reply_markup=cancel_kb, parse_mode="Markdown"); await state.set_state(BuilderState.add_map)
    elif btype == "photo": await call.message.answer("Фото (Максимум 5 МБ):", reply_markup=cancel_kb); await state.set_state(BuilderState.add_photo)
    elif btype == "collage": await call.message.answer("Отправьте альбомом от 2 до 10 фото (для Коллажа):", reply_markup=cancel_kb); await state.set_state(BuilderState.add_collage)
    elif btype == "slideshow": await call.message.answer("Отправьте альбомом от 2 до 10 фото (для Карусели/Слайдшоу):", reply_markup=cancel_kb); await state.set_state(BuilderState.add_slideshow)
    elif btype == "video": await call.message.answer("Видео mp4 (Максимум 20 МБ):", reply_markup=cancel_kb); await state.set_state(BuilderState.add_video)
    elif btype == "audio": await call.message.answer("Аудио:", reply_markup=cancel_kb); await state.set_state(BuilderState.add_audio)

@dp.message(BuilderState.add_text)
async def h_text(m: Message, state: FSMContext):
    d = await state.get_data(); b = d.get("blocks", []); b.append({"type": "text", "content": m.html_text})
    await state.update_data(blocks=b); await show_editor(m, state, m.from_user.id)

@dp.callback_query(BuilderState.add_list_style)
async def h_list_st(c: CallbackQuery, state: FSMContext):
    await c.answer(); await state.update_data(tmp_list_style=c.data.split("_")[1], tmp_list_items=[])
    await state.set_state(BuilderState.add_list_item)
    await c.message.delete()
    kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="❌ Отменить список", callback_data="list_cancel")]])
    await bot.send_message(c.from_user.id, "✍️ Отправьте текст для **первого пункта** списка:", parse_mode="Markdown", reply_markup=kb)

async def show_list_menu(m: Message, state: FSMContext, user_id: int):
    d = await state.get_data(); items = d.get("tmp_list_items", []); style = d.get("tmp_list_style", "ul")
    
    if not items:
        kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="❌ Отменить список", callback_data="list_cancel")]])
        return await bot.send_message(user_id, "✍️ Отправьте текст для **первого пункта** списка:", parse_mode="Markdown", reply_markup=kb)
        
    tag = 'ul' if style == 'ul' else 'ol'
    lst_html = f"<{tag}>"
    for it in items:
        lst_html += f"<li>{it['text']}"
        if it.get('subitems'):
            lst_html += f"<{tag}>"
            for sub in it['subitems']: lst_html += f"<li>{sub}</li>"
            lst_html += f"</{tag}>"
        lst_html += "</li>"
    lst_html += f"</{tag}>"
    
    try: await send_rich_message(user_id, f"<b>📋 Текущий вид списка:</b><br><br>{lst_html}")
    except Exception as e: await bot.send_message(user_id, f"❌ Ошибка предпросмотра: {e}")
    
    current_state = await state.get_state()
    is_sub_mode = (current_state == BuilderState.add_list_subitem.state)
    
    kb_layout = []
    if is_sub_mode: kb_layout.append([InlineKeyboardButton(text="🔙 Вернуться к главным пунктам", callback_data="list_main_mode")])
    else: kb_layout.append([InlineKeyboardButton(text="↳ Писать подпункты", callback_data="list_sub_mode")])
        
    kb_layout.append([InlineKeyboardButton(text="✅ Завершить список", callback_data="list_finish")])
    kb_layout.append([InlineKeyboardButton(text="❌ Отмена", callback_data="list_cancel")])
    
    mode_text = "ПОДПУНКТЫ" if is_sub_mode else "ГЛАВНЫЕ ПУНКТЫ"
    prompt = "отправьте текст для подпункта" if is_sub_mode else "отправьте текст для главного пункта"
    text = f"⚙️ **Режим:** {mode_text}\n👇 *{prompt.capitalize()} следующим сообщением.*"
    await bot.send_message(user_id, text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(inline_keyboard=kb_layout))

@dp.callback_query(F.data == "list_main_mode")
async def h_list_main_mode(c: CallbackQuery, state: FSMContext):
    await c.answer(); await state.set_state(BuilderState.add_list_item)
    await c.message.delete(); await show_list_menu(c.message, state, c.from_user.id)

@dp.callback_query(F.data == "list_sub_mode")
async def h_list_sub_mode(c: CallbackQuery, state: FSMContext):
    await c.answer(); await state.set_state(BuilderState.add_list_subitem)
    await c.message.delete(); await show_list_menu(c.message, state, c.from_user.id)

@dp.message(BuilderState.add_list_item)
async def h_list_item_text(m: Message, state: FSMContext):
    d = await state.get_data(); items = d.get("tmp_list_items", [])
    items.append({"text": m.html_text, "subitems": []}); await state.update_data(tmp_list_items=items)
    await show_list_menu(m, state, m.from_user.id)

@dp.message(BuilderState.add_list_subitem)
async def h_list_subitem_text(m: Message, state: FSMContext):
    d = await state.get_data(); items = d.get("tmp_list_items", [])
    if items: items[-1]["subitems"].append(m.html_text)
    await state.update_data(tmp_list_items=items)
    await show_list_menu(m, state, m.from_user.id)

@dp.callback_query(F.data == "list_finish")
async def h_list_finish(c: CallbackQuery, state: FSMContext):
    await c.answer(); d = await state.get_data(); b = d.get("blocks", [])
    b.append({"type": "list", "style": d["tmp_list_style"], "items": d["tmp_list_items"]})
    await state.update_data(blocks=b); await c.message.delete(); await bot.send_message(c.from_user.id, "✅ Список добавлен!")
    await show_editor(c.message, state, c.from_user.id)

@dp.callback_query(F.data == "list_cancel")
async def h_list_cancel(c: CallbackQuery, state: FSMContext):
    await c.answer(); await c.message.delete(); await bot.send_message(c.from_user.id, "❌ Создание списка отменено.")
    await show_editor(c.message, state, c.from_user.id)

@dp.callback_query(BuilderState.add_quote_style)
async def h_qt_st(c: CallbackQuery, state: FSMContext):
    await c.answer(); await state.update_data(tmp_qt=c.data.split("_")[1]); await c.message.edit_text("Текст цитаты:"); await state.set_state(BuilderState.add_quote_text)

@dp.message(BuilderState.add_quote_text)
async def h_qt_tx(m: Message, state: FSMContext):
    d = await state.get_data(); b = d.get("blocks", []); b.append({"type": "quote", "style": d["tmp_qt"], "content": m.html_text})
    await state.update_data(blocks=b); await show_editor(m, state, m.from_user.id)

@dp.message(BuilderState.add_details_summary)
async def h_det_sum(m: Message, state: FSMContext):
    await state.update_data(tmp_det=m.text); await m.answer("Текст:"); await state.set_state(BuilderState.add_details_content)

@dp.message(BuilderState.add_details_content)
async def h_det_tx(m: Message, state: FSMContext):
    d = await state.get_data(); b = d.get("blocks", []); b.append({"type": "details", "summary": d["tmp_det"], "content": m.html_text})
    await state.update_data(blocks=b); await show_editor(m, state, m.from_user.id)

@dp.message(BuilderState.add_map)
async def h_map(m: Message, state: FSMContext):
    try:
        lat, lon = m.text.split(); d = await state.get_data(); b = d.get("blocks", [])
        b.append({"type": "map", "lat": lat, "lon": lon}); await state.update_data(blocks=b)
        await show_editor(m, state, m.from_user.id)
    except: await m.answer("Формат: `ШИРОТА ДОЛГОТА`", parse_mode="Markdown")

@dp.message(BuilderState.add_photo, F.photo)
async def h_photo(m: Message, state: FSMContext):
    u = await upload_file(bot, m.photo[-1].file_id); d = await state.get_data(); b = d.get("blocks", [])
    b.append({"type": "photo", "url": u}); await state.update_data(blocks=b); await show_editor(m, state, m.from_user.id)

@dp.message(BuilderState.add_collage, F.media_group_id)
async def h_collage(message: Message, album: List[Message], state: FSMContext):
    msg = await message.answer("⏳ Гружу альбом (коллаж)...")
    async def p_photo(m: Message): return await upload_file(bot, m.photo[-1].file_id) if m.photo else None
    urls = [u for u in await asyncio.gather(*(p_photo(m) for m in album)) if u]
    d = await state.get_data(); b = d.get("blocks", []); b.append({"type": "collage", "urls": urls})
    await state.update_data(blocks=b); await msg.delete(); await show_editor(message, state, message.from_user.id)

@dp.message(BuilderState.add_slideshow, F.media_group_id)
async def h_slideshow(message: Message, album: List[Message], state: FSMContext):
    msg = await message.answer("⏳ Гружу карусель (слайдшоу)...")
    async def p_photo(m: Message): return await upload_file(bot, m.photo[-1].file_id) if m.photo else None
    urls = [u for u in await asyncio.gather(*(p_photo(m) for m in album)) if u]
    d = await state.get_data(); b = d.get("blocks", []); b.append({"type": "slideshow", "urls": urls})
    await state.update_data(blocks=b); await msg.delete(); await show_editor(message, state, message.from_user.id)

@dp.message(BuilderState.add_video, F.video)
async def h_video(m: Message, state: FSMContext):
    if m.video.file_size > 20*1024*1024: return await m.answer("❌ Больше 20 МБ нельзя.")
    msg = await m.answer("⏳ Гружу...")
    u = await save_media_locally(bot, m.video.file_id, "mp4"); d = await state.get_data(); b = d.get("blocks", [])
    b.append({"type": "video", "url": u}); await state.update_data(blocks=b); await msg.delete(); await show_editor(m, state, m.from_user.id)

@dp.message(BuilderState.add_audio, F.audio | F.voice)
async def h_audio(m: Message, state: FSMContext):
    file_id = m.audio.file_id if m.audio else m.voice.file_id; ext = "mp3" if m.audio else "ogg"
    msg = await m.answer("⏳ Гружу...")
    u = await save_media_locally(bot, file_id, ext); d = await state.get_data(); b = d.get("blocks", [])
    b.append({"type": "audio", "url": u}); await state.update_data(blocks=b); await msg.delete(); await show_editor(m, state, m.from_user.id)

@dp.message(BuilderState.add_table_dims)
async def h_table_dims(m: Message, state: FSMContext):
    try:
        r, c = map(int, m.text.split())
        await state.update_data(tmp_r=r, tmp_c=c, tmp_d=[["" for _ in range(c)] for _ in range(r)], tmp_cr=0, tmp_cc=0)
        await _ask_cell(m, state, m.from_user.id)
    except: 
        await m.answer("❌ Неверный формат. Пожалуйста, введите два числа через пробел: Строки Столбцы (например, 2 3)")

async def _ask_cell(m: Message, state: FSMContext, user_id: int):
    d = await state.get_data()
    r = d["tmp_cr"]; c = d["tmp_cc"]; rows = d["tmp_r"]; cols = d["tmp_c"]; t_d = d["tmp_d"]
    
    if r >= rows:
        b = d.get("blocks", []); b.append({"type": "table", "rows": rows, "cols": cols, "data": t_d})
        await state.update_data(blocks=b)
        await bot.send_message(user_id, "✅ Таблица успешно создана и добавлена в пост!")
        await show_editor(m, state, user_id)
    else:
        if r > 0 or c > 0:
            t_html = '<table border="1">'
            for row_idx in range(rows):
                t_html += "<tr>"
                for col_idx in range(cols):
                    val = t_d[row_idx][col_idx]
                    if val == "":
                        if row_idx == r and col_idx == c: val = "✍️"
                        else: val = "&nbsp;"
                    
                    if row_idx == 0: t_html += f"<th>{val}</th>"
                    else: t_html += f"<td>{val}</td>"
                t_html += "</tr>"
            t_html += "</table>"
            
            try: await send_rich_message(user_id, f"<b>📊 Текущий вид таблицы:</b><br><br>{t_html}")
            except Exception as e: await bot.send_message(user_id, f"❌ Ошибка предпросмотра: {e}")
        
        if r == 0: prompt = f"✍️ Введите **ЗАГОЛОВОК** для колонки {c+1} (строка 1):"
        else: prompt = f"✍️ Введите **ТЕКСТ** для ячейки ({r+1} строка, {c+1} колонка):"
        
        kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="❌ Отменить таблицу", callback_data="table_cancel")]])
        await bot.send_message(user_id, prompt, parse_mode="Markdown", reply_markup=kb)
        await state.set_state(BuilderState.add_table_cell)

@dp.callback_query(BuilderState.add_table_cell, F.data == "table_cancel")
async def h_table_cancel(c: CallbackQuery, state: FSMContext):
    await c.answer(); await c.message.delete()
    await bot.send_message(c.from_user.id, "❌ Создание таблицы отменено.")
    await show_editor(c.message, state, c.from_user.id)

@dp.message(BuilderState.add_table_cell)
async def h_table_cell(m: Message, state: FSMContext):
    d = await state.get_data()
    r = d["tmp_cr"]; c = d["tmp_cc"]; cols = d["tmp_c"]; t_d = d["tmp_d"]
    
    t_d[r][c] = m.html_text
    c += 1
    if c >= cols:
        c = 0
        r += 1
        
    await state.update_data(tmp_d=t_d, tmp_cr=r, tmp_cc=c)
    await _ask_cell(m, state, m.from_user.id)

@dp.callback_query(BuilderState.waiting_for_time, F.data == "time_now")
async def handle_time_now(call: CallbackQuery, state: FSMContext):
    user_id = call.from_user.id
    conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
    c.execute("SELECT chat_id, chat_title FROM channels WHERE owner_id=?", (user_id,))
    channels = c.fetchall(); conn.close()
    
    if not channels: return await call.message.answer("⚠️ Вы не привязали ни одного канала! Добавьте бота в администраторы своего канала (выдайте права на публикацию), и канал появится здесь автоматически.")
        
    kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=f"📢 {t}", callback_data=f"pnow_{cid}")] for cid, t in channels] + [[InlineKeyboardButton(text="❌ Отмена", callback_data="add_cancel")]])
    await call.message.edit_text("Выберите канал для публикации СЕЙЧАС:", reply_markup=kb)

@dp.callback_query(BuilderState.waiting_for_time, F.data.startswith("pnow_"))
async def handle_pubnow_channel(call: CallbackQuery, state: FSMContext):
    await call.answer(); channel_id = int(call.data.split("_")[1]); user_id = call.from_user.id
    data = await state.get_data(); html_content = render_blocks(data["blocks"])
    if not consume_quota(user_id): html_content = add_watermarks(html_content)
    
    await call.message.edit_text("⏳ Публикация...")
    try: 
        await send_rich_message(channel_id, html_content)
        
        conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
        c.execute("SELECT vp_owed FROM users WHERE user_id=?", (user_id,)); res = c.fetchone()
        vp_owed = res[0] if res else 0
        if data.get("is_vp_publish"):
            c.execute("UPDATE users SET vp_owed=0 WHERE user_id=?", (user_id,))
            await call.message.answer("✅ ВП-пост успешно опубликован! Ограничения сняты.", reply_markup=get_main_keyboard(user_id))
        elif vp_owed == 1:
            c.execute("UPDATE users SET vp_owed=2 WHERE user_id=?", (user_id,))
            await call.message.answer("⚠️ Вы опубликовали свой пост, но у вас есть долг! Ваш следующий пост заблокирован до публикации ВП-поста (📢 ВП).", reply_markup=get_main_keyboard(user_id))
        else:
            await call.message.answer("✅ Успешно опубликовано в канал!")
            
        c.execute("UPDATE settings SET value = CAST((CAST(value AS INTEGER) + 1) AS TEXT) WHERE key='total_posts_published'")
        conn.commit(); conn.close()
        
        await state.update_data(blocks=[], is_vp_publish=False)
    except Exception as e: await call.message.answer(f"❌ Ошибка публикации (проверьте права бота): {e}")
    await show_editor(call.message, state, user_id)

@dp.callback_query(BuilderState.waiting_for_time, F.data == "time_delay")
async def handle_time_delay(call: CallbackQuery, state: FSMContext):
    user_id = call.from_user.id
    if not has_quota(user_id): return await call.answer("❌ Для отложенного постинга необходимы бесплатные посты или подписка! Приобретите их в меню.", show_alert=True)
    
    conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
    c.execute("SELECT chat_id, chat_title FROM channels WHERE owner_id=?", (user_id,))
    channels = c.fetchall(); conn.close()
    
    if not channels: return await call.message.answer("⚠️ Вы не привязали ни одного канала! Добавьте бота в администраторы своего канала.")
        
    kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=f"📢 {t}", callback_data=f"pdelay_{cid}")] for cid, t in channels] + [[InlineKeyboardButton(text="❌ Отмена", callback_data="add_cancel")]])
    await call.message.edit_text("Выберите канал для ОТЛОЖЕННОЙ публикации:", reply_markup=kb)

@dp.callback_query(BuilderState.waiting_for_time, F.data.startswith("pdelay_"))
async def handle_pubdelay_channel(call: CallbackQuery, state: FSMContext):
    await call.answer(); await state.update_data(target_channel=int(call.data.split("_")[1]))
    await call.message.edit_text("Введите дату и время публикации (по вашему поясу).\nФорматы: `15:30`, `31.12 15:30` или `31.12.2025 15:30`:", parse_mode="Markdown")
    await state.set_state(BuilderState.waiting_for_time_input)

@dp.message(BuilderState.waiting_for_time_input)
async def handle_delay_input(message: Message, state: FSMContext):
    user_id = message.from_user.id
    if not consume_quota(user_id):
        return await message.answer("❌ Для отложенного постинга необходимы квоты или подписка! Приобретите их в меню.")
        
    try:
        data = await state.get_data(); target_channel = data.get("target_channel")
        conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
        c.execute("SELECT tz_offset FROM users WHERE user_id=?", (user_id,))
        user_tz = c.fetchone()[0]
        
        now_utc = datetime.datetime.utcnow(); user_now = now_utc + datetime.timedelta(hours=user_tz)
        target_dt = parse_date_time(message.text, user_now)
        send_at_utc = int((target_dt - datetime.timedelta(hours=user_tz)).timestamp())
        
        html_content = render_blocks(data["blocks"])
        if not consume_quota(user_id): html_content = add_watermarks(html_content)
        
        is_vp = 1 if data.get("is_vp_publish") else 0
        c.execute("INSERT INTO scheduled_posts (chat_id, owner_id, html_content, send_at, is_vp) VALUES (?, ?, ?, ?, ?)", (target_channel, user_id, html_content, send_at_utc, is_vp))
        
        c.execute("SELECT vp_owed FROM users WHERE user_id=?", (user_id,)); res = c.fetchone()
        vp_owed = res[0] if res else 0
        if is_vp == 1:
            c.execute("UPDATE users SET vp_owed=0 WHERE user_id=?", (user_id,))
            await message.answer(f"✅ ВП-пост запланирован на {target_dt.strftime('%d.%m.%Y %H:%M')}! Ограничения сняты (если отмените, вас снова заблокирует).", reply_markup=get_main_keyboard(user_id))
        elif vp_owed == 1:
            c.execute("UPDATE users SET vp_owed=2 WHERE user_id=?", (user_id,))
            await message.answer(f"✅ Пост запланирован на {target_dt.strftime('%d.%m.%Y %H:%M')}.\n⚠️ Вы исчерпали лимит. Ваши дальнейшие публикации заблокированы до отложенного или моментального постинга ВП-поста (📢 ВП).", reply_markup=get_main_keyboard(user_id))
        else:
            await message.answer(f"✅ Пост запланирован на {target_dt.strftime('%d.%m.%Y %H:%M')} (ваше время).")
            
        conn.commit(); conn.close()
        await state.update_data(blocks=[], is_vp_publish=False)
        await show_editor(message, state, user_id)
    except ValueError: await message.answer("❌ Неверный формат времени. Примеры: 15:30, 31.12 15:30")

async def scheduler():
    while True:
        try:
            now_utc = int(datetime.datetime.utcnow().timestamp())
            conn = sqlite3.connect("bot_features_database.db"); c = conn.cursor()
            c.execute("SELECT id, chat_id, html_content, owner_id FROM scheduled_posts WHERE send_at <= ?", (now_utc,))
            posts = c.fetchall()
            
            for pid, cid, content, oid in posts:
                if str(cid) == "0":
                    if content.startswith('{"type": "standard"'):
                        j = json.loads(content)
                        asyncio.create_task(execute_broadcast(bot, copy_msg_id=j["msg_id"], copy_chat_id=j["chat_id"]))
                    else:
                        asyncio.create_task(execute_broadcast(bot, html_content=content))
                    try: await bot.send_message(oid, f"✅ Отложенная рассылка успешно запущена!")
                    except: pass
                else:
                    try: 
                        await send_rich_message(cid, content)
                        c.execute("UPDATE settings SET value = CAST((CAST(value AS INTEGER) + 1) AS TEXT) WHERE key='total_posts_published'")
                        try: await bot.send_message(oid, f"✅ Отложенный пост успешно опубликован в канал!")
                        except: pass
                    except Exception as e:
                        try: await bot.send_message(oid, f"❌ Ошибка публикации отложенного поста: {e}")
                        except: pass
                c.execute("DELETE FROM scheduled_posts WHERE id=?", (pid,))
            conn.commit(); conn.close()
        except Exception as e: print("Scheduler error:", e)
        await asyncio.sleep(30)

async def web_server():
    import os; import ssl
    os.makedirs("media", exist_ok=True)
    app = web.Application(); app.router.add_static('/media/', path='./media', name='media')
    runner = web.AppRunner(app); await runner.setup()
    
    ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    try:
        ssl_context.load_cert_chain('/etc/letsencrypt/live/83.147.192.61.nip.io/fullchain.pem', '/etc/letsencrypt/live/83.147.192.61.nip.io/privkey.pem')
        site = web.TCPSite(runner, '0.0.0.0', 443, ssl_context=ssl_context)
    except Exception as e:
        print("Failed to load SSL, falling back to 8080:", e)
        site = web.TCPSite(runner, '0.0.0.0', 8080)
        
    await site.start()

from aiogram.filters import StateFilter

async def main():
    await bot.delete_my_commands()
    asyncio.create_task(web_server())
    asyncio.create_task(scheduler())
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
