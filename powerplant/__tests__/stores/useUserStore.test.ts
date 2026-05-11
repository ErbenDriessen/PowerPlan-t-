// powerplant/__tests__/stores/useUserStore.test.ts
import { act } from "@testing-library/react-native";
import { useUserStore } from "../../stores/useUserStore";

beforeEach(() => {
  useUserStore.setState({
    name: "",
    goals: [],
    bedH: 23,
    bedM: 15,
    hasOnboarded: false,
    hasHydrated: false,
    points: 240,
    ringProgress: 0.6,
    treeStage: 3,
    streak: 5,
  });
});

describe("useUserStore", () => {
  it("starts with prototype defaults", () => {
    const s = useUserStore.getState();
    expect(s.name).toBe("");
    expect(s.points).toBe(240);
    expect(s.bedH).toBe(23);
    expect(s.bedM).toBe(15);
    expect(s.hasOnboarded).toBe(false);
  });

  it("setName updates the name", () => {
    act(() => useUserStore.getState().setName("Erben"));
    expect(useUserStore.getState().name).toBe("Erben");
  });

  it("toggleGoal adds and removes a goal", () => {
    act(() => useUserStore.getState().toggleGoal("Minder stress"));
    expect(useUserStore.getState().goals).toEqual(["Minder stress"]);
    act(() => useUserStore.getState().toggleGoal("Minder stress"));
    expect(useUserStore.getState().goals).toEqual([]);
  });

  it("bumpHour wraps 0-23", () => {
    act(() => useUserStore.getState().bumpHour(1));
    expect(useUserStore.getState().bedH).toBe(0);
    act(() => useUserStore.getState().bumpHour(-1));
    expect(useUserStore.getState().bedH).toBe(23);
  });

  it("bumpMin steps by 15 and wraps 0-59", () => {
    act(() => useUserStore.getState().bumpMin(15));
    expect(useUserStore.getState().bedM).toBe(30);
    act(() => useUserStore.getState().bumpMin(15));
    act(() => useUserStore.getState().bumpMin(15));
    expect(useUserStore.getState().bedM).toBe(0);
  });

  it("addPoints clamps ringProgress to [0,1]", () => {
    act(() => useUserStore.getState().addPoints(10, 0.06));
    expect(useUserStore.getState().points).toBe(250);
    expect(useUserStore.getState().ringProgress).toBeCloseTo(0.66);
    act(() => useUserStore.getState().addPoints(0, 1));
    expect(useUserStore.getState().ringProgress).toBe(1);
  });

  it("finishOnboarding sets hasOnboarded true and defaults goals when empty", () => {
    act(() => useUserStore.getState().finishOnboarding());
    const s = useUserStore.getState();
    expect(s.hasOnboarded).toBe(true);
    expect(s.goals.length).toBeGreaterThan(0);
  });

  it("setHasHydrated flips the flag", () => {
    act(() => useUserStore.getState().setHasHydrated(true));
    expect(useUserStore.getState().hasHydrated).toBe(true);
  });
});
