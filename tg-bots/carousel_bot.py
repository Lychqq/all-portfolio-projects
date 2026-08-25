import os
import asyncio
import html
from typing import Any, Dict, List
from dotenv import load_dotenv

import aiohttp
from aiogram import Bot, Dispatcher, BaseMiddleware, F
from aiogram.types import Message

load_dotenv()

TOKEN = os.getenv("BOT_TOKEN", "")
CHANNEL_ID = os.getenv("CHANNEL_ID", "-1001945087226")

API_URL = "https://api.telegram.org/bot" + TOKEN
FILE_URL = "https://api.telegram.org/file/bot" + TOKEN

bot = Bot(token=TOKEN)
dp = Dispatcher()


# 1. Middleware для сборки альбома (без изменений — как и раньше)
class AlbumMiddleware(BaseMiddleware):
    def __init__(self):
        self.album_data: Dict[str, List[Message]] = {}

    async def __call__(self, handler, event: Message, data: Dict[str, Any]):
        if not event.media_group_id:
            return await handler(event, data)

        mid = event.media_group_id
        if mid not in self.album_data:
            self.album_data[mid] = [event]
            await asyncio.sleep(1.0)
            data["album"] = self.album_data.pop(mid)
            return await handler(event, data)
        else:
            self.album_data[mid].append(event)
            return


dp.message.middleware(AlbumMiddleware())


async def get_file_url(file_id: str) -> str:
    """
    Скачиваем фото у Telegram и заливаем на внешний публичный хостинг (catbox.moe).
    Ссылки вида api.telegram.org/file/... Telegram сам не может зафетчить для sendRichMessage
    (ошибка RICH_MESSAGE_PHOTO_NO_MEDIA_FOUND), поэтому нужен именно внешний URL.
    """
    file = await bot.get_file(file_id)
    file_bytes_io = await bot.download_file(file.file_path)
    file_bytes = file_bytes_io.read()

    form = aiohttp.FormData()
    form.add_field("key", "6d207e02198a847aa98d0a2a901485a5")
    form.add_field("action", "upload")
    form.add_field("source", file_bytes, filename="photo.jpg", content_type="image/jpeg")

    async with aiohttp.ClientSession() as session:
        async with session.post("https://freeimage.host/api/1/upload", data=form) as resp:
            data = await resp.json()
            if "image" in data and "url" in data["image"]:
                return data["image"]["url"]
            raise RuntimeError("freeimage.host upload failed: " + str(data))


async def send_slideshow(photo_urls: List[str], caption: str = ""):
    """Собираем rich message с блоком <tg-slideshow> и отправляем через новый метод sendRichMessage."""
    imgs = "".join('<img src="{}"/>'.format(u) for u in photo_urls)
    print("DEBUG photo_urls:", photo_urls)

    if caption:
        safe_caption = html.escape(caption)
        slideshow_html = "<tg-slideshow>{}<figcaption>{}</figcaption></tg-slideshow>".format(
            imgs, safe_caption
        )
    else:
        slideshow_html = "<tg-slideshow>{}</tg-slideshow>".format(imgs)

    payload = {
        "chat_id": CHANNEL_ID,
        "rich_message": {"html": slideshow_html},
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(API_URL + "/sendRichMessage", json=payload) as resp:
            result = await resp.json()
            if not result.get("ok"):
                raise RuntimeError("sendRichMessage failed: " + str(result))
            return result


# 2. Хэндлер альбома -> карусель (slideshow)
@dp.message(F.media_group_id)
async def handle_album(message: Message, album: List[Message]):
    photo_urls = []
    caption = ""

    for i, msg in enumerate(album):
        if msg.photo:
            file_id = msg.photo[-1].file_id
            url = await get_file_url(file_id)
            photo_urls.append(url)
            if i == 0 and msg.caption:
                caption = msg.caption

    await send_slideshow(photo_urls, caption)
    await message.answer("Карусель (slideshow) успешно опубликована в канал!")


# 3. Хэндлер одиночного фото -> просто обычное фото (карусель из одного кадра не нужна)
@dp.message(F.photo)
async def handle_single_photo(message: Message):
    file_id = message.photo[-1].file_id
    await bot.send_photo(chat_id=CHANNEL_ID, photo=file_id, caption=message.caption)
    await message.answer("Фото опубликовано в канал!")


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())