// powerplant/stores/useUserStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { daysBetween } from "../lib/dates";

export type Goal = {
  id: string;
  title: string;
  description: string;
  done: boolean;
};

type UserState = {
  name: string;
  goals: Goal[];
  bedH: number;
  bedM: number;
  hasOnboarded: boolean;
  points: number;
  ringProgress: number;
  treeStage: number;
  streak: number;
  lastSeenDate: string | null;
  hasHydrated: boolean;

  setName: (n: string) => void;
  toggleGoal: (title: string) => void;
  addGoal: (input: { title: string; description?: string }) => void;
  updateGoal: (id: string, input: { title?: string; description?: string }) => void;
  removeGoal: (id: string) => void;
  toggleGoalDone: (id: string) => void;
  bumpHour: (d: number) => void;
  bumpMin: (d: number) => void;
  addPoints: (delta: number, ringDelta: number) => void;
  bumpStreak: (delta: number) => void;
  rolloverIfNewDay: (today: string) => void;
  resetGoalsDone: () => void;
  simulateNextDay: () => void;
  finishOnboarding: () => void;
  setHasHydrated: (v: boolean) => void;
  devReset: () => void;
};

const DEFAULT_GOAL_TITLES = ["Minder stress", "Beter focussen", "Betere slaap"];

// Point threshold (inclusive) at which each stage unlocks. Index = stage - 1.
export const STAGE_THRESHOLDS = [0, 50, 100, 200, 350, 500, 750] as const;

export const STAGE_LABELS = [
  "Zaadje",
  "Spruit",
  "Jonge boom",
  "Twijgen",
  "Bladerdek",
  "Brede kruin",
  "Volgroeide boom",
] as const;

export function pointsToStage(points: number): number {
  let stage = 1;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (points >= STAGE_THRESHOLDS[i]) stage = i + 1;
  }
  return stage;
}

export function pointsToNextThreshold(points: number): number | null {
  const stage = pointsToStage(points);
  if (stage >= STAGE_THRESHOLDS.length) return null;
  return STAGE_THRESHOLDS[stage];
}

function newGoalId(): string {
  return "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function makeGoal(title: string, description = ""): Goal {
  return { id: newGoalId(), title: title.trim(), description: description.trim(), done: false };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: "",
      goals: [],
      bedH: 23,
      bedM: 15,
      hasOnboarded: false,
      points: 0,
      ringProgress: 0,
      treeStage: 1,
      streak: 0,
      lastSeenDate: null,
      hasHydrated: false,

      setName: (n) => set({ name: n.trim() }),
      toggleGoal: (title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        set((s) => {
          const existing = s.goals.find((g) => g.title === trimmed);
          if (existing) {
            return { goals: s.goals.filter((g) => g.id !== existing.id) };
          }
          return { goals: [...s.goals, makeGoal(trimmed)] };
        });
      },
      addGoal: ({ title, description = "" }) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        set((s) => {
          if (s.goals.some((g) => g.title === trimmed)) return s;
          return { goals: [...s.goals, makeGoal(trimmed, description)] };
        });
      },
      updateGoal: (id, input) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== id) return g;
            const nextTitle = input.title !== undefined ? input.title.trim() : g.title;
            const nextDesc =
              input.description !== undefined ? input.description.trim() : g.description;
            if (!nextTitle) return g; // refuse to wipe the title
            return { ...g, title: nextTitle, description: nextDesc };
          }),
        })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      toggleGoalDone: (id) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
        })),
      bumpHour: (d) => set((s) => ({ bedH: (s.bedH + d + 24) % 24 })),
      bumpMin: (d) => set((s) => ({ bedM: (s.bedM + d + 60) % 60 })),
      addPoints: (delta, ringDelta) =>
        set((s) => {
          const newPoints = Math.max(0, s.points + delta);
          return {
            points: newPoints,
            ringProgress: Math.max(0, Math.min(1, s.ringProgress + ringDelta)),
            treeStage: pointsToStage(newPoints),
          };
        }),
      bumpStreak: (delta) =>
        set((s) => ({ streak: Math.max(0, s.streak + delta) })),
      rolloverIfNewDay: (today) =>
        set((s) => {
          if (s.lastSeenDate === today) return s;
          // Update streak based on what was done on the previous day.
          // First run (null lastSeenDate): leave streak untouched.
          // Gap of exactly 1 day AND at least one goal was done → +1.
          // Any other gap, or zero goals done → break the streak.
          let newStreak = s.streak;
          if (s.lastSeenDate !== null) {
            const gap = daysBetween(s.lastSeenDate, today);
            const yesterdayQualifies = s.goals.some((g) => g.done);
            newStreak = gap === 1 && yesterdayQualifies ? s.streak + 1 : 0;
          }
          return {
            lastSeenDate: today,
            ringProgress: 0,
            streak: newStreak,
            goals: s.goals.map((g) => (g.done ? { ...g, done: false } : g)),
          };
        }),
      resetGoalsDone: () =>
        set((s) => ({
          ringProgress: 0,
          goals: s.goals.map((g) => (g.done ? { ...g, done: false } : g)),
        })),
      simulateNextDay: () =>
        set((s) => {
          // Dev-only: run the same streak math the real rollover does,
          // pretending we just crossed midnight. lastSeenDate is left
          // alone so the real rollover still fires correctly tomorrow.
          const yesterdayQualifies = s.goals.some((g) => g.done);
          const newStreak = yesterdayQualifies ? s.streak + 1 : 0;
          return {
            ringProgress: 0,
            streak: newStreak,
            goals: s.goals.map((g) => (g.done ? { ...g, done: false } : g)),
          };
        }),
      finishOnboarding: () => {
        const s = get();
        const goals: Goal[] = s.goals.length
          ? s.goals
          : DEFAULT_GOAL_TITLES.map((t) => makeGoal(t));
        set({
          hasOnboarded: true,
          name: s.name || "Vriend",
          goals,
        });
      },
      setHasHydrated: (v) => set({ hasHydrated: v }),
      devReset: () =>
        set({ points: 0, ringProgress: 0, treeStage: 1, streak: 0 }),
    }),
    {
      name: "powerplant-user",
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // v1 stored goals as string[]. Throw the old goals away on upgrade so
      // the rest of the persisted data (name, bedtime, points...) survives.
      migrate: (persisted: unknown, version) => {
        const obj = (persisted ?? {}) as Record<string, unknown>;
        if (version < 2) {
          return { ...obj, goals: [] };
        }
        return obj;
      },
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
