import { create } from "zustand";

type FocusState = {
  dur: number;
  brk: number;
  rnds: number;
  running: boolean;
  isBreak: boolean;
  currentRnd: number;
  remaining: number;
  total: number;
  finished: boolean;

  configure: (dur: number, brk: number) => void;
  setRounds: (n: number) => void;
  start: () => void;
  tick: () => void;
  nextPhase: () => void;
  stop: () => void;
};

export const useFocusStore = create<FocusState>((set, get) => ({
  dur: 25,
  brk: 5,
  rnds: 4,
  running: false,
  isBreak: false,
  currentRnd: 1,
  remaining: 0,
  total: 0,
  finished: false,

  configure: (dur, brk) => set({ dur, brk }),
  setRounds: (n) => set({ rnds: n }),
  start: () => {
    const { dur } = get();
    set({
      running: true,
      isBreak: false,
      currentRnd: 1,
      remaining: dur * 60,
      total: dur * 60,
      finished: false,
    });
  },
  tick: () => set((s) => ({ remaining: Math.max(0, s.remaining - 1) })),
  nextPhase: () => {
    const s = get();
    if (!s.isBreak) {
      set({ isBreak: true, remaining: s.brk * 60, total: s.brk * 60 });
    } else if (s.currentRnd < s.rnds) {
      set({
        isBreak: false,
        currentRnd: s.currentRnd + 1,
        remaining: s.dur * 60,
        total: s.dur * 60,
      });
    } else {
      set({ running: false, finished: true });
    }
  },
  stop: () => set({ running: false, remaining: 0, total: 0, isBreak: false, currentRnd: 1 }),
}));
