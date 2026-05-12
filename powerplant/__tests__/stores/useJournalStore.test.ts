import { act } from "@testing-library/react-native";
import { useJournalStore, SEED_ENTRIES, Mood } from "../../stores/useJournalStore";

beforeEach(() =>
  useJournalStore.setState({
    entries: SEED_ENTRIES.map((e) => ({ ...e })),
  }),
);

describe("useJournalStore", () => {
  it("starts with no entries", () => {
    expect(useJournalStore.getState().entries).toEqual([]);
  });

  it("addEntry inserts the new entry at the top and returns its id", () => {
    let id = "";
    act(() => {
      id = useJournalStore
        .getState()
        .addEntry({ date: "ma 12 mei", mood: "rustig" as Mood, text: "Hi" });
    });
    const s = useJournalStore.getState();
    expect(s.entries).toHaveLength(1);
    expect(s.entries[0].id).toBe(id);
    expect(s.entries[0].text).toBe("Hi");
    expect(s.entries[0].mood).toBe("rustig");
  });

  it("addEntry adds in newest-first order", () => {
    act(() => {
      useJournalStore
        .getState()
        .addEntry({ date: "zo 11 mei", mood: "moe", text: "A" });
    });
    act(() => {
      useJournalStore
        .getState()
        .addEntry({ date: "ma 12 mei", mood: "blij", text: "B" });
    });
    const e = useJournalStore.getState().entries;
    expect(e.map((x) => x.text)).toEqual(["B", "A"]);
  });

  it("updateEntry merges fields for the matching id", () => {
    let id = "";
    act(() => {
      id = useJournalStore
        .getState()
        .addEntry({ date: "ma 12 mei", mood: "rustig", text: "A" });
    });
    act(() => {
      useJournalStore.getState().updateEntry(id, { text: "B", mood: "blij" });
    });
    const e = useJournalStore.getState().entries[0];
    expect(e.text).toBe("B");
    expect(e.mood).toBe("blij");
    expect(e.date).toBe("ma 12 mei"); // unchanged
  });

  it("updateEntry is a no-op for an unknown id", () => {
    act(() => {
      useJournalStore
        .getState()
        .addEntry({ date: "ma 12 mei", mood: "rustig", text: "A" });
    });
    act(() => {
      useJournalStore.getState().updateEntry("nope", { text: "Z" });
    });
    expect(useJournalStore.getState().entries[0].text).toBe("A");
  });

  it("deleteEntry removes just the matching entry", () => {
    let aId = "";
    let bId = "";
    act(() => {
      aId = useJournalStore
        .getState()
        .addEntry({ date: "zo 11 mei", mood: "moe", text: "A" });
    });
    act(() => {
      bId = useJournalStore
        .getState()
        .addEntry({ date: "ma 12 mei", mood: "blij", text: "B" });
    });
    act(() => useJournalStore.getState().deleteEntry(aId));
    const e = useJournalStore.getState().entries;
    expect(e).toHaveLength(1);
    expect(e[0].id).toBe(bId);
  });

  it("devReset wipes all entries", () => {
    act(() => {
      useJournalStore
        .getState()
        .addEntry({ date: "ma 12 mei", mood: "blij", text: "Hi" });
    });
    expect(useJournalStore.getState().entries.length).toBe(1);
    act(() => useJournalStore.getState().devReset());
    expect(useJournalStore.getState().entries).toEqual([]);
  });
});
