import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Mood = "moe" | "onrustig" | "rustig" | "blij" | "dankbaar";

export type Entry = { id: string; date: string; mood: Mood; text: string };

export const SEED_ENTRIES: Entry[] = [];

type JournalState = {
  entries: Entry[];
  todayEntryId: string | null;
  upsertToday: (input: { date: string; mood: Mood; text: string }) => void;
  devReset: () => void;
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: SEED_ENTRIES.map((e) => ({ ...e })),
      todayEntryId: null,
      upsertToday: ({ date, mood, text }) => {
        const id = get().todayEntryId;
        if (id) {
          set((s) => ({
            entries: s.entries.map((e) => (e.id === id ? { ...e, date, mood, text } : e)),
          }));
        } else {
          const newId = "e" + Date.now();
          set((s) => ({
            entries: [{ id: newId, date, mood, text }, ...s.entries],
            todayEntryId: newId,
          }));
        }
      },
      devReset: () => set({ entries: [], todayEntryId: null }),
    }),
    { name: "powerplant-journal", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
