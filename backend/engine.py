"""
Примитивная обёртка над pydraughts
для русских шашек (8×8, variant='russian').
"""
from draughts import Board, Move, WHITE, BLACK
import random

START_FEN = Board(variant="russian", fen="startpos").fen


def validate_and_apply(fen: str, pdn_move: str):
    """
    Проверяет ход `pdn_move` (формат 12-16 или 18x27x36),
    применяет его и возвращает (новый_fen, is_over, winner_id).
    """
    board = Board(variant="russian", fen=fen)
    try:
        move_obj = Move(board, pdn_move=pdn_move)
        board.push(move_obj)
    except Exception as exc:
        raise ValueError(f"Невалидный ход: {pdn_move}") from exc

    return board.fen, board.is_over(), board.winner()


def random_legal_move(fen: str) -> str:
    """Бэкап — берём случайный легальный ход."""
    board = Board(variant="russian", fen=fen)
    move = random.choice(board.legal_moves())
    return move.pdn_move