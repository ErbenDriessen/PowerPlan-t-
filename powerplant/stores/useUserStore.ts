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
  finishOnboarding: () => void;
  setHasHydrated: (v: boolean) => void;
};

const DEFAULT_GOALS = ["Minder stress", "Beter focussen", "Betere slaap"];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: "",
      goals: [],
      bedH: 23,
      bedM: 15,
      hasOnboarded: false,
      points: 240,
      ringProgress: 0.6,
      treeStage: 3,
      streak: 5,
      hasHydrated: false,

      setName: (n) => set({ name: n.trim() }),
      toggleGoal: (g) =>
        set((s) => ({
          goals: s.goals.includes(g) ? s.goals.filter((x) => x !== g) : [...s.goals, g],
        })),
      bumpHour: (d) => set((s) => ({ bedH: (s.bedH + d + 24) % 24 })),
      bumpMin: (d) => set((s) => ({ bedM: (s.bedM + d + 60) % 60 })),
      addPoints: (delta, ringDelta) =>
        set((s) => ({
          points: Math.max(0, s.points + delta),
          ringProgress: Math.max(0, Math.min(1, s.ringProgress + ringDelta)),
        })),
      finishOnboarding: () => {
        const s = get();
        set({
          hasOnboarded: true,
          name: s.name || "Vriend",
          goals: s.goals.length ? s.goals : DEFAULT_GOALS,
        });
      },
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "powerplant-user",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
