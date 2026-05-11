import { act } from "@testing-library/react-native";
import { useJournalStore, SEED_ENTRIES, Mood } from "../../stores/useJournalStore";

beforeEach(() =>
  useJournalStore.setState({
    entries: SEED_ENTRIES.map((e) => ({ ...e })),
    todayEntryId: null,
  }),
);

describe("useJournalStore", () => {
  it("seeds three prototype entries", () => {
    expect(useJournalStore.getState().entries).toHaveLength(3);
  });

  it("upsertToday creates a new entry on first save", () => {
    act(() =>
      useJournalStore
        .getState()
        .upsertToday({ date: "do 11 mei", mood: "rustig" as Mood, text: "Hi" }),
    );
    const s = useJournalStore.getState();
    expect(s.entries[0].text).toBe("Hi");
    expect(s.entries[0].mood).toBe("rustig");
    expect(s.todayEntryId).toBe(s.entries[0].id);
  });

  it("upsertToday updates the same entry on subsequent saves", () => {
    act(() =>
      useJournalStore.getState().upsertToday({ date: "do 11 mei", mood: "rustig", text: "A" }),
    );
    const id = useJournalStore.getState().todayEntryId;
    act(() =>
      useJournalStore.getState().upsertToday({ date: "do 11 mei", mood: "blij", text: "B" }),
    );
    const s = useJournalStore.getState();
    expect(s.todayEntryId).toBe(id);
    expect(s.entries.find((e) => e.id === id)?.text).toBe("B");
  });
});
