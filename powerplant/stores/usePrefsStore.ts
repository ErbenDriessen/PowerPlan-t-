import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PrefsState = {
  sound: boolean;
  notifications: boolean;
  darkMode: boolean;
  bedtimeReminder: boolean;
  toggle: (k: keyof Omit<PrefsState, "toggle">) => void;
};

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      sound: true,
      notifications: true,
      darkMode: true,
      bedtimeReminder: true,
      toggle: (k) => set((s) => ({ [k]: !s[k] } as Partial<PrefsState>)),
    }),
    { name: "powerplant-prefs", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
