# Powerplan(t) — Functionality TODO

Everything in the v1 port that still lacks real functionality, organized by screen. Grouped roughly by severity at the top.

---

## 🔴 Bugs / wrong defaults (top of the list)

### Fresh-state seeding — app boots looking "already used"
The prototype's demo data was copied 1:1 into the stores. A new user opens the app and is greeted with 240 points, a 5-day streak, tree-stage 3, and three pre-existing dagboek entries. Should all be empty/zero on first launch.

- `stores/useUserStore.ts` defaults: change `points: 240 → 0`, `ringProgress: 0.6 → 0`, `treeStage: 3 → 1`, `streak: 5 → 0`.
- `stores/useJournalStore.ts` `SEED_ENTRIES`: replace with `[]`.
- Existing test fixtures in `__tests__/stores/*.test.ts` will need to be updated to match the new defaults.

(Note: `useTasksStore` was removed — Home now reads goals directly from `useUserStore`.)

### Dagboek: today's entry never moves to "Eerder geschreven"
There's no day-rollover. `todayEntryId` is set on first save and never cleared. An entry written today still shows as "Vandaag" tomorrow, next week, forever.

Fix sketch: on store hydration (or on dagboek-screen mount), read the entry referenced by `todayEntryId`, compare its `date` to today's date; if different, set `todayEntryId = null`. Then the old entry naturally falls into the "Eerder geschreven" list.

### Tree never grows
Nothing converts `points` into `treeStage`. The Mijn-boom screen shows the tree at whatever stage is in the store (currently the seeded `3`), and no code updates it. Need a function like `pointsToStage(points): 1..7` and call it whenever points change (or derive on read).

### Streak is not tracked
`streak` is a stored value but nothing increments or resets it. Needs logic that fires once per day: if user completed at least N tasks yesterday → +1, else → 0.

---

## 🟡 Hardcoded / static data (looks dynamic but isn't)

### Dates everywhere are hardcoded to "do 11 mei"
- `app/(tabs)/home.tsx` — "do · 11 mei" pill
- `app/(tabs)/home.tsx` — greeting "Goedemorgen" is fixed (should pick morgen/middag/avond by time of day)
- `app/dagboek/index.tsx` — today's card header "Vandaag · do 11 mei"
- `app/dagboek/writer.tsx` — `date: "do 11 mei"` passed to `upsertToday`
- `app/(tabs)/tree.tsx` — "week 19" badge

Need a `formatDate(d: Date): string` helper that returns Dutch day abbreviations like "do 11 mei" + a `formatWeek(d): string` that returns "week N".

### Home: bedtime card subtitle
"We dimmen alles vanaf 22:30" is literally that string. Should be computed from the user's actual bedtime (e.g. bedtime minus 45 min).

### Home: tree-stage label
"🌿 Jonge boom" is hardcoded. Should map from `treeStage` (1=zaadje, 2=spruit, 3=jonge boom, 4–7=…).

### Planning: day timeline
The entire `TIMELINE` array (Wandeling 08:30 → Rustmoment 20:30) is hardcoded. This whole screen is supposed to be the output of the AI calendar epic that a teammate is taking. For now it just shows the prototype's example day to anyone, every day.

### Planning: AI suggestion card
"Je planning is best vol. Zullen we het studeerblok inkorten?" — static text. Also part of the AI calendar epic.

### Mijn boom: weekly stats
All hardcoded:
- "12/15" weekly score
- The 7-day grid (m✓ d✓ w· d✓ v(today) z— z—) — none of it derives from actual completed tasks
- "Je hebt 4 van de 5 dagen je planning gevolgd" encouragement text
- "Volgende beloning" butterfly + "Nog 60 punten te gaan" + 80% progress bar

These should all derive from real data: completed tasks per day, points history, a defined reward ladder.

---

## ⚪ No-op buttons and dead ends

### Planning
- Goal list rows render a green-checked circle but tapping does nothing. Was supposed to toggle "completed this week".
- "+ Doel toevoegen" row at bottom — no handler.
- "Verplaatsen" button on AI suggestion card — no handler.
- "Laat zo" button — no handler.
- "⋮⋮" drag handles render but don't drag.

### Home
- Mascot in the app bar should open Settings (per spec). Currently no `onPress`.
- "+ Doel toevoegen" CTA at the bottom navigates to Planning, but Planning has no way to add a goal.

### Settings (Meer)
- Profile row "›" arrow at the right does nothing. Was supposed to open a "change name" flow.
- Toggles persist correctly but don't actually influence anything:
  - **Geluid:** no audio is played anywhere in the app yet anyway.
  - **Meldingen:** no notifications are scheduled (expo-notifications not installed).
  - **Donkere modus:** the app is always dark-themed; no light mode exists.
  - **Bedtijd-herinnering:** no notification logic.
- "Doelen aanpassen" → routes to Planning, which doesn't have an edit mode.
- "Gegevens exporteren" — no handler.
- "Over Powerplan(t)" — no handler.

---

## 🟢 Polish / feature gaps

### Onboarding
- No way to go back to a previous step (only forward + Overslaan).
- Empty name + Verder silently passes (falls back to "Vriend" in `finishOnboarding`). Probably should require a name or stay on step 1.

### Focus
- Spec mentioned a celebration "bloom" message after each work block ("Goed gedaan. Je boom groeit 🌿"). Not implemented — deferred during planning.
- True phone-lock during focus — deferred (would require native Android kiosk code; iOS has no equivalent).

### Breathing
- Works as designed (4-7-8 × 4 rounds, auto-close).
- Minor: no abort mid-round besides "Sluiten ×" which dismisses entirely. Probably fine.

### Meditation
- No audio for "Stilte / Bos / Regen" — deferred (expo-av not installed).
- No pause/resume — only "Beëindigen" cancels.

### Dagboek
- Older entries are read-only — no edit, no delete.
- Save with empty text is allowed (only mood is required) — spec said "1 zin is genoeg" so probably fine.

### Cross-cutting
- No notifications anywhere (expo-notifications not installed).
- No audio (expo-av not installed).
- Haptics only on task toggle + focus start; could add on breathing cues, meditation phase changes, journal save, etc.
- No "reset app" for testing — currently needs uninstall/reinstall or manual AsyncStorage clear.

---

## Out of v1 scope (intentional — handled by teammates or future epics)

- Buddy / chat system (teammate epic)
- Actual AI calendar logic (teammate epic — only the static UI is in place)
- Tips & tricks chat-gpt-style search
- "Mooi ontwerp met veel kleur" or any non-dark theme (the brief explicitly bans bright colors)
