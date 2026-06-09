// powerplant/hooks/useTreeDemo.ts
//
// Timelapse-demo voor het Mijn boom-scherm (achter de dev-toggle). Bedoeld
// om vloeiende screenshots/screen-recordings te maken voor portfolio/promo.
//
// De dag-cyclus is de master-klok: de lucht scrollt continu door de dag, en
// telkens als een hele dag rond is gebeurt er "een dag verder":
//   • de volgroeide boom verhuist naar het bos (auto, zonder popup, andere soort),
//   • de streak loopt +1,
//   • er komt een vinkje bij in het week-grid en de "vandaag"-cursor schuift op.
// Gedurende elke dag groeit de boom in de pot stap voor stap door z'n 5 stadia.
//
// Na een volle week (7 dagen) groeit er nog één boom volgroeid in de pot als
// slotbeeld en stopt de demo op een warme avond-scene.
//
// Alles loopt op één interval dat netjes opgeruimd wordt als je stopt of
// weg-navigeert.

import { useEffect } from "react";
import { weekDays } from "../lib/dates";
import { SPECIES_COUNT } from "../lib/plantSprites";
import { useDailyProgressStore } from "../stores/useDailyProgressStore";
import { usePrefsStore } from "../stores/usePrefsStore";
import { PRESTIGE_THRESHOLD, useUserStore } from "../stores/useUserStore";

const WEEK_LEN = 7; // dagen die de demo afvinkt (ma..zo)

// Dag-cyclus: ~16 min per tick = een hele dag in ~5,4s. De lucht is de klok.
const TIME_TICK_MS = 60;
const TIME_STEP_MIN = 16;
const DAY_LEN = 1440;
const TIME_START_MIN = 6 * 60; // 06:00, ochtend
const TIME_END_MIN = 18.5 * 60; // 18:30, warme avond — slotbeeld

// Punten-doel op basis van hoe ver we door de dag zijn (0..1). Zo groeit de
// boom geleidelijk door z'n stadia en staat 'ie tegen het eind volgroeid.
function targetForProgress(p: number): number {
  if (p >= 0.9) return PRESTIGE_THRESHOLD; // klaar om het bos in te gaan
  if (p >= 0.72) return 600; // stadium 5
  if (p >= 0.54) return 450; // stadium 4
  if (p >= 0.36) return 300; // stadium 3
  if (p >= 0.18) return 150; // stadium 2
  return 0; // stadium 1 (zaailing)
}

export function useTreeDemo() {
  const demoPlaying = usePrefsStore((s) => s.demoPlaying);
  const setDemoPlaying = usePrefsStore((s) => s.setDemoPlaying);
  const setDemoDateKey = usePrefsStore((s) => s.setDemoDateKey);
  const setWindowOverrideMinutes = usePrefsStore((s) => s.setWindowOverrideMinutes);

  useEffect(() => {
    if (!demoPlaying) return;

    const daily = useDailyProgressStore.getState();

    // Schone lei zodat elke opname identiek begint.
    useUserStore.getState().devReset(); // punten/stadium/streak/bos → 0, verse soort
    daily.devReset(); // week-historie leegmaken

    // De zeven dagen (ma..zo) van de huidige week; de demo loopt hier dag
    // voor dag doorheen via een gesimuleerde "vandaag".
    const weekDates = weekDays(new Date());
    let dayCursor = 0;
    setDemoDateKey(weekDates[0]);
    setWindowOverrideMinutes(TIME_START_MIN);

    let cancelled = false;
    let finishing = false;
    let traveled = 0; // verstreken demo-minuten sinds de start
    let completedDays = 0; // hoeveel hele dagen rond zijn
    let lastTarget = 0; // laatst toegepaste punten-doel (voorkomt spam)
    let recordedToday = false; // is het doel van de huidige dag al "gedaan"?
    let finishTimeout: ReturnType<typeof setTimeout> | null = null;

    const applyTarget = (target: number) => {
      if (target === lastTarget) return;
      const cur = useUserStore.getState().points;
      useUserStore.getState().addPoints(target - cur, 0);
      lastTarget = target;
    };

    const timeId = setInterval(() => {
      if (cancelled || finishing) return;

      traveled += TIME_STEP_MIN;
      setWindowOverrideMinutes((TIME_START_MIN + traveled) % DAY_LEN);

      const daysRound = Math.floor(traveled / DAY_LEN);
      const p = (traveled % DAY_LEN) / DAY_LEN;
      const onShowcaseDay = completedDays >= WEEK_LEN;

      // Dag rond? → de volgroeide boom verhuist naar het bos en een nieuwe
      // dag begint (verse zaailing, nog geen doel gedaan).
      if (daysRound > completedDays && !onShowcaseDay) {
        completedDays = daysRound;
        const st = useUserStore.getState();
        st.completePrestige((st.currentSpecies + 1) % SPECIES_COUNT); // andere soort
        lastTarget = 0;
        recordedToday = false;
        if (dayCursor < weekDates.length - 1) {
          dayCursor++;
          setDemoDateKey(weekDates[dayCursor]); // "vandaag" schuift op
        }
        return;
      }

      if (onShowcaseDay) {
        // Slotdag: boom groeit volgroeid in de pot (geen prestige) en blijft
        // staan als eindbeeld.
        applyTarget(Math.min(600, targetForProgress(p)));
        if (lastTarget >= 600) {
          finishing = true;
          finishTimeout = setTimeout(() => {
            clearInterval(timeId);
            setWindowOverrideMinutes(TIME_END_MIN);
            setDemoPlaying(false);
          }, 900);
        }
        return;
      }

      // Gewone dag: laat de boom met de dag meegroeien. Zodra de boom z'n
      // eerste punten van de dag krijgt (= doel gedaan) komt het vinkje op de
      // huidige dag en loopt de streak één omhoog.
      applyTarget(targetForProgress(p));
      if (!recordedToday && lastTarget >= 150 && dayCursor < weekDates.length) {
        daily.recordDay(weekDates[dayCursor], 3, 3);
        useUserStore.getState().bumpStreak(1);
        recordedToday = true;
      }
    }, TIME_TICK_MS);

    return () => {
      cancelled = true;
      clearInterval(timeId);
      if (finishTimeout) clearTimeout(finishTimeout);
    };
  }, [demoPlaying, setDemoPlaying, setDemoDateKey, setWindowOverrideMinutes]);
}
