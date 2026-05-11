import { formatDateNL, getISOWeek, greetingForHour } from "../../lib/dates";

describe("formatDateNL", () => {
  it("formats a known Monday", () => {
    // 2026-05-11 is a Monday
    expect(formatDateNL(new Date(2026, 4, 11))).toBe("ma 11 mei");
  });

  it("formats a known Sunday", () => {
    // 2026-01-04 is a Sunday
    expect(formatDateNL(new Date(2026, 0, 4))).toBe("zo 4 jan");
  });

  it("uses short month names", () => {
    expect(formatDateNL(new Date(2026, 11, 31))).toBe("do 31 dec");
  });
});

describe("getISOWeek", () => {
  it("returns 1 for early January days in week 1", () => {
    // 2024-01-04 is a Thursday in ISO week 1 of 2024
    expect(getISOWeek(new Date(2024, 0, 4))).toBe(1);
  });

  it("returns 20 for mid-May 2026", () => {
    // 2026-05-11 falls in ISO week 20 (week 19 starts Mon 2026-05-04, week 20 starts Mon 2026-05-11)
    expect(getISOWeek(new Date(2026, 4, 11))).toBe(20);
  });

  it("handles year-edge dates", () => {
    // 2024-12-30 (Mon) is ISO week 1 of 2025
    expect(getISOWeek(new Date(2024, 11, 30))).toBe(1);
  });
});

describe("greetingForHour", () => {
  it("returns Goedemorgen for 5-11", () => {
    expect(greetingForHour(5)).toBe("Goedemorgen");
    expect(greetingForHour(8)).toBe("Goedemorgen");
    expect(greetingForHour(11)).toBe("Goedemorgen");
  });

  it("returns Goedemiddag for 12-17", () => {
    expect(greetingForHour(12)).toBe("Goedemiddag");
    expect(greetingForHour(17)).toBe("Goedemiddag");
  });

  it("returns Goedenavond for 18-23 and 0-4", () => {
    expect(greetingForHour(18)).toBe("Goedenavond");
    expect(greetingForHour(23)).toBe("Goedenavond");
    expect(greetingForHour(0)).toBe("Goedenavond");
    expect(greetingForHour(4)).toBe("Goedenavond");
  });
});
