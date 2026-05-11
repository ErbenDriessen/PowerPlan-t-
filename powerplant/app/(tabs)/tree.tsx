// powerplant/app/(tabs)/tree.tsx
import { ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { Tree } from "../../components/Tree";
import { useUserStore } from "../../stores/useUserStore";

const WEEK = [
  { l: "m", state: "done" },
  { l: "d", state: "done" },
  { l: "w", state: "skip" },
  { l: "d", state: "done" },
  { l: "v", state: "today" },
  { l: "z", state: "future" },
  { l: "z", state: "future" },
] as const;

export default function MijnBoom() {
  const points = useUserStore((s) => s.points);
  const treeStage = useUserStore((s) => s.treeStage);
  const streak = useUserStore((s) => s.streak);

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row items-center justify-between mb-2">
        <Text className="text-white text-2xl font-extrabold">Mijn boom</Text>
        <Mascot size={36} />
      </View>

      <ScrollView contentContainerClassName="px-5 pt-2 pb-32">
        <View className="h-[300px] items-center justify-end mb-3">
          <Tree size={240} stage={treeStage as 1 | 2 | 3 | 4 | 5 | 6 | 7} />
        </View>

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
            <Text className="text-white text-2xl font-extrabold tabular-nums">12/15</Text>
          </GlassCard>
        </View>

        <GlassCard className="p-4 mb-4">
          <View className="flex-row justify-between mb-3">
            <Text className="text-white font-extrabold text-sm">Deze week</Text>
            <Text className="text-white/45 text-xs font-bold">week 19</Text>
          </View>
          <View className="flex-row" style={{ gap: 6 }}>
            {WEEK.map((d, i) => (
              <View key={i} className="flex-1 items-center" style={{ gap: 6 }}>
                <Text className={`text-[10px] font-bold ${d.state === "today" ? "text-white" : "text-white/45"}`}>
                  {d.l}
                </Text>
                <View
                  className={`w-9 h-9 rounded-2xl items-center justify-center ${
                    d.state === "done"
                      ? "bg-primary"
                      : d.state === "today"
                        ? "border-2 border-primary-soft bg-primary/15"
                        : "bg-white/10"
                  }`}
                >
                  <Text className={`text-sm font-bold ${d.state === "future" ? "text-white/30" : "text-white"}`}>
                    {d.state === "done" ? "✓" : d.state === "future" ? "—" : "·"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard variant="warm" className="p-4 mb-4">
          <Text className="text-white text-sm font-semibold leading-snug">
            Je hebt <Text className="text-yellow font-extrabold">4 van de 5</Text> dagen je
            planning gevolgd. Dat is sterke groei. 🌱
          </Text>
        </GlassCard>

        <GlassCard className="p-4 mb-4">
          <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-2">
            Volgende beloning
          </Text>
          <View className="flex-row items-center gap-4">
            <View className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 items-center justify-center">
              <Text style={{ fontSize: 28 }}>🦋</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-bold">Een vlinder voor je boom</Text>
              <Text className="text-white/55 text-xs">Nog 60 punten te gaan</Text>
              <View className="mt-2 h-1.5 w-full bg-white/10 rounded-full">
                <View className="h-full bg-primary-soft rounded-full" style={{ width: "80%" }} />
              </View>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}
