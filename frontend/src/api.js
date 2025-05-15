// src/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Старт новой игры: GET /newgame?difficulty=…
 */
export async function newGame(difficulty) {
  const url = new URL(`${API_URL}/newgame`);
  url.searchParams.set("difficulty", difficulty);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      data?.detail ||
      data?.error ||
      `Ошибка ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data; // { fen: string }
}

/**
 * Отправка хода: POST /move
 */
export async function sendMove(fen, playerMove) {
  const res = await fetch(`${API_URL}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen, playerMove }), // <--- Исправлено здесь!
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      typeof data?.detail === "string"
        ? data.detail
        : data?.error
        ? data.error
        : data
        ? JSON.stringify(data)
        : `Ошибка ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data; // { newFen: string, status: string }
}
