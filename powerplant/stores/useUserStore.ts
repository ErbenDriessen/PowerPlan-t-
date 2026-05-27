// powerplant/stores/useUserStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { daysBetween } from "../lib/dates";
import { SPECIES_COUNT } from "../lib/plantSprites";
import { useDailyProgressStore } from "./useDailyProgressStore";

export type Goal = {
  id: string;
  title: string;
  description: string;
  done: boolean;
};

// Each entry is a tree the user has "harvested" (took to max stage) and
// planted into their background forest. Position metadata is captured at
// plant time so the layout stays stable on re-renders.
export type PlantedTree = {
  species: number;
  zBand: "far" | "mid";
  xRatio: number; // horizontal position 0..1 within its z-band
  swayOffset: number; // 0..1 — phase offset for the idle sway animation
  plantedAt: number; // ms-since-epoch, for ordering
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

  // Prestige
  currentSpecies: number;
  plantedTrees: PlantedTree[];
  bomenGeplant: number;

  setName: (n: string) => void;
  toggleGoal: (title: string, description?: string) => void;
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
  /** Dev-only: clear only the prestige forest (keeps points/streak/etc). */
  resetForest: () => void;
};

const DEFAULT_GOAL_TITLES = ["Minder stress", "Beter focussen", "Betere slaap"];

// Five visible growth stages map onto the 5 sprites we pick from the atlas
// (see lib/plantSprites.ts). Per-stage thresholds are spaced evenly so each
// stage feels like a meaningful step. Reaching PRESTIGE_THRESHOLD plants
// the current tree into the forest and starts a fresh sapling.
export const STAGE_THRESHOLDS = [0, 150, 300, 450, 600] as const;
export const PRESTIGE_THRESHOLD = 750;

export const STAGE_LABELS = [
  "Zaadje",
  "Spruit",
  "Jonge boom",
  "Bladerdek",
  "Volgroeide boom",
] as const;

export function pointsToStage(points: number): number {
  let stage = 1;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (points >= STAGE_THRESHOLDS[i]) stage = i + 1;
  }
  return stage;
}

/**
 * Next point milestone shown in the UI. While inside a tree's lifecycle we
 * show the next stage threshold; on the final stage we show the prestige
 * threshold so the user has a clear next goal.
 */
export function pointsToNextThreshold(points: number): number | null {
  const stage = pointsToStage(points);
  if (stage >= STAGE_THRESHOLDS.length) {
    return PRESTIGE_THRESHOLD;
  }
  return STAGE_THRESHOLDS[stage];
}

function newGoalId(): string {
  return "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function makeGoal(title: string, description = ""): Goal {
  return { id: newGoalId(), title: title.trim(), description: description.trim(), done: false };
}

function randomSpecies(exclude?: number): number {
  const all = Array.from({ length: SPECIES_COUNT }, (_, i) => i);
  const pool = exclude !== undefined ? all.filter((s) => s !== exclude) : all;
  return pool[Math.floor(Math.random() * pool.length)] ?? 0;
}

/**
 * Build a new PlantedTree record for the just-matured `currentSpecies`,
 * alternating its z-band so the forest fills both layers evenly.
 */
