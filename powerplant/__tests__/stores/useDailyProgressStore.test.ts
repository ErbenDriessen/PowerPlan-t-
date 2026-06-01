import { act } from "@testing-library/react-native";
import { useDailyProgressStore } from "../../stores/useDailyProgressStore";

beforeEach(() => useDailyProgressStore.setState({ history: [] }));

describe("useDailyProgressStore", () => {
  it("starts with an empty history", () => {
    expect(useDailyProgressStore.getState().history).toEqual([]);
  });

  it("recordDay prepends a new entry", () => {
    act(() => useDailyProgressStore.getState().recordDay("2026-05-11", 3, 2));
    act(() => useDailyProgressStore.getState().recordDay("2026-05-12", 3, 1));
    const h = useDailyProgressStore.getState().history;
    expect(h).toHaveLength(2);
    expect(h[0].date).toBe("2026-05-12");
    expect(h[1].date).toBe("2026-05-11");
  });

  it("recordDay overwrites an existing entry for the same date", () => {
    act(() => useDailyProgressStore.getState().recordDay("2026-05-12", 3, 1));
    act(() => useDailyProgressStore.getState().recordDay("2026-05-12", 3, 3));
    const h = useDailyProgressStore.getState().history;
    expect(h).toHaveLength(1);
    expect(h[0].goalsDone).toBe(3);
  });

  it("getRecord returns the matching entry or undefined", () => {
    act(() => useDailyProgressStore.getState().recordDay("2026-05-12", 2, 2));
    expect(useDailyProgressStore.getState().getRecord("2026-05-12")?.goalsDone).toBe(2);
    expect(useDailyProgressStore.getState().getRecord("2026-05-11")).toBeUndefined();
  });

  it("devReset wipes the history", () => {
    act(() => useDailyProgressStore.getState().recordDay("2026-05-12", 2, 1));
    act(() => useDailyProgressStore.getState().devReset());
    expect(useDailyProgressStore.getState().history).toEqual([]);
  });
});
