// powerplant/app/(tabs)/tree.tsx
import { useMemo } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { Forest } from "../../components/Forest";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { getISOWeek, todayKey, weekDays } from "../../lib/dates";
import { useDailyProgressStore } from "../../stores/useDailyProgressStore";
import { usePrefsStore } from "../../stores/usePrefsStore";
import { useUserStore } from "../../stores/useUserStore";

// Cumulative-points milestones, lowest unmet is shown as "Volgende beloning".
type Reward = { points: number; label: string; emoji: string };
const REWARDS: Reward[] = [
  { points: 100, label: "Een vlinder voor je boom", emoji: "🦋" },
  { points: 200, label: "Een bloemenkrans rond de boom", emoji: "🌸" },
  { points: 350, label: "Een vogel op de boomtak", emoji: "🐦" },
  { points: 500, label: "Een poel naast de boom", emoji: "💧" },
  { points: 750, label: "Een hertje in de wei", emoji: "🦌" },
  { points: 1000, label: "Een berglandschap op de achtergrond", emoji: "⛰️" },
];

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
  const tijdOverride = usePrefsStore((s) => s.tijdOverride);
  const { width: screenW } = useWindowDimensions();

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

  // Volgende beloning: first reward whose threshold the user hasn't reached
  const nextReward = REWARDS.find((r) => points < r.points);
  const prevReward = nextReward
    ? [...REWARDS].reverse().find((r) => r.points < nextReward.points && points >= r.points)
    : undefined;
  const rewardBase = prevReward?.points ?? 0;
  const rewardProgress = nextReward
    ? Math.max(0, Math.min(1, (points - rewardBase) / (nextReward.points - rewardBase)))
    : 1;

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
            timeOfDay={tijdOverride === "auto" ? undefined : tijdOverride}
          />
        </View>
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
          {nextReward ? (
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 items-center justify-center">
                <Text style={{ fontSize: 28 }}>{nextReward.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-bold">{nextReward.label}</Text>
                <Text className="text-white/55 text-xs">
                  Nog {nextReward.points - points} punten te gaan
                </Text>
                <View className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary-soft rounded-full"
                    style={{ width: `${Math.round(rewardProgress * 100)}%` }}
                  />
                </View>
              </View>
            </View>
          ) : (
            <Text className="text-white/80 text-sm">
              Alle beloningen zijn vrijgespeeld 🌳 — jij bent al een hele boom op zich.
            </Text>
          )}
        </GlassCard>
      </ScrollView>
    </View>
  );
}
