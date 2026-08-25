import os
import asyncio
import logging
import random
import aiohttp
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, Update, InlineQuery
from aiogram.types import InlineQueryResultArticle, InputTextMessageContent
from aiogram.filters import CommandStart, Command

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
logging.basicConfig(level=logging.INFO)

active_games = {}
user_game = {} 

SPYFALL_LOCATIONS = ["Пиратский корабль", "Орбитальная станция", "Подводная лодка", "Театр", "Посольство", "Больница"]
BUNKER_TRAITS = {
    "professions": ["Сантехник", "Хирург", "Программист", "Учитель", "Полицейский", "Повар"],
    "health": ["Астма", "Абсолютно здоров", "Близорукость", "Аллергия на пыль", "Железное здоровье"],
    "hobbies": ["Вышивание", "Стрельба из лука", "Шахматы", "Бег", "Сборка ПК", "Садоводство"],
    "inventory": ["Фонарик", "Аптечка", "Нож", "Запас воды", "Гитара", "Веревка"]
}
QUIPLASH_PROMPTS = ["Худшее название для детской игрушки:", "Что не стоит говорить на первом свидании:"]

# --- ГОСТЕВОЙ И ИНЛАЙН РЕЖИМ ---
@dp.update(F.guest_message)
async def handle_guest_message(update: Update):
    guest_msg = update.guest_message
    await bot.answer_guest_query(
        guest_query_id=guest_msg.guest_query_id,
        text="🎮 **Telegram Party Box!**\nСбор игроков:",
        reply_markup=get_lobby_keyboard(), parse_mode="Markdown"
    )
    active_games[guest_msg.chat.id] = {"status": "lobby", "players": {}, "game": None, "state": {}}

@dp.inline_query()
async def inline_lobby(inline_query: InlineQuery):
    results = [InlineQueryResultArticle(id="lobby", title="🎮 Общее Лобби", description="Собрать игроков", input_message_content=InputTextMessageContent(message_text="🎮 **Telegram Party Box!**\nСбор игроков:", parse_mode="Markdown"), reply_markup=get_lobby_keyboard())]
    games = {"spyfall": "🕵️‍♂️ Шпион", "bunker": "☢️ Бункер", "mafia": "🔫 Мафия", "quiplash": "🎭 Смехлыст"}
    for g_id, title in games.items():
        kb = InlineKeyboardMarkup(inline_keyboard=[[[InlineKeyboardButton(text="➕ Я играю / Выйти", callback_data="lobby_join")], [InlineKeyboardButton(text="🚀 Начать игру", callback_data=f"game_{g_id}")]]])
        results.append(InlineQueryResultArticle(id=f"quick_{g_id}", title=title, description=f"Быстрый старт: {title}", input_message_content=InputTextMessageContent(message_text=f"Сбор игроков на **{title}**:", parse_mode="Markdown"), reply_markup=kb))
    await inline_query.answer(results=results, cache_time=1)

def get_lobby_keyboard(can_start=False):
    return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="➕ Я играю / Выйти", callback_data="lobby_join")], [InlineKeyboardButton(text="🚀 Начать игру", callback_data="lobby_start")] if can_start else [], [InlineKeyboardButton(text="❌ Отменить", callback_data="lobby_cancel")]])

@dp.message(CommandStart())
@dp.message(Command("play"))
async def cmd_play(message: Message):
    active_games[message.chat.id] = {"status": "lobby", "players": {}, "game": None, "state": {}}
    await message.answer("🎮 **Telegram Party Box!**\nСбор игроков:", reply_markup=get_lobby_keyboard(), parse_mode="Markdown")

async def update_game_msg(gid, text: str, reply_markup=None):
    g = active_games.get(gid)
    if not g: return
    try:
        if isinstance(gid, int) and "msg_id" in g: await bot.edit_message_text(text=text, chat_id=gid, message_id=g["msg_id"], reply_markup=reply_markup, parse_mode="Markdown")
        else: await bot.edit_message_text(text=text, inline_message_id=gid, reply_markup=reply_markup, parse_mode="Markdown")
    except Exception as e: print("Ошибка обновления сообщения:", e)

