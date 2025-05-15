import os
from dotenv import load_dotenv

load_dotenv()  # грузим .env из корня проекта

TG_TOKEN       = os.getenv("TG_TOKEN", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if not TG_TOKEN or not GEMINI_API_KEY:
    raise RuntimeError(
        "В .env должны быть TG_TOKEN и GEMINI_API_KEY "
        "(см. .env.example)"
    )