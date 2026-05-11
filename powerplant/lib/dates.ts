// Small date helpers for Dutch-language UI strings.
// Pure functions so they're easy to test.

const DAY_NL = ["zo", "ma", "di", "wo", "do", "vr", "za"] as const;
const MONTH_NL = [
  "jan",
  "feb",
  "mrt",
  "apr",
  "mei",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
] as const;

/**
 * Format a date as `"do 11 mei"` (Dutch short weekday + day + short month).
 */
export function formatDateNL(d: Date): string {
  return `${DAY_NL[d.getDay()]} ${d.getDate()} ${MONTH_NL[d.getMonth()]}`;
}

/**
 * ISO 8601 week number (1-53). Week 1 is the week containing the first Thursday
 * of the year, which matches what Dutch calendars use.
 */
export function getISOWeek(d: Date): number {
  // Work in UTC to avoid DST edge cases.
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayOfWeek = date.getUTCDay() || 7; // make Sunday = 7
  date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/**
 * Dutch greeting based on the hour of day:
 *   5..11  -> Goedemorgen
 *  12..17  -> Goedemiddag
 *  18..23  -> Goedenavond
 *   0..4   -> Goedenavond (still "evening" before bedtime)
 */
export function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return "Goedemorgen";
  if (hour >= 12 && hour < 18) return "Goedemiddag";
  return "Goedenavond";
}
