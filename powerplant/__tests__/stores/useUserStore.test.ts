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
    lastSeenDate: null,
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

  it("toggleGoal adds a goal-object by title and removes it on the second call", () => {
    act(() => useUserStore.getState().toggleGoal("Minder stress"));
    const after1 = useUserStore.getState().goals;
    expect(after1).toHaveLength(1);
    expect(after1[0].title).toBe("Minder stress");
    expect(after1[0].description).toBe("");
    expect(after1[0].done).toBe(false);
    expect(after1[0].id).toMatch(/^g/);

    act(() => useUserStore.getState().toggleGoal("Minder stress"));
    expect(useUserStore.getState().goals).toEqual([]);
  });

  it("toggleGoal can stash a description alongside the title", () => {
    act(() =>
      useUserStore
        .getState()
        .toggleGoal("Meer bewegen", "15 min wandelen na de lunch"),
    );
    const g = useUserStore.getState().goals[0];
    expect(g.title).toBe("Meer bewegen");
    expect(g.description).toBe("15 min wandelen na de lunch");
  });

  it("addGoal stores title + description, trims, skips empty + duplicates", () => {
    act(() =>
      useUserStore
        .getState()
        .addGoal({ title: "  Minder stress  ", description: "  ademen  " }),
    );
    let goals = useUserStore.getState().goals;
    expect(goals).toHaveLength(1);
    expect(goals[0].title).toBe("Minder stress");
    expect(goals[0].description).toBe("ademen");

    act(() => useUserStore.getState().addGoal({ title: "Minder stress" }));
    expect(useUserStore.getState().goals).toHaveLength(1);

    act(() => useUserStore.getState().addGoal({ title: "   " }));
    expect(useUserStore.getState().goals).toHaveLength(1);
  });

  it("updateGoal can change title and description, but refuses an empty title", () => {
    act(() => useUserStore.getState().addGoal({ title: "A", description: "" }));
    const id = useUserStore.getState().goals[0].id;

    act(() => useUserStore.getState().updateGoal(id, { title: "B", description: "X" }));
    const g = useUserStore.getState().goals[0];
    expect(g.title).toBe("B");
    expect(g.description).toBe("X");

    act(() => useUserStore.getState().updateGoal(id, { title: "   " }));
    expect(useUserStore.getState().goals[0].title).toBe("B");
  });

  it("removeGoal drops just the matching id", () => {
    act(() => useUserStore.getState().addGoal({ title: "A" }));
    act(() => useUserStore.getState().addGoal({ title: "B" }));
    act(() => useUserStore.getState().addGoal({ title: "C" }));
    const bId = useUserStore.getState().goals[1].id;
    act(() => useUserStore.getState().removeGoal(bId));
    expect(useUserStore.getState().goals.map((g) => g.title)).toEqual(["A", "C"]);
  });

  it("toggleGoalDone flips the done flag on the matching id", () => {
    act(() => useUserStore.getState().addGoal({ title: "A" }));
    const id = useUserStore.getState().goals[0].id;
    act(() => useUserStore.getState().toggleGoalDone(id));
    expect(useUserStore.getState().goals[0].done).toBe(true);
    act(() => useUserStore.getState().toggleGoalDone(id));
    expect(useUserStore.getState().goals[0].done).toBe(false);
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

  it("rolloverIfNewDay resets done flags and ringProgress on a new date", () => {
    useUserStore.setState({
      lastSeenDate: "2026-05-11",
      ringProgress: 0.7,
      streak: 2,
      goals: [
        { id: "g1", title: "A", description: "", done: true },
        { id: "g2", title: "B", description: "", done: true },
        { id: "g3", title: "C", description: "", done: false },
      ],
    });
    act(() => useUserStore.getState().rolloverIfNewDay("2026-05-12"));
    const s = useUserStore.getState();
    expect(s.lastSeenDate).toBe("2026-05-12");
    expect(s.ringProgress).toBe(0);
    expect(s.goals.every((g) => !g.done)).toBe(true);
    expect(s.streak).toBe(3); // gap === 1 and yesterday had done goals
  });

  it("rolloverIfNewDay is a no-op when the date matches", () => {
    useUserStore.setState({
      lastSeenDate: "2026-05-12",
      ringProgress: 0.4,
      streak: 5,
      goals: [{ id: "g1", title: "A", description: "", done: true }],
    });
    act(() => useUserStore.getState().rolloverIfNewDay("2026-05-12"));
    const s = useUserStore.getState();
    expect(s.ringProgress).toBe(0.4);
    expect(s.goals[0].done).toBe(true);
    expect(s.streak).toBe(5);
  });

  it("rolloverIfNewDay handles the first run (null lastSeenDate) without touching streak", () => {
    useUserStore.setState({
      lastSeenDate: null,
      ringProgress: 0,
      streak: 0,
      goals: [{ id: "g1", title: "A", description: "", done: false }],
    });
    act(() => useUserStore.getState().rolloverIfNewDay("2026-05-12"));
    const s = useUserStore.getState();
    expect(s.lastSeenDate).toBe("2026-05-12");
    expect(s.streak).toBe(0);
  });

  it("rolloverIfNewDay breaks the streak when yesterday had no done goals", () => {
    useUserStore.setState({
      lastSeenDate: "2026-05-11",
      streak: 4,
      goals: [
        { id: "g1", title: "A", description: "", done: false },
        { id: "g2", title: "B", description: "", done: false },
      ],
    });
    act(() => useUserStore.getState().rolloverIfNewDay("2026-05-12"));
    expect(useUserStore.getState().streak).toBe(0);
  });

  it("rolloverIfNewDay breaks the streak when a day was skipped", () => {
    useUserStore.setState({
      lastSeenDate: "2026-05-10",
      streak: 7,
      goals: [{ id: "g1", title: "A", description: "", done: true }],
    });
    act(() => useUserStore.getState().rolloverIfNewDay("2026-05-12"));
    expect(useUserStore.getState().streak).toBe(0);
  });

  it("simulateNextDay applies the same streak math without changing lastSeenDate", () => {
    useUserStore.setState({
      lastSeenDate: "2026-05-12",
      ringProgress: 0.4,
      streak: 1,
      goals: [{ id: "g1", title: "A", description: "", done: true }],
    });
    act(() => useUserStore.getState().simulateNextDay());
    const s = useUserStore.getState();
    expect(s.streak).toBe(2);
    expect(s.ringProgress).toBe(0);
    expect(s.goals[0].done).toBe(false);
    expect(s.lastSeenDate).toBe("2026-05-12"); // intentionally unchanged
  });

  it("simulateNextDay resets streak to 0 when nothing was done", () => {
    useUserStore.setState({
      streak: 3,
      goals: [{ id: "g1", title: "A", description: "", done: false }],
    });
    act(() => useUserStore.getState().simulateNextDay());
    expect(useUserStore.getState().streak).toBe(0);
  });

  it("resetGoalsDone clears all done flags and ringProgress without touching the date", () => {
    useUserStore.setState({
      lastSeenDate: "2026-05-12",
      ringProgress: 0.5,
      goals: [
        { id: "g1", title: "A", description: "", done: true },
        { id: "g2", title: "B", description: "", done: false },
      ],
    });
    act(() => useUserStore.getState().resetGoalsDone());
    const s = useUserStore.getState();
    expect(s.ringProgress).toBe(0);
    expect(s.goals.every((g) => !g.done)).toBe(true);
    expect(s.lastSeenDate).toBe("2026-05-12");
  });

  it("bumpStreak adjusts streak and clamps at zero", () => {
    act(() => useUserStore.getState().bumpStreak(3));
    expect(useUserStore.getState().streak).toBe(3);
    act(() => useUserStore.getState().bumpStreak(-1));
    expect(useUserStore.getState().streak).toBe(2);
    act(() => useUserStore.getState().bumpStreak(-99));
    expect(useUserStore.getState().streak).toBe(0);
  });

  it("devReset zeros points/ring/stage/streak but keeps profile fields", () => {
    useUserStore.setState({
      name: "Erben",
      goals: [{ id: "g1", title: "Minder stress", description: "", done: false }],
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
    expect(s.goals).toHaveLength(1);
    expect(s.goals[0].title).toBe("Minder stress");
    expect(s.hasOnboarded).toBe(true);
  });
});
