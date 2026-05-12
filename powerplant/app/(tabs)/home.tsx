// powerplant/app/(tabs)/home.tsx
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GhostButton, PrimaryButton } from "../../components/buttons";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { ProgressRing } from "../../components/ProgressRing";
import { TaskRow } from "../../components/TaskRow";
import { Tree } from "../../components/Tree";
import { formatDateNL, greetingForHour } from "../../lib/dates";
import { STAGE_LABELS, useUserStore } from "../../stores/useUserStore";

export default function Home() {
  const name = useUserStore((s) => s.name);
  const points = useUserStore((s) => s.points);
  const ringProgress = useUserStore((s) => s.ringProgress);
  const treeStage = useUserStore((s) => s.treeStage);
  const bedH = useUserStore((s) => s.bedH);
  const bedM = useUserStore((s) => s.bedM);
  const addPoints = useUserStore((s) => s.addPoints);

  const goals = useUserStore((s) => s.goals);
  const toggleGoalDone = useUserStore((s) => s.toggleGoalDone);

  const onToggle = (id: string) => {
    const wasDone = goals.find((g) => g.id === id)?.done;
    toggleGoalDone(id);
    addPoints(wasDone ? -10 : 10, wasDone ? -0.06 : 0.06);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const bed = `${String(bedH).padStart(2, "0")}:${String(bedM).padStart(2, "0")}`;
  // Wind-down starts 45 min before bedtime; wrap minutes/hours cleanly.
  const windDownTotal = (bedH * 60 + bedM - 45 + 24 * 60) % (24 * 60);
  const windDownH = Math.floor(windDownTotal / 60);
  const windDownM = windDownTotal % 60;
  const windDown = `${String(windDownH).padStart(2, "0")}:${String(windDownM).padStart(2, "0")}`;
  const today = new Date();
  const greeting = greetingForHour(today.getHours());
  const todayLabel = formatDateNL(today);

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row justify-between items-center">
        <View>
          <Text className="text-white/55 text-xs font-bold uppercase tracking-widest">
            {greeting}
          </Text>
          <Text className="text-white text-2xl font-extrabold">Hoi, {name || "Vriend"}</Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/settings")}
          hitSlop={8}
          accessibilityLabel="Open instellingen"
        >
          <Mascot size={42} breathing="off" />
        </Pressable>
      </View>
      <Text className="text-white/65 px-6 mt-1">
        Vandaag werk je rustig aan jouw doelen.
      </Text>

      <ScrollView
        contentContainerClassName="px-5 pt-4 pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Tree hero */}
        <GlassCard variant="strong" className="p-5 mb-5">
          <Text className="absolute top-4 left-5 text-xs font-bold text-white/70">
            🌿 {STAGE_LABELS[treeStage - 1] ?? "Boom"}
          </Text>
          <Text className="absolute top-4 right-5 text-xs font-bold text-yellow bg-yellow/10 border border-yellow/25 px-2.5 py-1 rounded-full">
            Stadium {treeStage} / 7
          </Text>
          <View className="h-[260px] items-center justify-end mt-6">
            <View style={{ position: "absolute", top: 10 }}>
              <ProgressRing size={240} progress={ringProgress} />
            </View>
            <View style={{ position: "absolute", bottom: 0 }}>
              <Tree size={200} stage={treeStage as 1 | 2 | 3 | 4 | 5 | 6 | 7} />
            </View>
            <View style={{ position: "absolute", bottom: 2, right: 4 }}>
              <Mascot size={78} breathing="slow" />
            </View>
          </View>
          <View className="absolute bottom-5 left-5 bg-white/15 border border-white/15 rounded-full px-3 py-1.5">
            <Text className="text-white text-sm font-bold tabular-nums">{points} punten</Text>
          </View>
        </GlassCard>

        {/* Today list */}
        <GlassCard className="p-5 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-extrabold">Vandaag</Text>
            <Text className="text-white/55 text-xs font-bold">{todayLabel}</Text>
          </View>
          {goals.length === 0 ? (
            <Text className="text-white/55 text-sm py-2">
              Nog geen doelen. Voeg er een toe via Planning of de "+ Doel toevoegen" knop hieronder.
            </Text>
          ) : (
            goals.map((g) => (
              <TaskRow
                key={g.id}
                label={g.title}
                sub={g.description}
                done={g.done}
                onToggle={() => onToggle(g.id)}
              />
            ))
          )}
        </GlassCard>

        {/* Bedtime */}
        <GlassCard variant="warm" className="p-4 mb-4 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-yellow/25 items-center justify-center">
            <Text style={{ fontSize: 18 }}>🌙</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-bold">Bedtijd vanavond</Text>
            <Text className="text-white/65 text-xs">We dimmen alles vanaf {windDown}</Text>
          </View>
          <Text className="text-yellow text-lg font-extrabold tabular-nums">{bed}</Text>
        </GlassCard>

        {/* CTAs */}
        <View className="flex-row gap-3 mt-1">
          <View className="flex-1">
            <GhostButton label="+ Doel toevoegen" onPress={() => router.push("/(tabs)/planning")} />
          </View>
          <View className="flex-1">
            <PrimaryButton label="▶ Start focusblok" onPress={() => router.push("/focus/setup" as any)} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
