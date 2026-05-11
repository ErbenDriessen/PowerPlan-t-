import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Task = {
  id: string;
  label: string;
  sub: string;
  time: string;
  done: boolean;
};

export const SEED_TASKS: Task[] = [
  { id: "1", label: "Wandeling", sub: "15 min · buiten", time: "08:30", done: false },
  { id: "2", label: "Studeerblok", sub: "45 min focus", time: "13:00", done: false },
  { id: "3", label: "Rustmoment", sub: "ademhalen of mediteren", time: "20:30", done: false },
];

type TasksState = {
  today: Task[];
  toggleTask: (id: string) => void;
};

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      today: SEED_TASKS.map((t) => ({ ...t })),
      toggleTask: (id) =>
        set((s) => ({ today: s.today.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
    }),
    { name: "powerplant-tasks", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
