"""
Абстракция над Gemini API (google-generativeai).
"""
import google.generativeai as genai
from .engine import validate_and_apply, random_legal_move

# пря­мое конфиг­уриро­ва­ние SDK
from .settings import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
MODEL = genai.GenerativeModel("gemini-1.5-pro")

DIFF_PROMPTS = {
    "easy": """
Играй как начинающий. Ошибайся, игнорируй
выгодные размены, можешь жертвовать шашки без выгоды.
""",
    "medium": """
Играй как обычный клубный игрок: избегай грубых зевков,
но периодически выбирай не лучший ход.
""",
    "hard": """
Играй максимально сильно по правилам русских шашек.
Находи многоходовые комбинации и лучший ход в позиции.
""",
}


def ai_move(fen: str, difficulty: str) -> str:
    system_prompt = DIFF_PROMPTS.get(difficulty.lower(), DIFF_PROMPTS["medium"])
    prompt = f"""{system_prompt}

Текущее положение русских шашек (PDN FEN): {fen}
Дай один единственный ход в формате PDN
(пример 12-16 или 18x27x36). Не добавляй ничего кроме хода.
"""
    try:
        resp = MODEL.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.9 if difficulty == "easy" else
                0.7 if difficulty == "medium" else
                0.2,  # hard — почти без рандома
                max_output_tokens=8,
            ),
        )
        move = resp.text.strip().split()[0]
        # проверяем, валиден ли ход; если нет — fallback
        validate_and_apply(fen, move)
        return move
    except Exception:
        # гарантия ответа
        return random_legal_move(fen)