function makePlantedTree(species: number, existingCount: number): PlantedTree {
  return {
    species,
    zBand: existingCount % 2 === 0 ? "mid" : "far",
    xRatio: Math.random(),
    swayOffset: Math.random(),
    plantedAt: Date.now(),
  };
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
      currentSpecies: 0,
      plantedTrees: [],
      bomenGeplant: 0,

      setName: (n) => set({ name: n.trim() }),
      toggleGoal: (title, description) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        set((s) => {
          const existing = s.goals.find((g) => g.title === trimmed);
          if (existing) {
            return { goals: s.goals.filter((g) => g.id !== existing.id) };
          }
          return { goals: [...s.goals, makeGoal(trimmed, description ?? "")] };
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
            if (!nextTitle) return g;
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
          let newPoints = Math.max(0, s.points + delta);
          let plantedTrees = s.plantedTrees;
          let bomenGeplant = s.bomenGeplant;
          let currentSpecies = s.currentSpecies;

          // Prestige cascade: if the delta is large enough to skip past
          // the threshold (or skip past it multiple times), plant a tree
          // per crossing so no progress is lost.
          while (newPoints >= PRESTIGE_THRESHOLD) {
            plantedTrees = [
              ...plantedTrees,
              makePlantedTree(currentSpecies, plantedTrees.length),
            ];
            bomenGeplant += 1;
            currentSpecies = randomSpecies(currentSpecies);
            newPoints -= PRESTIGE_THRESHOLD;
          }

          return {
            points: newPoints,
            ringProgress: Math.max(0, Math.min(1, s.ringProgress + ringDelta)),
            treeStage: pointsToStage(newPoints),
            plantedTrees,
            bomenGeplant,
            currentSpecies,
          };
        }),
      bumpStreak: (delta) =>
        set((s) => ({ streak: Math.max(0, s.streak + delta) })),
      rolloverIfNewDay: (today) => {
        const s = get();
        if (s.lastSeenDate === today) return;
        if (s.lastSeenDate !== null) {
          const goalsDone = s.goals.filter((g) => g.done).length;
          useDailyProgressStore
            .getState()
            .recordDay(s.lastSeenDate, s.goals.length, goalsDone);
        }
        let newStreak = s.streak;
        if (s.lastSeenDate !== null) {
          const gap = daysBetween(s.lastSeenDate, today);
          const yesterdayQualifies = s.goals.some((g) => g.done);
          newStreak = gap === 1 && yesterdayQualifies ? s.streak + 1 : 0;
        }
        set({
          lastSeenDate: today,
          ringProgress: 0,
          streak: newStreak,
          goals: s.goals.map((g) => (g.done ? { ...g, done: false } : g)),
        });
      },
      resetGoalsDone: () =>
        set((s) => ({
          ringProgress: 0,
          goals: s.goals.map((g) => (g.done ? { ...g, done: false } : g)),
        })),
      simulateNextDay: () => {
        const s = get();
        if (s.lastSeenDate !== null) {
          const goalsDone = s.goals.filter((g) => g.done).length;
          useDailyProgressStore
            .getState()
            .recordDay(s.lastSeenDate, s.goals.length, goalsDone);
        }
        const yesterdayQualifies = s.goals.some((g) => g.done);
        const newStreak = yesterdayQualifies ? s.streak + 1 : 0;
        set({
          ringProgress: 0,
          streak: newStreak,
          goals: s.goals.map((g) => (g.done ? { ...g, done: false } : g)),
        });
      },
      finishOnboarding: () => {
        const s = get();
        const goals: Goal[] = s.goals.length
          ? s.goals
          : DEFAULT_GOAL_TITLES.map((t) => makeGoal(t));
        set({
          hasOnboarded: true,
          name: s.name || "Vriend",
          goals,
          // Roll the dice on a starting species so different users get
          // different first trees.
          currentSpecies: randomSpecies(),
        });
      },
      setHasHydrated: (v) => set({ hasHydrated: v }),
      devReset: () =>
        set({
          points: 0,
          ringProgress: 0,
          treeStage: 1,
          streak: 0,
          plantedTrees: [],
          bomenGeplant: 0,
          currentSpecies: randomSpecies(),
        }),
      resetForest: () =>
        set({ plantedTrees: [], bomenGeplant: 0 }),
    }),
    {
      name: "powerplant-user",
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      // v1 stored goals as string[].
      // v3 introduces the prestige system: plantedTrees, bomenGeplant,
      // currentSpecies. Older state had a 7-stage threshold scale; existing
      // points are kept as-is and just remap to the new 5-stage scale.
      migrate: (persisted: unknown, version) => {
        const obj = (persisted ?? {}) as Record<string, unknown>;
        if (version < 2) {
          obj.goals = [];
        }
        if (version < 3) {
          obj.plantedTrees = [];
          obj.bomenGeplant = 0;
          obj.currentSpecies = 0;
          // Recompute treeStage against the new 5-stage thresholds so the
          // displayed stage doesn't look out of whack right after upgrade.
          const points = typeof obj.points === "number" ? obj.points : 0;
          obj.treeStage = pointsToStage(Math.min(points, PRESTIGE_THRESHOLD - 1));
        }
        return obj;
      },
      partialize: (state) => {
        const { hasHydrated, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => () => {
        useUserStore.getState().setHasHydrated(true);
      },
    },
  ),
);
