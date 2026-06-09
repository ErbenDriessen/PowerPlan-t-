import { create } from "zustand";
import { usePrefsStore } from "./usePrefsStore";

// Aantal seconden dat één ingestelde "minuut" duurt. In de normale app is
// dat 60; met de testmodus aan is het 1, zodat een tester een focusblok in
// seconden i.p.v. minuten kan doorlopen.
const unitSeconds = () => (usePrefsStore.getState().fastTimers ? 1 : 60);

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

  // Wall-clock anchor: ms-since-epoch at which the current phase ends.
  // Lets the timer survive backgrounding — we recompute `remaining`
  // from `Date.now()` instead of decrementing every second.
  phaseEndAt: number | null;
  // Counter that increments each time a WORK phase completes.
  // Reset to 0 by start(); the UI watches it to award points.
  completedWorkRounds: number;

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
  phaseEndAt: null,
  completedWorkRounds: 0,

  configure: (dur, brk) => set({ dur, brk }),
  setRounds: (n) => set({ rnds: n }),
  start: () => {
    const { dur } = get();
    const unit = unitSeconds();
    const now = Date.now();
    set({
      running: true,
      isBreak: false,
      currentRnd: 1,
      remaining: dur * unit,
      total: dur * unit,
      finished: false,
      phaseEndAt: now + dur * unit * 1000,
      completedWorkRounds: 0,
    });
  },
  tick: () => {
    const s = get();
    if (!s.running || s.phaseEndAt === null) return;
    const now = Date.now();

    // Still inside the current phase: just refresh the countdown.
    if (s.phaseEndAt > now) {
      set({ remaining: Math.max(0, Math.ceil((s.phaseEndAt - now) / 1000)) });
      return;
    }

    // Phase boundary reached. Loop to catch up any phases skipped while
    // the app was in the background.
    let isBreak = s.isBreak;
    let currentRnd = s.currentRnd;
    let phaseEndAt: number | null = s.phaseEndAt;
    let completedWorkRounds = s.completedWorkRounds;
    const unit = unitSeconds();

    while (phaseEndAt !== null && phaseEndAt <= now) {
      if (!isBreak) {
        // Work just finished -> start break (anchored to when work ended).
        completedWorkRounds += 1;
        isBreak = true;
        phaseEndAt = phaseEndAt + s.brk * unit * 1000;
      } else if (currentRnd < s.rnds) {
        // Break finished -> start next work round.
        isBreak = false;
        currentRnd += 1;
        phaseEndAt = phaseEndAt + s.dur * unit * 1000;
      } else {
        // Last break done -> session finished.
        phaseEndAt = null;
      }
    }

    if (phaseEndAt === null) {
      set({
        isBreak,
        currentRnd,
        running: false,
        finished: true,
        remaining: 0,
        total: 0,
        phaseEndAt: null,
        completedWorkRounds,
      });
    } else {
      const phaseDur = isBreak ? s.brk : s.dur;
      set({
        isBreak,
        currentRnd,
        remaining: Math.max(0, Math.ceil((phaseEndAt - now) / 1000)),
        total: phaseDur * unit,
        phaseEndAt,
        completedWorkRounds,
      });
    }
  },
  nextPhase: () => {
    // Kept for backwards compatibility; just trigger the catch-up logic.
    get().tick();
  },
  stop: () =>
    set({
      running: false,
      remaining: 0,
      total: 0,
      isBreak: false,
      currentRnd: 1,
      phaseEndAt: null,
    }),
}));
