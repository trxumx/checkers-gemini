# backend/main.py

import os
import threading
import subprocess
from pathlib import Path
from dotenv import load_dotenv
from pyngrok import ngrok

# ───────────────────────────────────────────────────────────────
# 1) ЗАГРУЗКА .env И ПОДКЛЮЧЕНИЕ NGROK

# загружаем .env из корня проекта
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# при наличии токена в .env устанавливаем
ngrok_token = os.getenv("NGROK_AUTHTOKEN")
if ngrok_token:
    ngrok.set_auth_token(ngrok_token)

# поднимаем публичный HTTPS-туннель на порт 5173 (Vite)
public_url = ngrok.connect(5173, bind_tls=True).public_url
print(f"[ngrok] public WebApp URL → {public_url}")
# ───────────────────────────────────────────────────────────────


# ───────────────────────────────────────────────────────────────
# 2) ИМПОРТ FastAPI и Telegram

import uvicorn
from telegram import (
    Update,
    KeyboardButton,
    WebAppInfo,
    ReplyKeyboardMarkup,
)
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)

from .settings import TG_TOKEN
from .api import app as fastapi_app
# ───────────────────────────────────────────────────────────────


# ───────────────────────────────────────────────────────────────
# 3) TELEGRAM-BOT

async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """
    Обрабатывает команду /start — шлёт кнопку
    «🎮 Играть» с WebAppInfo(url=public_url).
    """
    kb = [
        [
            KeyboardButton(
                text="🎮 Играть",
                web_app=WebAppInfo(url=public_url),
            )
        ]
    ]
    await update.message.reply_text(
        "Откройте мини-приложение и играйте!",
        reply_markup=ReplyKeyboardMarkup(kb, resize_keyboard=True),
    )


def run_telegram_bot():
    """
    Стартует Telegram-бота в режиме polling.
    """
    bot_app = Application.builder().token(TG_TOKEN).build()
    bot_app.add_handler(CommandHandler("start", start))
    print(f"[telegram] Bot polling with token prefix {TG_TOKEN[:10]}…")
    bot_app.run_polling()
# ───────────────────────────────────────────────────────────────


# ───────────────────────────────────────────────────────────────
# 4) FASTAPI

def run_api():
    """
    Запускает FastAPI (uvicorn) на порту 8000.
    """
    uvicorn.run(
        fastapi_app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
# ───────────────────────────────────────────────────────────────


# ───────────────────────────────────────────────────────────────
# 5) MAIN

if __name__ == "__main__":
    # FastAPI в фоне
    threading.Thread(target=run_api, daemon=True).start()
    # Telegram-бот в главном потоке
    run_telegram_bot()
# ───────────────────────────────────────────────────────────────
