import { router } from "expo-router";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { usePrefsStore } from "../../stores/usePrefsStore";
import {
  pointsToNextThreshold,
  STAGE_LABELS,
  useUserStore,
} from "../../stores/useUserStore";

const PREF_ROWS: { key: "sound" | "notifications" | "darkMode" | "bedtimeReminder"; emoji: string; label: string }[] = [
  { key: "sound", emoji: "🔊", label: "Geluid" },
  { key: "notifications", emoji: "🔔", label: "Meldingen" },
  { key: "darkMode", emoji: "🌙", label: "Donkere modus" },
  { key: "bedtimeReminder", emoji: "🛏️", label: "Bedtijd-herinnering" },
];

export default function Settings() {
  const name = useUserStore((s) => s.name);
  const treeStage = useUserStore((s) => s.treeStage);
  const points = useUserStore((s) => s.points);
  const addPoints = useUserStore((s) => s.addPoints);
  const devReset = useUserStore((s) => s.devReset);
  const prefs = usePrefsStore();

  const stageLabel = STAGE_LABELS[treeStage - 1] ?? "Boom";
  const nextThreshold = pointsToNextThreshold(points);
  const pointsToNext = nextThreshold !== null ? nextThreshold - points : 0;

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row items-center justify-between mb-2">
        <Text className="text-white text-2xl font-extrabold">Meer</Text>
        <Mascot size={36} />
      </View>

      <ScrollView contentContainerClassName="px-5 pt-2 pb-32">
        <GlassCard className="p-4 mb-5 flex-row items-center gap-4">
          <Mascot size={56} />
          <View className="flex-1">
            <Text className="text-white text-base font-extrabold">{name || "Jouw naam"}</Text>
            <Text className="text-white/55 text-xs">Stadium {treeStage} · {stageLabel}</Text>
          </View>
          <Text className="text-white/45 text-lg">›</Text>
        </GlassCard>

        <Text className="text-white/55 text-xs font-bold uppercase tracking-widest px-1 mb-2">
          Voorkeuren
        </Text>
        <GlassCard className="mb-5 overflow-hidden">
          {PREF_ROWS.map((p, i) => (
            <View
              key={p.key}
              className={`px-4 py-3.5 flex-row items-center justify-between ${
                i < PREF_ROWS.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Text>{p.emoji}</Text>
                <Text className="text-white text-sm font-semibold">{p.label}</Text>
              </View>
              <Switch
                value={prefs[p.key]}
                onValueChange={() => prefs.toggle(p.key)}
                trackColor={{ true: "#7CB342", false: "rgba(255,255,255,0.15)" }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </GlassCard>

        <Text className="text-white/55 text-xs font-bold uppercase tracking-widest px-1 mb-2">
          Doelen & app
        </Text>
        <GlassCard className="mb-5 overflow-hidden">
          <Pressable
            onPress={() => router.push("/(tabs)/planning")}
            className="px-4 py-3.5 flex-row items-center justify-between border-b border-white/10"
          >
            <View className="flex-row items-center gap-3">
              <Text>🎯</Text>
              <Text className="text-white text-sm font-semibold">Doelen aanpassen</Text>
            </View>
            <Text className="text-white/40">›</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/dagboek" as any)}
            className="px-4 py-3.5 flex-row items-center justify-between border-b border-white/10"
          >
            <View className="flex-row items-center gap-3">
              <Text>📓</Text>
              <Text className="text-white text-sm font-semibold">Mijn dagboek</Text>
            </View>
            <Text className="text-white/40">›</Text>
          </Pressable>
          <View className="px-4 py-3.5 flex-row items-center justify-between border-b border-white/10">
            <View className="flex-row items-center gap-3">
              <Text>📤</Text>
              <Text className="text-white text-sm font-semibold">Gegevens exporteren</Text>
            </View>
            <Text className="text-white/40">›</Text>
          </View>
          <View className="px-4 py-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Text>ℹ️</Text>
              <View>
                <Text className="text-white text-sm font-semibold">Over Powerplan(t)</Text>
                <Text className="text-white/55 text-[11px] leading-snug max-w-[220px]">
                  Een rustige app die je helpt je eigen doelen te halen, op jouw tempo.
                </Text>
              </View>
            </View>
            <Text className="text-white/40">›</Text>
          </View>
        </GlassCard>

        <Text className="text-white/55 text-xs font-bold uppercase tracking-widest px-1 mb-2">
          🛠️ Dev · alleen voor testen
        </Text>
        <GlassCard className="mb-5 p-4">
          <Text className="text-white text-sm font-semibold mb-1">
            {points} punten · Stadium {treeStage}/7 · {stageLabel}
          </Text>
          <Text className="text-white/55 text-xs mb-3">
            {nextThreshold !== null
              ? `Nog ${pointsToNext} punten tot stadium ${treeStage + 1}`
              : "Hoogste stadium bereikt 🌳"}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => addPoints(10, 0)}
              className="bg-primary rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">+10</Text>
            </Pressable>
            <Pressable
              onPress={() => addPoints(50, 0)}
              className="bg-primary rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">+50</Text>
            </Pressable>
            <Pressable
              onPress={() => addPoints(100, 0)}
              className="bg-primary rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">+100</Text>
            </Pressable>
            <Pressable
              onPress={() => addPoints(-50, 0)}
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">-50</Text>
            </Pressable>
            <Pressable
              onPress={devReset}
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">Reset</Text>
            </Pressable>
          </View>
        </GlassCard>

        <Text className="text-center text-white/45 text-xs mt-2">
          Gemaakt met 🌿 voor MBO-studenten
        </Text>
      </ScrollView>
    </View>
  );
}