async def send_secret(uid: int, text: str, kb=None, chat_id=None):
    try:
        if chat_id and isinstance(chat_id, int):
            payload = {"chat_id": chat_id, "text": text, "receiver_user_id": uid, "parse_mode": "Markdown"}
            if kb: payload["reply_markup"] = kb.model_dump(exclude_none=True)
            async with aiohttp.ClientSession() as session:
                async with session.post(f"https://api.telegram.org/bot{bot.token}/sendMessage", json=payload): pass
        else:
            await bot.send_message(chat_id=uid, text="*Секретно:*\n" + text, reply_markup=kb, parse_mode="Markdown")
    except Exception as e: print(f"Не удалось отправить роль {uid}: {e}")

@dp.callback_query(F.data.startswith("lobby_"))
async def handle_lobby(call: CallbackQuery):
    gid = call.message.chat.id if call.message else call.inline_message_id
    action = call.data.split("_")[1]
    if gid not in active_games: active_games[gid] = {"status": "lobby", "players": {}, "game": None, "state": {}}
    g = active_games[gid]
    if call.message: g["msg_id"] = call.message.message_id
    uid = call.from_user.id
    if action == "join":
        if uid in g["players"]: del g["players"][uid]
        else: g["players"][uid] = call.from_user.first_name
        user_game[uid] = gid
        plist = "\n".join([f"👤 {n}" for n in g["players"].values()]) or "Пока пусто..."
        await update_game_msg(gid, f"🎮 **Сбор игроков:**\n\n{plist}", get_lobby_keyboard(can_start=len(g["players"]) >= 2))
    elif action == "cancel":
        del active_games[gid]
        await update_game_msg(gid, "🛑 Сбор отменен.")
    elif action == "start":
        kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🕵️‍♂️ Шпион", callback_data="game_spyfall"), InlineKeyboardButton(text="☢️ Бункер", callback_data="game_bunker")], [InlineKeyboardButton(text="🔫 Мафия", callback_data="game_mafia"), InlineKeyboardButton(text="🎭 Смехлыст", callback_data="game_quiplash")]])
        await update_game_msg(gid, "🔥 **Игроки собраны!** Выберите игру:", kb)

