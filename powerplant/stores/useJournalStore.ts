import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Mood = "moe" | "onrustig" | "rustig" | "blij" | "dankbaar";

export type Entry = { id: string; date: string; mood: Mood; text: string };

export const SEED_ENTRIES: Entry[] = [];

type JournalState = {
  entries: Entry[];
  addEntry: (input: { date: string; mood: Mood; text: string }) => string;
  updateEntry: (
    id: string,
    input: Partial<{ date: string; mood: Mood; text: string }>,
  ) => void;
  deleteEntry: (id: string) => void;
  devReset: () => void;
};

function newEntryId(): string {
  return "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: SEED_ENTRIES.map((e) => ({ ...e })),
      addEntry: ({ date, mood, text }) => {
        const id = newEntryId();
        set((s) => ({
          entries: [{ id, date, mood, text }, ...s.entries],
        }));
        return id;
      },
      updateEntry: (id, input) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...input } : e)),
        })),
      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      devReset: () => set({ entries: [] }),
    }),
    {
      name: "powerplant-journal",
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // v1 stored a todayEntryId field; ignore it on upgrade so the
      // new "all entries are equal" model takes over cleanly.
      migrate: (persisted: unknown) => {
        const obj = (persisted ?? {}) as Record<string, unknown>;
        return { entries: Array.isArray(obj.entries) ? obj.entries : [] };
      },
    },
  ),
);
