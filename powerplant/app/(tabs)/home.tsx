// powerplant/app/(tabs)/home.tsx
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GhostButton, PrimaryButton } from "../../components/buttons";
import { GlassCard } from "../../components/GlassCard";
import { GoalEditSheet, GoalEditValue } from "../../components/GoalEditSheet";
import { HorseshoeProgress } from "../../components/HorseshoeProgress";
import { Mascot } from "../../components/Mascot";
import { TaskRow } from "../../components/TaskRow";
import { Tree } from "../../components/Tree";
import { formatDateNL, greetingForHour } from "../../lib/dates";
import { STAGE_LABELS, useUserStore } from "../../stores/useUserStore";

type GoalEditState =
  | { mode: "add" }
  | { mode: "edit"; id: string; title: string; description: string }
  | null;

export default function Home() {
  const name = useUserStore((s) => s.name);
  const points = useUserStore((s) => s.points);
  const ringProgress = useUserStore((s) => s.ringProgress);
  const treeStage = useUserStore((s) => s.treeStage);
  const currentSpecies = useUserStore((s) => s.currentSpecies);
  const bedH = useUserStore((s) => s.bedH);
  const bedM = useUserStore((s) => s.bedM);
  const addPoints = useUserStore((s) => s.addPoints);

  const goals = useUserStore((s) => s.goals);
  const toggleGoalDone = useUserStore((s) => s.toggleGoalDone);
  const addGoal = useUserStore((s) => s.addGoal);
  const updateGoal = useUserStore((s) => s.updateGoal);
  const removeGoal = useUserStore((s) => s.removeGoal);

  const [editing, setEditing] = useState<GoalEditState>(null);

  const onToggle = (id: string) => {
    const wasDone = goals.find((g) => g.id === id)?.done;
    toggleGoalDone(id);
    addPoints(wasDone ? -10 : 10, wasDone ? -0.06 : 0.06);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const openAdd = () => setEditing({ mode: "add" });
  const openEdit = (g: { id: string; title: string; description: string }) =>
    setEditing({ mode: "edit", id: g.id, title: g.title, description: g.description });
  const closeSheet = () => setEditing(null);

  const onSheetConfirm = (v: GoalEditValue) => {
    if (!editing) return;
    if (editing.mode === "add") {
      addGoal(v);
    } else {
      updateGoal(editing.id, v);
    }
    setEditing(null);
  };
  const onSheetDelete = () => {
    if (editing?.mode !== "edit") return;
    removeGoal(editing.id);
    setEditing(null);
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
            Stadium {treeStage} / 5
          </Text>
          <View className="h-[240px] items-center justify-end mt-6">
            {/* Horseshoe progress dial — opens at bottom, fills L→R via top */}
            <View style={{ position: "absolute", top: 10 }}>
              <HorseshoeProgress size={240} progress={ringProgress} />
            </View>
            {/* Tree sits in the opening of the horseshoe at the bottom */}
            <View style={{ position: "absolute", bottom: 4 }}>
              <Tree size={140} stage={treeStage} species={currentSpecies} />
            </View>
            <View style={{ position: "absolute", bottom: 2, right: 4 }}>
              <Mascot size={70} breathing="slow" />
            </View>
          </View>
          <View className="absolute bottom-5 left-5 bg-white/15 border border-white/15 rounded-full px-3 py-1.5">
            <Text className="text-white text-sm font-bold tabular-nums">{points} punten</Text>
          </View>
        </GlassCard>

        {/* Today list — full goal management */}
        <GlassCard className="p-5 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-extrabold">Vandaag</Text>
            <Text className="text-white/55 text-xs font-bold">{todayLabel}</Text>
          </View>
          {goals.length === 0 ? (
            <Text className="text-white/55 text-sm py-2">
              Nog geen doelen. Voeg er hieronder een toe.
            </Text>
          ) : (
            goals.map((g) => (
              <TaskRow
                key={g.id}
                label={g.title}
                sub={g.description}
                done={g.done}
                onToggle={() => onToggle(g.id)}
                onEdit={() => openEdit(g)}
              />
            ))
          )}
        </GlassCard>

        {/* CTAs — directly under the list so adding a goal feels connected */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <GhostButton label="+ Doel toevoegen" onPress={openAdd} />
          </View>
          <View className="flex-1">
            <PrimaryButton label="▶ Start focusblok" onPress={() => router.push("/focus/setup" as any)} />
          </View>
        </View>

        {/* Bedtime — informational, lower priority */}
        <GlassCard variant="warm" className="p-4 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-yellow/25 items-center justify-center">
            <Text style={{ fontSize: 18 }}>🌙</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-bold">Bedtijd vanavond</Text>
            <Text className="text-white/65 text-xs">We dimmen alles vanaf {windDown}</Text>
          </View>
          <Text className="text-yellow text-lg font-extrabold tabular-nums">{bed}</Text>
        </GlassCard>
      </ScrollView>

      <GoalEditSheet
        visible={editing !== null}
        mode={editing?.mode ?? "add"}
        initial={
          editing?.mode === "edit"
            ? { title: editing.title, description: editing.description }
            : { title: "", description: "" }
        }
        onConfirm={onSheetConfirm}
        onCancel={closeSheet}
        onDelete={editing?.mode === "edit" ? onSheetDelete : undefined}
      />
    </View>
  );
}
