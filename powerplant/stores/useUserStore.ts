// powerplant/stores/useUserStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
  name: string;
  goals: string[];
  bedH: number;
  bedM: number;
  hasOnboarded: boolean;
  points: number;
  ringProgress: number;
  treeStage: number;
  streak: number;
  hasHydrated: boolean;

  setName: (n: string) => void;
  toggleGoal: (g: string) => void;
  bumpHour: (d: number) => void;
  bumpMin: (d: number) => void;
  addPoints: (delta: number, ringDelta: number) => void;
  bumpStreak: (delta: number) => void;
  finishOnboarding: () => void;
  setHasHydrated: (v: boolean) => void;
  devReset: () => void;
};

const DEFAULT_GOALS = ["Minder stress", "Beter focussen", "Betere slaap"];

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
      hasHydrated: false,

      setName: (n) => set({ name: n.trim() }),
      toggleGoal: (g) =>
        set((s) => ({
          goals: s.goals.includes(g) ? s.goals.filter((x) => x !== g) : [...s.goals, g],
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
      finishOnboarding: () => {
        const s = get();
        set({
          hasOnboarded: true,
          name: s.name || "Vriend",
          goals: s.goals.length ? s.goals : DEFAULT_GOALS,
        });
      },
      setHasHydrated: (v) => set({ hasHydrated: v }),
      devReset: () =>
        set({ points: 0, ringProgress: 0, treeStage: 1, streak: 0 }),
    }),
    {
      name: "powerplant-user",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
