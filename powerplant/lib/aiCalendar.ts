// ============================================================
// AI CALENDAR — boundary module for a teammate's epic.
//
// This file is the only contact point between the Planning
// screen and the AI calendar feature. A teammate replaces the
// function bodies below with real logic; if the public API
// stays the same, no other files have to change.
//
// PUBLIC API
//   type PlanTone        — visual category for a block
//   type PlanBlock       — one entry in the day timeline
//   type PlanSuggestion  — the warm hint card under the timeline
//   getPlannedDay()      — list of blocks shown in Planning
//   getSuggestion()      — current suggestion, or null if none
//
// The screen calls these on every render. If/when the
// implementation becomes async or data-driven, switch the
// return types to Promises (or expose a hook) and update
// `planning.tsx` accordingly.
// ============================================================

export type PlanTone = "primary" | "bark" | "warm" | "neutral";

export type PlanBlock = {
  time: string; // "08:30"
  label: string; // "Wandeling"
  sub: string; // short detail, e.g. "15 min"
  emoji: string;
  tone: PlanTone;
};

export type PlanSuggestion = {
  text: string;
  primaryAction?: { label: string };
  dismissAction?: { label: string };
};

// --- Placeholder implementations -------------------------------
// Replace these with real logic when the AI calendar epic lands.

const PLACEHOLDER_BLOCKS: PlanBlock[] = [
  { time: "08:30", label: "Wandeling", sub: "15 min", emoji: "🚶", tone: "primary" },
  { time: "10:00", label: "School", sub: "tot 12:30", emoji: "📚", tone: "bark" },
  { time: "13:00", label: "Studeerblok", sub: "45 min focus", emoji: "🎯", tone: "primary" },
  { time: "17:30", label: "Eten", sub: "rustig moment", emoji: "🍽️", tone: "neutral" },
  { time: "20:30", label: "Rustmoment", sub: "ademen · 10 min", emoji: "🧘", tone: "warm" },
];

export function getPlannedDay(): PlanBlock[] {
  return PLACEHOLDER_BLOCKS;
}

export function getSuggestion(): PlanSuggestion | null {
  // Suggestions come from the AI calendar epic; return null until
  // that work lands so the Planning screen renders the "in progress"
  // placeholder card instead of fake content.
  return null;
}
