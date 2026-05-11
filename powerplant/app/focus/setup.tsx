// powerplant/app/focus/setup.tsx
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { PrimaryButton } from "../../components/buttons";
import { useFocusStore } from "../../stores/useFocusStore";

const DURATIONS = [
  { dur: 25, brk: 5, label: "25 / 5", note: "klassiek" },
  { dur: 50, brk: 10, label: "50 / 10", note: "lang" },
  { dur: 15, brk: 3, label: "Eigen", note: "15 / 3" },
];

export default function FocusSetup() {
  const dur = useFocusStore((s) => s.dur);
  const brk = useFocusStore((s) => s.brk);
  const rnds = useFocusStore((s) => s.rnds);
  const configure = useFocusStore((s) => s.configure);
  const setRounds = useFocusStore((s) => s.setRounds);
  const start = useFocusStore((s) => s.start);

  return (
    <View className="flex-1 bg-night">
      <DuskBackground variant="deep" />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row items-center justify-between mb-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-white/70 text-sm font-bold">← Terug</Text>
        </Pressable>
        <Text className="text-white text-base font-semibold">Focusmodus</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerClassName="px-6 pb-32">
        <View className="items-center mt-2 mb-4">
          <Mascot size={130} breathing="slow" />
        </View>

        <GlassCard className="p-6 mb-4">
          <Text className="text-white text-2xl font-extrabold text-center mb-1">
            Klaar om te focussen?
          </Text>
          <Text className="text-white/60 text-sm text-center mb-5">
            Kies een ritme dat bij je past.
          </Text>

          <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
            Duur
          </Text>
          <View className="flex-row gap-2 mb-5">
            {DURATIONS.map((d) => {
              const selected = d.dur === dur && d.brk === brk;
              return (
                <Pressable
                  key={d.label}
                  onPress={() => configure(d.dur, d.brk)}
                  className={`flex-1 py-3 rounded-2xl items-center ${
                    selected
                      ? "bg-primary border border-primary-soft"
                      : "bg-white/[0.06] border border-white/10"
                  }`}
                >
                  <Text className="text-white text-base font-bold">{d.label}</Text>
                  <Text className="text-white/50 text-[10px] font-semibold">{d.note}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
            Rondes
          </Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4].map((n) => {
              const selected = n === rnds;
              return (
                <Pressable
                  key={n}
                  onPress={() => setRounds(n)}
                  className={`flex-1 py-3 rounded-2xl items-center ${
                    selected
                      ? "bg-primary border border-primary-soft"
                      : "bg-white/[0.06] border border-white/10"
                  }`}
                >
                  <Text className="text-white font-bold">{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <PrimaryButton
          label="Start focusblok"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            start();
            router.push("/focus/running" as any);
          }}
        />
        <Text className="text-center text-white/50 text-xs mt-3">
          🔒 Tijdens focus is je telefoon op slot.
        </Text>
      </ScrollView>
    </View>
  );
}
