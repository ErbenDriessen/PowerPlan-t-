import { act } from "@testing-library/react-native";
import { useFocusStore } from "../../stores/useFocusStore";

beforeEach(() =>
  useFocusStore.setState({
    dur: 25,
    brk: 5,
    rnds: 4,
    running: false,
    isBreak: false,
    currentRnd: 1,
    remaining: 0,
    total: 0,
    finished: false,
  }),
);

describe("useFocusStore", () => {
  it("starts a focus session in work mode", () => {
    act(() => useFocusStore.getState().start());
    const s = useFocusStore.getState();
    expect(s.running).toBe(true);
    expect(s.isBreak).toBe(false);
    expect(s.currentRnd).toBe(1);
    expect(s.remaining).toBe(25 * 60);
    expect(s.total).toBe(25 * 60);
    expect(s.finished).toBe(false);
  });

  it("tick decrements remaining", () => {
    act(() => useFocusStore.getState().start());
    act(() => useFocusStore.getState().tick());
    expect(useFocusStore.getState().remaining).toBe(25 * 60 - 1);
  });

  it("nextPhase after work goes to break", () => {
    act(() => useFocusStore.getState().start());
    act(() => useFocusStore.getState().nextPhase());
    const s = useFocusStore.getState();
    expect(s.isBreak).toBe(true);
    expect(s.remaining).toBe(5 * 60);
    expect(s.currentRnd).toBe(1);
  });

  it("nextPhase after break advances round and goes back to work", () => {
    act(() => useFocusStore.getState().start());
    act(() => useFocusStore.getState().nextPhase()); // → break
    act(() => useFocusStore.getState().nextPhase()); // → next work
    const s = useFocusStore.getState();
    expect(s.isBreak).toBe(false);
    expect(s.currentRnd).toBe(2);
  });

  it("nextPhase after the last break marks finished", () => {
    useFocusStore.setState({ rnds: 2 });
    act(() => useFocusStore.getState().start());
    act(() => useFocusStore.getState().nextPhase()); // r1 break
    act(() => useFocusStore.getState().nextPhase()); // r2 work
    act(() => useFocusStore.getState().nextPhase()); // r2 break
    act(() => useFocusStore.getState().nextPhase()); // done
    expect(useFocusStore.getState().finished).toBe(true);
    expect(useFocusStore.getState().running).toBe(false);
  });

  it("stop resets the session", () => {
    act(() => useFocusStore.getState().start());
    act(() => useFocusStore.getState().stop());
    expect(useFocusStore.getState().running).toBe(false);
    expect(useFocusStore.getState().remaining).toBe(0);
  });
});
