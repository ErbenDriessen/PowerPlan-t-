import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TimeOfDayOverride = "auto" | "day" | "dusk" | "night";

type PrefsState = {
  sound: boolean;
  notifications: boolean;
  darkMode: boolean;
  bedtimeReminder: boolean;
  /** Dev/demo override for the window scene's sky. `auto` (default)
   *  uses the device clock; the others force a fixed time of day. */
  tijdOverride: TimeOfDayOverride;
  toggle: (
    k: Exclude<keyof PrefsState, "toggle" | "tijdOverride" | "setTijdOverride">,
  ) => void;
  setTijdOverride: (v: TimeOfDayOverride) => void;
};

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      sound: true,
      notifications: true,
      darkMode: true,
      bedtimeReminder: true,
      tijdOverride: "auto",
      toggle: (k) => set((s) => ({ [k]: !s[k] } as Partial<PrefsState>)),
      setTijdOverride: (v) => set({ tijdOverride: v }),
    }),
    { name: "powerplant-prefs", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
