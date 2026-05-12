// powerplant/stores/useDailyProgressStore.ts
//
// Per-day snapshot of how many goals the user had and how many were done.
// Snapshots are written by useUserStore's rolloverIfNewDay / simulateNextDay
// just before today's done-flags get reset. The Mijn-boom screen reads from
// here to render the real week grid and weekly stats.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DayRecord = {
  date: string; // YYYY-MM-DD
  goalsTotal: number;
  goalsDone: number;
};

type DailyState = {
  history: DayRecord[]; // newest-first
  recordDay: (date: string, goalsTotal: number, goalsDone: number) => void;
  getRecord: (date: string) => DayRecord | undefined;
  devReset: () => void;
};

export const useDailyProgressStore = create<DailyState>()(
  persist(
    (set, get) => ({
      history: [],
      recordDay: (date, goalsTotal, goalsDone) =>
        set((s) => {
          const existing = s.history.findIndex((r) => r.date === date);
          const next: DayRecord = { date, goalsTotal, goalsDone };
          if (existing >= 0) {
            const copy = s.history.slice();
            copy[existing] = next;
            return { history: copy };
          }
          return { history: [next, ...s.history] };
        }),
      getRecord: (date) => get().history.find((r) => r.date === date),
      devReset: () => set({ history: [] }),
    }),
    {
      name: "powerplant-daily-progress",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
