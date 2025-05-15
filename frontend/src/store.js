import { create } from "zustand";

export const useStore = create((set) => ({
  fen: null,
  difficulty: "medium",
  setFen: (fen) => set({ fen }),
  setDifficulty: (difficulty) => set({ difficulty }),
}));