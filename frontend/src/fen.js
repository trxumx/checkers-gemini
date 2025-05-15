/**
 * Парсит FEN вида "W:Wa1,c3…:Bb6,d6…"
 * и возвращает матрицу 8×8 со строками:
 * ""  – пусто
 * "w" – ваша шашка
 * "b" – шашка Gemini
 */
export function fenToMatrix(fen) {
  if (!fen || typeof fen !== "string") {
    return Array.from({ length: 8 }, () => Array(8).fill(""));
  }
  const parts = fen.split(":");
  if (parts.length !== 3) {
    console.error("Invalid FEN:", fen);
    return Array.from({ length: 8 }, () => Array(8).fill(""));
  }

  const whiteRaw = parts[1].slice(1).split(",");
  const blackRaw = parts[2].slice(1).split(",");

  const algToRC = (alg) => {
    const file = alg[0].toLowerCase();
    const rank = parseInt(alg.slice(1), 10);
    const col  = file.charCodeAt(0) - 97; // a→0
    const row  = 8 - rank;                // rank1→row7
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return [row, col];
  };

  const board = Array.from({ length: 8 }, () => Array(8).fill(""));

  whiteRaw.forEach((alg) => {
    const rc = algToRC(alg.trim());
    if (rc) board[rc[0]][rc[1]] = "w";
  });
  blackRaw.forEach((alg) => {
    const rc = algToRC(alg.trim());
    if (rc) board[rc[0]][rc[1]] = "b";
  });

  return board;
}
