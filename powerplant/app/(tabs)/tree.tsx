// powerplant/app/(tabs)/tree.tsx
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { Forest } from "../../components/Forest";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { WindowControls } from "../../components/WindowControls";
import { getISOWeek, todayKey, weekDays } from "../../lib/dates";
import { nowMinutes } from "../../lib/skyScene";
import { useDailyProgressStore } from "../../stores/useDailyProgressStore";
import { usePrefsStore } from "../../stores/usePrefsStore";
import {
  PRESTIGE_THRESHOLD,
  STAGE_LABELS,
  STAGE_THRESHOLDS,
  useUserStore,
} from "../../stores/useUserStore";

// Visual cue per stage transition + the prestige milestone. Indexes
// align with `treeStage` (1..5) → STAGE_EMOJI[treeStage] is the emoji
// for the NEXT stage you'll reach (i.e. emoji at index 1 = stage 2).
const STAGE_EMOJI = ["", "🌱", "🌿", "🪴", "🌳"] as const;
const PRESTIGE_EMOJI = "🌳";

const WEEKDAY_INITIALS = ["m", "d", "w", "d", "v", "z", "z"] as const;

type CellState = "done" | "skip" | "today" | "future" | "today-done";

function cellState(
  date: string,
  today: string,
  goalsDoneToday: number,
  record: { goalsDone: number; goalsTotal: number } | undefined,
): CellState {
  if (date > today) return "future";
  if (date === today) return goalsDoneToday > 0 ? "today-done" : "today";
  if (record && record.goalsDone >= 1) return "done";
  return "skip";
}

