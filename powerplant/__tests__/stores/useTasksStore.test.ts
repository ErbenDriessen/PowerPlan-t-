import { act } from "@testing-library/react-native";
import { useTasksStore, SEED_TASKS } from "../../stores/useTasksStore";

beforeEach(() => useTasksStore.setState({ today: SEED_TASKS.map((t) => ({ ...t })) }));

describe("useTasksStore", () => {
  it("seeds three tasks matching the prototype", () => {
    const t = useTasksStore.getState().today;
    expect(t).toHaveLength(3);
    expect(t[0].label).toBe("Wandeling");
    expect(t[1].label).toBe("Studeerblok");
    expect(t[2].label).toBe("Rustmoment");
    expect(t.every((x) => x.done === false)).toBe(true);
  });

  it("toggleTask flips done", () => {
    act(() => useTasksStore.getState().toggleTask("1"));
    expect(useTasksStore.getState().today[0].done).toBe(true);
    act(() => useTasksStore.getState().toggleTask("1"));
    expect(useTasksStore.getState().today[0].done).toBe(false);
  });
});
