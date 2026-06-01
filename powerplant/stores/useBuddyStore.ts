import { create } from "zustand";
import { clearToken } from "../features/buddy/api/buddyApi";
import type { User } from "../features/buddy/types";

type BuddyStoreState = {
  currentUser: User | null;
  isLoggedIn: boolean;
  setCurrentUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

export const useBuddyStore = create<BuddyStoreState>((set) => ({
  currentUser: null,
  isLoggedIn: false,
  setCurrentUser: (user) => set({ currentUser: user, isLoggedIn: user !== null }),
  logout: async () => {
    await clearToken();
    set({ currentUser: null, isLoggedIn: false });
  },
}));
