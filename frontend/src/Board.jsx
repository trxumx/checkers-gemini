import { useState } from "react";
import { motion } from "framer-motion";
import { fenToMatrix } from "./fen.js";
import { sendMove } from "./api.js";

const DELAY_MS = 300; // задержка для визуализации хода
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const rcToAlg = (r, c) => String.fromCharCode(97 + c) + (8 - r);

export default function Board({ fen, setFen, status, setStatus }) {
  const [selected, setSelected] = useState(null);
  const [targets, setTargets] = useState([]);
  const [busy, setBusy] = useState(false);

  const matrix = fenToMatrix(fen);

  const getTargets = (r, c) => {
    if (matrix[r][c] !== "w") return [];
    const dirs = [
      [-1, -1],
      [-1, +1],
      [+1, -1],
      [+1, +1],
    ];
    const out = [];
    for (let [dr, dc] of dirs) {
      const r1 = r + dr,
        c1 = c + dc;
      const r2 = r + 2 * dr,
        c2 = c + 2 * dc;
      if (r1 >= 0 && r1 < 8 && c1 >= 0 && c1 < 8 && matrix[r1][c1] === "") {
        out.push([r1, c1]);
      }
      if (
        r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8 &&
        matrix[r1]?.[c1]?.toLowerCase() === "b" &&
        matrix[r2][c2] === ""
      ) {
        out.push([r2, c2]);
      }
    }
    return out;
  };

  const handleCell = async (r, c) => {
    if (busy) return;

    if (!selected && matrix[r][c] === "w") {
      setSelected([r, c]);
      setTargets(getTargets(r, c));
      return;
    }

    if (selected) {
      const [sr, sc] = selected;

      if (matrix[r][c] === "w" && (sr !== r || sc !== c)) {
        setSelected([r, c]);
        setTargets(getTargets(r, c));
        return;
      }

      if (targets.some(([tr, tc]) => tr === r && tc === c)) {
        const sep = Math.abs(sr - r) === 2 ? "x" : "-";
        const mv = `${rcToAlg(sr, sc)}${sep}${rcToAlg(r, c)}`;

        setBusy(true);
        setSelected(null);
        setTargets([]);

        await delay(DELAY_MS);

        try {
          const resp = await sendMove(fen, mv);
          setFen(resp.newFen);
          setStatus(resp.status);
        } catch (e) {
          alert("Невалидный ход:\n" + e.message);
        } finally {
          setBusy(false);
        }
        return;
      }

      setSelected(null);
      setTargets([]);
    }
  };

  return (
    <>
      <div className="mx-auto w-96 h-96">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {matrix.map((rowArr, r) =>
            rowArr.map((piece, c) => {
              const dark = (r + c) % 2 === 1;
              const sel = selected?.[0] === r && selected?.[1] === c;
              const tgt = targets.some(([tr, tc]) => tr === r && tc === c);

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative ${dark ? "bg-green-700" : "bg-amber-50"}`}
                  onClick={() => handleCell(r, c)}
                >
                  {tgt && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-black rounded-full" />
                    </div>
                  )}

                  <motion.div
                    layout
                    transition={{ duration: DELAY_MS / 1000 }}
                    className={`${piece ? "flex" : "hidden"} items-center justify-center w-full h-full`}
                  >
                    <div
                      className={`
                        w-5/6 h-5/6 rounded-full
                        ${piece === "w" ? "bg-white" : "bg-black"}
                        ${sel ? "ring-4 ring-yellow-300" : ""}
                      `}
                    />
                  </motion.div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-lg">
        {busy ? "Ход выполняется…" : status}
      </p>
    </>
  );
}