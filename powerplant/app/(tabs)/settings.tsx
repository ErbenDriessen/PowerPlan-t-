import { router } from "expo-router";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { useDailyProgressStore } from "../../stores/useDailyProgressStore";
import { useJournalStore } from "../../stores/useJournalStore";
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
  const streak = useUserStore((s) => s.streak);
  const goalCount = useUserStore((s) => s.goals.length);
  const goalsDoneCount = useUserStore((s) => s.goals.filter((g) => g.done).length);
  const addPoints = useUserStore((s) => s.addPoints);
  const bumpStreak = useUserStore((s) => s.bumpStreak);
  const resetGoalsDone = useUserStore((s) => s.resetGoalsDone);
  const simulateNextDay = useUserStore((s) => s.simulateNextDay);
  const userDevReset = useUserStore((s) => s.devReset);
  const resetForest = useUserStore((s) => s.resetForest);
  const resetAppState = useUserStore((s) => s.resetApp);
  const bomenGeplant = useUserStore((s) => s.bomenGeplant);
  const tijdOverride = usePrefsStore((s) => s.tijdOverride);
  const setTijdOverride = usePrefsStore((s) => s.setTijdOverride);
  const journalDevReset = useJournalStore((s) => s.devReset);
  const journalEntryCount = useJournalStore((s) => s.entries.length);
  const historyDevReset = useDailyProgressStore((s) => s.devReset);
  const historyCount = useDailyProgressStore((s) => s.history.length);
  const prefs = usePrefsStore();

  const stageLabel = STAGE_LABELS[treeStage - 1] ?? "Boom";
  const nextThreshold = pointsToNextThreshold(points);
  const pointsToNext = nextThreshold !== null ? nextThreshold - points : 0;

  const resetAll = () => {
    userDevReset();
    journalDevReset();
    historyDevReset();
  };

  const resetApp = () => {
    // Wipe everything to factory defaults (incl. hasOnboarded + name),
    // then route back to onboarding so the next launch matches the
    // first-install experience.
    resetAppState();
    journalDevReset();
    historyDevReset();
    router.replace("/onboarding");
  };

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

        {/* Punten + stadium */}
        <GlassCard className="mb-3 p-4">
          <Text className="text-white text-sm font-semibold mb-1">
            {points} punten · Stadium {treeStage}/5 · {stageLabel}
          </Text>
          <Text className="text-white/55 text-xs mb-3">
            {nextThreshold !== null
              ? `Nog ${pointsToNext} punten tot ${
                  treeStage >= 5 ? "prestige" : `stadium ${treeStage + 1}`
                }`
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
          </View>
        </GlassCard>

        {/* Time-of-day override (voor demos) */}
        <GlassCard className="mb-3 p-4">
          <Text className="text-white text-sm font-semibold mb-1">
            Tijd van de dag (raam-uitzicht)
          </Text>
          <Text className="text-white/55 text-xs mb-3">
            Standaard volgt het raam de klok (6–17u dag, 17–20u dawn, 20–6u nacht).
            Voor een demo kun je hier een vaste sfeer kiezen.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(["auto", "day", "dusk", "night"] as const).map((mode) => {
              const active = tijdOverride === mode;
              const label =
                mode === "auto"
                  ? "Auto (klok)"
                  : mode === "day"
                    ? "Dag"
                    : mode === "dusk"
                      ? "Dawn"
                      : "Nacht";
              return (
                <Pressable
                  key={mode}
                  onPress={() => setTijdOverride(mode)}
                  className={`rounded-2xl px-4 py-2 border ${
                    active
                      ? "bg-primary border-primary-soft"
                      : "bg-white/10 border-white/15"
                  } active:opacity-80`}
                >
                  <Text className="text-white font-bold text-sm">{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        {/* Prestige bos */}
        <GlassCard className="mb-3 p-4">
          <Text className="text-white text-sm font-semibold mb-1">
            Bomen in het bos: {bomenGeplant}
          </Text>
          <Text className="text-white/55 text-xs mb-3">
            Elke keer dat je groeiende boom stadium 5 bereikt verhuist 'ie naar het bos
            achter het raam. Hier kun je het bos handmatig leeghalen om de "fresh
            start"-look te testen.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={resetForest}
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">Wis bos</Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Streak */}
        <GlassCard className="mb-3 p-4">
          <Text className="text-white text-sm font-semibold mb-1">
            Streak: {streak} {streak === 1 ? "dag" : "dagen"}
          </Text>
          <Text className="text-white/55 text-xs mb-3">
            Streak-logica is nog niet geautomatiseerd — hier handmatig zetten om de UI te
            testen.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => bumpStreak(1)}
              className="bg-primary rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">+1 dag</Text>
            </Pressable>
            <Pressable
              onPress={() => bumpStreak(-1)}
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">-1 dag</Text>
            </Pressable>
            <Pressable
              onPress={() => bumpStreak(-streak)}
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">Op 0</Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Doelen done-state + dag-overgang */}
        <GlassCard className="mb-3 p-4">
          <Text className="text-white text-sm font-semibold mb-1">
            Doelen vandaag: {goalsDoneCount}/{goalCount} afgevinkt
          </Text>
          <Text className="text-white/55 text-xs mb-3">
            "Vink uit" reset alleen de vinkjes. "Simuleer morgen" doet hetzelfde plus de
            streak-logica: +1 dag als minstens 1 doel af was, anders terug naar 0.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={resetGoalsDone}
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">Vink doelen uit</Text>
            </Pressable>
            <Pressable
              onPress={simulateNextDay}
              className="bg-primary rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">Simuleer morgen</Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Dagboek + dag-historie + reset alles */}
        <GlassCard className="mb-5 p-4">
          <Text className="text-white text-sm font-semibold mb-1">
            Dagboek: {journalEntryCount} {journalEntryCount === 1 ? "entry" : "entries"}
          </Text>
          <Text className="text-white text-sm font-semibold mb-1">
            Dag-historie (week grid op Mijn boom): {historyCount}{" "}
            {historyCount === 1 ? "dag" : "dagen"} opgeslagen
          </Text>
          <Text className="text-white/55 text-xs mb-3">
            Wis losse onderdelen of doe een complete reset (vinkjes, punten, streak, dagboek,
            en dag-historie).
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={journalDevReset}
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">Wis dagboek</Text>
            </Pressable>
            <Pressable
              onPress={historyDevReset}
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">Wis historie</Text>
            </Pressable>
            <Pressable
              onPress={resetAll}
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">Reset alles</Text>
            </Pressable>
            <Pressable
              onPress={resetApp}
              className="bg-yellow/20 border border-yellow/40 rounded-2xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-yellow font-bold text-sm">Reset app (incl. onboarding)</Text>
            </Pressable>
          </View>
          <Text className="text-white/40 text-[11px] mt-2 leading-snug">
            "Reset app" wist ook je naam, onboarding-status en alle voorkeuren — alsof je de
            app opnieuw geïnstalleerd hebt. Stuurt je direct terug naar het onboarding-scherm.
          </Text>
        </GlassCard>

        <Text className="text-center text-white/45 text-xs mt-2">
          Gemaakt met 🌿 voor MBO-studenten
        </Text>
      </ScrollView>
    </View>
  );
}
