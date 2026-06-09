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
  /** Dev/opname-modus: speelt op het Mijn boom-scherm een timelapse af
   *  (boom groeit + verhuist naar bos, dag scrollt, streak/week lopen mee).
   *  Bewust NIET persistent — een opname-sessie mag nooit blijven hangen. */
  demoPlaying: boolean;
  /** Gesimuleerde "vandaag" (todayKey-formaat) tijdens de timelapse, zodat
   *  het week-grid dag voor dag kan vollopen. `null` = echte klok. */
  demoDateKey: string | null;
  toggle: (k: BooleanKey) => void;
  setWindowOverrideMinutes: (v: number | null) => void;
  setDemoPlaying: (v: boolean) => void;
  setDemoDateKey: (v: string | null) => void;
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
      demoPlaying: false,
      demoDateKey: null,
      toggle: (k) => set((s) => ({ [k]: !s[k] } as Partial<PrefsState>)),
      setWindowOverrideMinutes: (v) => set({ windowOverrideMinutes: v }),
      setDemoPlaying: (v) => set({ demoPlaying: v }),
      setDemoDateKey: (v) => set({ demoDateKey: v }),
    }),
    {
      name: "powerplant-prefs",
      storage: createJSONStorage(() => AsyncStorage),
      // demoPlaying/demoDateKey zijn vluchtige opname-status; nooit bewaren.
      partialize: ({ demoPlaying, demoDateKey, ...rest }) => rest,
    },
  ),
);
