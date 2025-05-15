import { useState, useEffect } from "react";
import { newGame } from "./api.js";
import Board from "./Board.jsx";

export default function App() {
  const [fen, setFen] = useState(null);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [status, setStatus] = useState("…");

  // При старте и при смене сложности — создаём новую игру
  useEffect(() => {
    newGame(difficulty)
      .then((res) => {
        setFen(res.fen);
        setStatus("…");
      })
      .catch((e) => alert("Ошибка: " + e.message));
  }, [difficulty]);

  return (
    <div className="p-4">
      <h1 className="text-2xl text-center mb-4">Gemini × Шашки</h1>
      <div className="flex justify-center gap-2 mb-4">
        {["EASY", "MEDIUM", "HARD"].map((lvl) => (
          <button
            key={lvl}
            className={`px-3 py-1 border rounded ${
              difficulty === lvl ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setDifficulty(lvl)}
          >
            {lvl}
          </button>
        ))}
      </div>

      <Board
        fen={fen}
        setFen={setFen}
        status={status}
        setStatus={setStatus}
        difficulty={difficulty}
      />
    </div>
  );
}
