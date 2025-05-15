import { motion } from "framer-motion";

export default function Square({ dark, piece, selected, target, onClick }) {
  // фон
  const base = dark ? "bg-green-700" : "bg-amber-50";
  return (
    <div
      className={`${base} relative flex justify-center items-center`}
      onClick={onClick}
    >
      {/* точка‐подсветка доступного хода */}
      {target && (
        <div className="absolute w-2 h-2 bg-black rounded-full"></div>
      )}

      {/* шашка с анимацией перемещения и выделением */}
      {piece && (
        <motion.div
          layout
          transition={{ duration: 0.3 }}
          className={`
            w-5/6 h-5/6 rounded-full
            ${piece === "w" ? "bg-white" : "bg-black"}
            ${selected ? "ring-4 ring-yellow-300" : ""}
          `}
        />
      )}
    </div>
  );
}