export default function MijnBoom() {
  const points = useUserStore((s) => s.points);
  const treeStage = useUserStore((s) => s.treeStage);
  const currentSpecies = useUserStore((s) => s.currentSpecies);
  const plantedTrees = useUserStore((s) => s.plantedTrees);
  const bomenGeplant = useUserStore((s) => s.bomenGeplant);
  const streak = useUserStore((s) => s.streak);
  const goals = useUserStore((s) => s.goals);
  const history = useDailyProgressStore((s) => s.history);
  const showWindowControls = usePrefsStore((s) => s.showWindowControls);
  const windowOverrideMinutes = usePrefsStore((s) => s.windowOverrideMinutes);
  const setWindowOverrideMinutes = usePrefsStore((s) => s.setWindowOverrideMinutes);
  const { width: screenW } = useWindowDimensions();

  // Live device clock for the window scene; ticks once a minute (the
  // atmosphere changes gradually, so that is smooth enough and free).
  const [liveMinutes, setLiveMinutes] = useState(nowMinutes);
  useEffect(() => {
    const id = setInterval(() => setLiveMinutes(nowMinutes()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Manual override (slider/play) wins; otherwise follow the live clock.
  const sceneMinutes = windowOverrideMinutes ?? liveMinutes;

  const today = todayKey();
  const weekNumber = getISOWeek(new Date());

  const goalsDoneToday = goals.filter((g) => g.done).length;

  const week = useMemo(() => {
    const days = weekDays(new Date());
    return days.map((date, i) => {
      const record = history.find((r) => r.date === date);
      const state = cellState(date, today, goalsDoneToday, record);
      return { date, state, letter: WEEKDAY_INITIALS[i] };
    });
  }, [history, today, goalsDoneToday]);

  // "Days with progress this week" / "days elapsed in this week so far"
  const elapsed = week.filter((d) => d.date <= today).length;
  const completed = week.filter(
    (d) => d.state === "done" || d.state === "today-done",
  ).length;

  // Volgende beloning: the next REAL milestone in the prestige system —
  // either the next stage of the current tree (1→2, 2→3, …, 4→5) or the
  // prestige threshold that plants the mature tree in the forest.
  const nextMilestone = (() => {
    if (treeStage < 5) {
      const nextStageIdx = treeStage; // STAGE_THRESHOLDS is 0-indexed
      const threshold = STAGE_THRESHOLDS[nextStageIdx];
      const base = STAGE_THRESHOLDS[nextStageIdx - 1] ?? 0;
      return {
        label: `Stadium ${treeStage + 1}: ${STAGE_LABELS[nextStageIdx]}`,
        sub: `Nog ${threshold - points} punten om je boom te laten groeien`,
        emoji: STAGE_EMOJI[nextStageIdx],
        threshold,
        base,
      };
    }
    // Stage 5 → next prestige
    const base = STAGE_THRESHOLDS[4];
    return {
      label: "Boom planten in je bos",
      sub: `Nog ${PRESTIGE_THRESHOLD - points} punten tot je volgende prestige`,
      emoji: PRESTIGE_EMOJI,
      threshold: PRESTIGE_THRESHOLD,
      base,
    };
  })();
  const rewardProgress = Math.max(
    0,
    Math.min(1, (points - nextMilestone.base) / (nextMilestone.threshold - nextMilestone.base)),
  );

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row items-center justify-between mb-2">
        <Text className="text-white text-2xl font-extrabold">Mijn boom</Text>
        <Mascot size={36} />
      </View>

      <ScrollView contentContainerClassName="px-5 pt-2 pb-32">
        {/* Window scene: wooden frame, sill with the user's growing tree
            in a pot, view of the landscape + planted-forest behind the
            glass. Time of day auto-detected from the device clock. */}
        <View className="mb-3">
          <Forest
            trees={plantedTrees}
            width={screenW - 40}
            mainSpecies={currentSpecies}
            mainStage={treeStage}
            minutes={sceneMinutes}
          />
        </View>

        {showWindowControls && (
          <WindowControls
            sceneMinutes={sceneMinutes}
            isAuto={windowOverrideMinutes === null}
            onScrub={setWindowOverrideMinutes}
            onAuto={() => setWindowOverrideMinutes(null)}
          />
        )}
        <Text className="text-center text-white/55 text-xs mb-4">
          {bomenGeplant === 0
            ? "Nog geen bomen geplant — laat deze eerst volgroeien."
            : `Je hebt ${bomenGeplant} ${bomenGeplant === 1 ? "boom" : "bomen"} geplant in je bos.`}
        </Text>

        <View className="flex-row gap-2 mb-5">
          <GlassCard className="flex-1 p-3 items-center">
            <Text className="text-white/55 text-[10px] font-bold uppercase tracking-widest">
              Punten
            </Text>
            <Text className="text-white text-2xl font-extrabold tabular-nums">{points}</Text>
          </GlassCard>
          <GlassCard className="flex-1 p-3 items-center">
            <Text className="text-white/55 text-[10px] font-bold uppercase tracking-widest">
              Streak
            </Text>
            <Text className="text-white text-2xl font-extrabold tabular-nums">
              {streak} <Text className="text-base">dgn</Text>
            </Text>
          </GlassCard>
          <GlassCard className="flex-1 p-3 items-center">
            <Text className="text-white/55 text-[10px] font-bold uppercase tracking-widest">
              Deze week
            </Text>
            <Text className="text-white text-2xl font-extrabold tabular-nums">
              {completed}/{elapsed}
            </Text>
          </GlassCard>
        </View>

        <GlassCard className="p-4 mb-4">
          <View className="flex-row justify-between mb-3">
            <Text className="text-white font-extrabold text-sm">Deze week</Text>
            <Text className="text-white/45 text-xs font-bold">week {weekNumber}</Text>
          </View>
          <View className="flex-row" style={{ gap: 6 }}>
            {week.map((d, i) => {
              const isToday = d.state === "today" || d.state === "today-done";
              const isDone = d.state === "done" || d.state === "today-done";
              const isFuture = d.state === "future";
              return (
                <View key={d.date} className="flex-1 items-center" style={{ gap: 6 }}>
                  <Text
                    className={`text-[10px] font-bold ${
                      isToday ? "text-white" : "text-white/45"
                    }`}
                  >
                    {d.letter}
                  </Text>
                  <View
                    className={`w-9 h-9 rounded-2xl items-center justify-center ${
                      isDone
                        ? "bg-primary"
                        : isToday
                          ? "border-2 border-primary-soft bg-primary/15"
                          : "bg-white/10"
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        isFuture ? "text-white/30" : "text-white"
                      }`}
                    >
                      {isDone ? "✓" : isFuture ? "—" : "·"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {elapsed > 0 && (
          <GlassCard variant="warm" className="p-4 mb-4">
            <Text className="text-white text-sm font-semibold leading-snug">
              {completed === 0
                ? "Nog geen dagen met voortgang deze week. Begin klein — vandaag is een goed moment."
                : completed === elapsed
                  ? `Mooi werk! Je hebt elke dag deze week iets gedaan (${completed} van ${elapsed}). 🌱`
                  : (
                    <>
                      Je hebt{" "}
                      <Text className="text-yellow font-extrabold">
                        {completed} van de {elapsed}
                      </Text>{" "}
                      dagen iets afgevinkt. Dat is sterke groei. 🌱
                    </>
                  )}
            </Text>
          </GlassCard>
        )}

        <GlassCard className="p-4 mb-4">
          <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-2">
            Volgende beloning
          </Text>
          <View className="flex-row items-center gap-4">
            <View className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 items-center justify-center">
              <Text style={{ fontSize: 28 }}>{nextMilestone.emoji}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-bold">{nextMilestone.label}</Text>
              <Text className="text-white/55 text-xs">{nextMilestone.sub}</Text>
              <View className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary-soft rounded-full"
                  style={{ width: `${Math.round(rewardProgress * 100)}%` }}
                />
              </View>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}
