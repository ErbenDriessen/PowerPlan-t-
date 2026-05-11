// powerplant/__tests__/stores/useUserStore.test.ts
import { act } from "@testing-library/react-native";
import {
  pointsToNextThreshold,
  pointsToStage,
  STAGE_THRESHOLDS,
  useUserStore,
} from "../../stores/useUserStore";

beforeEach(() => {
  useUserStore.setState({
    name: "",
    goals: [],
    bedH: 23,
    bedM: 15,
    hasOnboarded: false,
    hasHydrated: false,
    points: 0,
    ringProgress: 0,
    treeStage: 1,
    streak: 0,
  });
});

describe("useUserStore", () => {
  it("starts with fresh defaults", () => {
    const s = useUserStore.getState();
    expect(s.name).toBe("");
    expect(s.points).toBe(0);
    expect(s.ringProgress).toBe(0);
    expect(s.treeStage).toBe(1);
    expect(s.streak).toBe(0);
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

  it("addPoints clamps ringProgress to [0,1] and recomputes treeStage", () => {
    act(() => useUserStore.getState().addPoints(50, 0.06));
    const s = useUserStore.getState();
    expect(s.points).toBe(50);
    expect(s.ringProgress).toBeCloseTo(0.06);
    expect(s.treeStage).toBe(2);
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

  it("pointsToStage maps each threshold band correctly", () => {
    expect(pointsToStage(0)).toBe(1);
    expect(pointsToStage(49)).toBe(1);
    expect(pointsToStage(50)).toBe(2);
    expect(pointsToStage(99)).toBe(2);
    expect(pointsToStage(100)).toBe(3);
    expect(pointsToStage(200)).toBe(4);
    expect(pointsToStage(350)).toBe(5);
    expect(pointsToStage(500)).toBe(6);
    expect(pointsToStage(750)).toBe(7);
    expect(pointsToStage(10_000)).toBe(7);
  });

  it("pointsToNextThreshold returns the next stage's cutoff or null at max", () => {
    expect(pointsToNextThreshold(0)).toBe(50);
    expect(pointsToNextThreshold(120)).toBe(200);
    expect(pointsToNextThreshold(500)).toBe(750);
    expect(pointsToNextThreshold(750)).toBeNull();
  });

  it("STAGE_THRESHOLDS has exactly 7 entries", () => {
    expect(STAGE_THRESHOLDS).toHaveLength(7);
    expect(STAGE_THRESHOLDS[0]).toBe(0);
  });

  it("devReset zeros points/ring/stage/streak but keeps profile fields", () => {
    useUserStore.setState({
      name: "Erben",
      goals: ["Minder stress"],
      points: 400,
      ringProgress: 0.8,
      treeStage: 5,
      streak: 7,
      hasOnboarded: true,
    });
    act(() => useUserStore.getState().devReset());
    const s = useUserStore.getState();
    expect(s.points).toBe(0);
    expect(s.ringProgress).toBe(0);
    expect(s.treeStage).toBe(1);
    expect(s.streak).toBe(0);
    // profile preserved
    expect(s.name).toBe("Erben");
    expect(s.goals).toEqual(["Minder stress"]);
    expect(s.hasOnboarded).toBe(true);
  });
});