@dp.callback_query(F.data.startswith("game_"))
async def start_game(call: CallbackQuery):
    gid = call.message.chat.id if call.message else call.inline_message_id
    chat_id = gid if isinstance(gid, int) else None
    g = active_games.get(gid)
    if not g: return
    game = call.data.split("_")[1]
    g["status"] = "playing"
    g["game"] = game
    players = list(g["players"].keys())
    
    if game == "spyfall":
        location = random.choice(SPYFALL_LOCATIONS)
        spy_id = random.choice(players)
        g["state"] = {"spy": spy_id, "loc": location, "votes": {}, "voting": False, "finished": False}
        for uid in players:
            text = "🕵️‍♂️ **Вы — ШПИОН!**" if uid == spy_id else f"📍 **Локация:** {location}"
            await send_secret(uid, text, chat_id=chat_id)
        
        # Убрана кнопка ручного голосования. Запускается таймер на 3 минуты.
        await update_game_msg(gid, "🕵️‍♂️ **Шпион запущен!**\nРоли отправлены в ЛС.\nУ вас есть **3 минуты** на обсуждение и вопросы по кругу.\n\n⏳ Время пошло...")
        asyncio.create_task(spyfall_timer(gid))

    elif game == "bunker":
        for uid in players:
            g["state"][uid] = {"prof": random.choice(BUNKER_TRAITS["professions"]), "hp": random.choice(BUNKER_TRAITS["health"]), "hob": random.choice(BUNKER_TRAITS["hobbies"]), "inv": random.choice(BUNKER_TRAITS["inventory"]), "revealed": []}
            text = f"☢️ **Ваша карта:**\nПрофессия: {g['state'][uid]['prof']}\nЗдоровье: {g['state'][uid]['hp']}\nХобби: {g['state'][uid]['hob']}\nРюкзак: {g['state'][uid]['inv']}"
            await send_secret(uid, text, chat_id=chat_id)
        g["state"]["turn_idx"] = 0
        g["state"]["order"] = players.copy()
        g["state"]["log"] = ""
        await send_bunker_turn(gid)

    elif game == "mafia":
        mafia_count = max(1, len(players) // 4)
        mafias = random.sample(players, mafia_count)
        g["state"] = {"mafias": mafias, "night": True, "alive": players.copy()}
        for uid in players:
            if uid in mafias:
                text = "🔫 **Вы — МАФИЯ!**\nЖмите кнопку ниже, чтобы выбрать жертву!"
                victims = [[InlineKeyboardButton(text=g["players"][p], callback_data=f"mafiakill_{p}")] for p in players if p not in mafias]
                kb = InlineKeyboardMarkup(inline_keyboard=victims)
            else:
                text = "👨‍🌾 **Вы — Мирный житель!**"
                kb = None
            await send_secret(uid, text, kb, chat_id=chat_id)
        await update_game_msg(gid, "🌙 **Город засыпает...**\nМафия делает выбор.\n*(Внимание: бот не может запретить вам писать в чат, пожалуйста, соблюдайте тишину ночью честно!)*")
    
    elif game == "quiplash":
        # Смехлыст пока остался как был (рация/ЛС)
        pass

# --- ШПИОН ЛОГИКА (ТАЙМЕР И ГОЛОСОВАНИЕ) ---
async def tally_spyfall_votes(gid):
    g = active_games.get(gid)
    if not g or g["state"].get("finished"): return
    g["state"]["finished"] = True
    
    votes = g["state"]["votes"]
    if not votes: return await update_game_msg(gid, "💀 **Никто не проголосовал!** Шпион побеждает из-за вашей нерешительности.")
        
    counts = {}
    for target in votes.values(): counts[target] = counts.get(target, 0) + 1
    max_v = max(counts.values())
    accused_list = [t for t, c in counts.items() if c == max_v]
    
    if len(accused_list) > 1:
        await update_game_msg(gid, "💀 **Ничья в голосовании!** Мирные не смогли договориться. Шпион побеждает!")
    else:
        accused = accused_list[0]
        if accused == g["state"]["spy"]:
            await update_game_msg(gid, f"🎉 **Мирные победили!**\nБольшинством голосов выкинули {g['players'][accused]}, и он действительно был шпионом!")
        else:
            await update_game_msg(gid, f"💀 **Победа шпиона!**\nВы выкинули {g['players'][accused]}, но он обычный человек!\nНастоящий шпион: {g['players'][g['state']['spy']]}")

async def spyfall_timer(gid):
    await asyncio.sleep(180)  # 3 минуты на обсуждение
    g = active_games.get(gid)
    if not g or g.get("status") != "playing" or g["state"].get("finished"): return
    
    g["state"]["voting"] = True
    kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=name, callback_data=f"spyaccuse_{uid}")] for uid, name in g["players"].items()])
    await update_game_msg(gid, "🚨 **Время обсуждения вышло!**\nГолосование началось. У вас 1 минута, чтобы нажать на подозреваемого!", kb)
    
    await asyncio.sleep(60)  # 1 минута на голосование
    await tally_spyfall_votes(gid)

