import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { DuskBackground } from "../components/DuskBackground";
import { FakeStatusBar } from "../components/FakeStatusBar";
import { GlassCard } from "../components/GlassCard";
import { Mascot } from "../components/Mascot";
import { PrimaryButton } from "../components/buttons";
import { ProgressRing } from "../components/ProgressRing";
import { BackButton } from "../components/BackButton";

type Phase = "setup" | "running" | "done";
type Ambient = "stilte" | "bos" | "regen";

export default function Meditation() {
  useKeepAwake();
  const [phase, setPhase] = useState<Phase>("setup");
  const [minutes, setMinutes] = useState(5);
  const [ambient, setAmbient] = useState<Ambient>("stilte");
  const [remaining, setRemaining] = useState(0);

  // tick during running
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setPhase("done");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const total = minutes * 60;
  const progress = total ? 1 - remaining / total : 0;

  if (phase === "setup") {
    return (
      <View className="flex-1">
        <DuskBackground variant="deep" />
        <FakeStatusBar />
        <View className="px-6 pt-2 flex-row items-center justify-between mb-3">
          <BackButton label="Terug" />
          <Text className="text-white text-base font-semibold">Korte meditatie</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerClassName="px-6 pb-32">
          <View className="items-center mt-4 mb-5">
            <Mascot size={130} breathing="slow" />
          </View>

          <GlassCard className="p-6 mb-4">
            <Text className="text-white text-2xl font-extrabold text-center mb-1">
              Even stilstaan
            </Text>
            <Text className="text-white/65 text-sm text-center mb-5">
              Sluit straks je ogen. Sprout helpt je terug naar je adem.
            </Text>

            <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
              Duur
            </Text>
            <View className="flex-row gap-2 mb-5">
              {([3, 5, 10] as const).map((m) => {
                const selected = m === minutes;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMinutes(m)}
                    className={`flex-1 py-3 rounded-2xl items-center ${
                      selected
                        ? "bg-primary border border-primary-soft"
                        : "bg-white/[0.06] border border-white/10"
                    }`}
                  >
                    <Text className="text-white text-base font-bold">{m} min</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
              Sfeer
            </Text>
            <View className="flex-row gap-2">
              {(["stilte", "bos", "regen"] as Ambient[]).map((a) => {
                const selected = a === ambient;
                const icon = a === "stilte" ? "✨" : a === "bos" ? "🌲" : "🌧️";
                return (
                  <Pressable
                    key={a}
                    onPress={() => setAmbient(a)}
                    className={`flex-1 py-2.5 rounded-2xl items-center ${
                      selected
                        ? "bg-primary border border-primary-soft"
                        : "bg-white/[0.06] border border-white/10"
                    }`}
                  >
                    <Text className="text-white text-xs font-bold">
                      {icon} {a[0].toUpperCase() + a.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="text-white/40 text-[11px] mt-3">
              🔈 Geluiden volgen later — kies vast de sfeer die bij je past.
            </Text>
          </GlassCard>

          <PrimaryButton
            label="Start meditatie"
            onPress={() => {
              setRemaining(minutes * 60);
              setPhase("running");
            }}
          />
          <Text className="text-center text-white/45 text-xs mt-3">
            Je kunt op elk moment stoppen.
          </Text>
        </ScrollView>
      </View>
    );
  }

  if (phase === "running") {
    return (
      <View className="flex-1 items-center justify-between py-12 px-6">
        <DuskBackground variant="deep" showMoon={false} />
        <View className="items-center">
          <Text className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">
            Adem rustig
          </Text>
          <Text className="text-white/75 text-sm font-semibold mt-1">{ambient}</Text>
        </View>
        <View className="items-center justify-center" style={{ width: 280, height: 280 }}>
          <View style={{ position: "absolute" }}>
            <ProgressRing size={280} progress={progress} />
          </View>
          <View className="items-center">
            <Mascot size={110} breathing="slow" />
            <Text className="text-white text-4xl font-extrabold tabular-nums mt-3">
              {fmt(remaining)}
            </Text>
          </View>
        </View>
        <Text className="text-white/60 text-sm italic text-center px-6">
          Laat je schouders zakken. Voel je adem komen en gaan.
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text className="text-white/45 text-xs font-bold">Stoppen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6">
      <DuskBackground variant="deep" />
      <Mascot size={140} breathing="slow" />
      <Text className="text-white text-3xl font-extrabold mt-6 mb-2">Mooi gedaan 🌿</Text>
      <Text className="text-white/65 text-center mb-8 max-w-[260px]">
        Neem nog even een seconde. Sta dan rustig op.
      </Text>
      <PrimaryButton label="Klaar" onPress={() => router.back()} className="w-64" />
    </View>
  );
}
