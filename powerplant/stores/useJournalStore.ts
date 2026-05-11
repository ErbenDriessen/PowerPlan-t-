import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Mood = "moe" | "onrustig" | "rustig" | "blij" | "dankbaar";

export type Entry = { id: string; date: string; mood: Mood; text: string };

export const SEED_ENTRIES: Entry[] = [
  {
    id: "e1",
    date: "wo 10 mei",
    mood: "rustig",
    text: "Vandaag rustig gestudeerd. Eén hoofdstuk uit het werkboek. Niet boos op mezelf om wat ik niet deed.",
  },
  {
    id: "e2",
    date: "di 9 mei",
    mood: "moe",
    text: "Lange schooldag. Vroeg naar bed gegaan en dat voelde goed. Even mijn telefoon weggelegd.",
  },
  {
    id: "e3",
    date: "ma 8 mei",
    mood: "blij",
    text: "Wandeling met Mila gemaakt. Veel gelachen. Daarna ademhalingsoefening.",
  },
];

type JournalState = {
  entries: Entry[];
  todayEntryId: string | null;
  upsertToday: (input: { date: string; mood: Mood; text: string }) => void;
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
    }),
    { name: "powerplant-journal", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
