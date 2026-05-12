import {
  daysBetween,
  formatDateNL,
  getISOWeek,
  greetingForHour,
  todayKey,
  weekDays,
} from "../../lib/dates";

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

describe("todayKey", () => {
  it("formats as YYYY-MM-DD with zero-padding", () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(todayKey(new Date(2026, 4, 12))).toBe("2026-05-12");
    expect(todayKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("returns different keys for adjacent days", () => {
    expect(todayKey(new Date(2026, 4, 12))).not.toBe(todayKey(new Date(2026, 4, 13)));
  });
});

describe("daysBetween", () => {
  it("returns 1 for consecutive days", () => {
    expect(daysBetween("2026-05-11", "2026-05-12")).toBe(1);
  });

  it("returns 0 for the same day", () => {
    expect(daysBetween("2026-05-12", "2026-05-12")).toBe(0);
  });

  it("returns negative for going back in time", () => {
    expect(daysBetween("2026-05-12", "2026-05-11")).toBe(-1);
  });

  it("handles a multi-day gap including a month boundary", () => {
    expect(daysBetween("2026-04-30", "2026-05-03")).toBe(3);
  });

  it("handles a year boundary", () => {
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
  });
});

describe("weekDays", () => {
  it("returns Mon-Sun starting on Monday when today is Wednesday", () => {
    // 2026-05-13 is a Wednesday
    const days = weekDays(new Date(2026, 4, 13));
    expect(days).toEqual([
      "2026-05-11", // Mon
      "2026-05-12", // Tue
      "2026-05-13", // Wed (today)
      "2026-05-14", // Thu
      "2026-05-15", // Fri
      "2026-05-16", // Sat
      "2026-05-17", // Sun
    ]);
  });

  it("treats Sunday as the last day, not the first", () => {
    // 2026-05-17 is a Sunday
    const days = weekDays(new Date(2026, 4, 17));
    expect(days[0]).toBe("2026-05-11");
    expect(days[6]).toBe("2026-05-17");
  });

  it("crosses month boundaries cleanly", () => {
    // 2026-06-02 is a Tuesday — the Monday of that week is in May
    const days = weekDays(new Date(2026, 5, 2));
    expect(days[0]).toBe("2026-06-01");
    expect(days[6]).toBe("2026-06-07");
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
