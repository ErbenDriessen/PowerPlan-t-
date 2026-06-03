import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type BooleanKey =
  | "sound"
  | "notifications"
  | "darkMode"
  | "bedtimeReminder"
  | "showWindowControls";

type PrefsState = {
  sound: boolean;
  notifications: boolean;
  darkMode: boolean;
  bedtimeReminder: boolean;
  /** Toon de demo-tijdbediening (slider + speel-knop) direct op het Mijn
   *  boom-scherm, zodat je tijdens een demo niet naar Meer hoeft. */
  showWindowControls: boolean;
  /** Handmatige tijd voor het raam-uitzicht, in minuten sinds middernacht
   *  (0..1440). `null` (standaard) laat het raam de echte klok volgen. */
  windowOverrideMinutes: number | null;
  toggle: (k: BooleanKey) => void;
  setWindowOverrideMinutes: (v: number | null) => void;
};

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      sound: true,
      notifications: true,
      darkMode: true,
      bedtimeReminder: true,
      showWindowControls: false,
      windowOverrideMinutes: null,
      toggle: (k) => set((s) => ({ [k]: !s[k] } as Partial<PrefsState>)),
      setWindowOverrideMinutes: (v) => set({ windowOverrideMinutes: v }),
    }),
    { name: "powerplant-prefs", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