@dp.callback_query(F.data.startswith("spyaccuse_"))
async def spy_accuse(call: CallbackQuery):
    gid = user_game.get(call.from_user.id)
    g = active_games.get(gid)
    if not g or g["state"].get("finished") or not g["state"].get("voting"): return await call.answer("Голосование закрыто!", show_alert=True)
    
    target = int(call.data.split("_")[1])
    g["state"]["votes"][call.from_user.id] = target
    await call.answer("Голос принят!")
    
    # Если проголосовали все
    if len(g["state"]["votes"]) >= len(g["players"]):
        await tally_spyfall_votes(gid)

# --- БУНКЕР ЛОГИКА ---
async def send_bunker_turn(gid):
    g = active_games[gid]
    turn_uid = g["state"]["order"][g["state"]["turn_idx"]]
    turn_name = g["players"][turn_uid]
    kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="Профессия", callback_data="bunkrev_prof"), InlineKeyboardButton(text="Здоровье", callback_data="bunkrev_hp")], [InlineKeyboardButton(text="Хобби", callback_data="bunkrev_hob"), InlineKeyboardButton(text="Рюкзак", callback_data="bunkrev_inv")]])
    log_text = g["state"]["log"]
    await update_game_msg(gid, f"☢️ **Бункер**\n\n{log_text}\n\n👉 Сейчас ход игрока: **{turn_name}**")
    chat_id = gid if isinstance(gid, int) else None
    await send_secret(turn_uid, "Ваш ход! Выберите, какую черту раскрыть всем:", kb, chat_id=chat_id)

@dp.callback_query(F.data.startswith("bunkrev_"))
async def bunker_reveal(call: CallbackQuery):
    gid = user_game.get(call.from_user.id)
    if not gid or gid not in active_games: return
    g = active_games[gid]
    turn_uid = g["state"]["order"][g["state"]["turn_idx"]]
    if call.from_user.id != turn_uid: return await call.answer("Сейчас не ваш ход!", show_alert=True)
        
    trait_key = call.data.split("_")[1]
    trait_names = {"prof": "Профессия", "hp": "Здоровье", "hob": "Хобби", "inv": "Рюкзак"}
    val = g["state"][turn_uid][trait_key]
    if trait_key in g["state"][turn_uid]["revealed"]: return await call.answer("Вы уже раскрыли это!", show_alert=True)
    
    g["state"][turn_uid]["revealed"].append(trait_key)
    g["state"]["log"] += f"\n- **{g['players'][turn_uid]}** ({trait_names[trait_key]}): {val}"
    
    g["state"]["turn_idx"] = (g["state"]["turn_idx"] + 1) % len(g["state"]["order"])
    await send_bunker_turn(gid)

# --- МАФИЯ ЛОГИКА ---
@dp.callback_query(F.data.startswith("mafiakill_"))
async def mafia_kill(call: CallbackQuery):
    gid = user_game.get(call.from_user.id)
    g = active_games.get(gid)
    if not g or call.from_user.id not in g["state"]["mafias"]: return await call.answer("Ошибка!", show_alert=True)
    
    victim_id = int(call.data.split("_")[1])
    g["state"]["alive"].remove(victim_id)
    g["state"]["night"] = False
    await update_game_msg(gid, f"☀️ **Город просыпается.**\n\nЭтой ночью убили: **{g['players'][victim_id]}**.\nДневное обсуждение!")

# --- ПЕРЕХВАТ ТЕКСТА И РАЦИЯ ---
@dp.message(F.chat.type == "private")
async def handle_private_messages(message: Message):
    uid = message.from_user.id
    for gid, g in active_games.items():
        if g["status"] == "playing" and g["game"] == "mafia" and g["state"].get("night"):
            mafias = g["state"].get("mafias", [])
            if uid in mafias:
                for m_id in mafias:
                    if m_id != uid:
                        await bot.send_message(m_id, f"🥷 **Напарник:** {message.text}", parse_mode="Markdown")

@dp.message()
async def ignore_all(message: Message): pass

async def main():
    await bot.delete_webhook(drop_pending_updates=True)
    print("Бот PartyBox: Добавлен таймер и полноценное голосование для Шпиона!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
