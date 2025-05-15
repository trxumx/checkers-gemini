from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .engine import START_FEN, validate_and_apply
from .gemini_ai import ai_move

app = FastAPI(title="Gemini × Checkers API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MoveReq(BaseModel):
    fen: str
    playerMove: str
    difficulty: str = "medium"


class MoveResp(BaseModel):
    aiMove: str
    newFen: str
    status: str  # ongoing | player_win | ai_win | draw


@app.get("/newgame", response_model=dict)
def newgame():
    """Возврат стартовой позиции."""
    return {"fen": START_FEN}


@app.post("/move", response_model=MoveResp)
def move(body: MoveReq):
    # ход человека
    try:
        fen_after_player, is_over, winner = validate_and_apply(
            body.fen, body.playerMove
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if is_over:
        status = "player_win" if winner == 1 else "draw"
        return MoveResp(
            aiMove="",
            newFen=fen_after_player,
            status=status,
        )

    # ход AI
    ai_pdn = ai_move(fen_after_player, body.difficulty)
    fen_after_ai, is_over, winner = validate_and_apply(fen_after_player, ai_pdn)

    if is_over:
        status = "ai_win" if winner == -1 else "draw"
    else:
        status = "ongoing"

    return MoveResp(aiMove=ai_pdn, newFen=fen_after_ai, status=status)