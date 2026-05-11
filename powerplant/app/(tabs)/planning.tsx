// powerplant/app/(tabs)/planning.tsx
import { ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { SoftButton } from "../../components/buttons";
import { useUserStore } from "../../stores/useUserStore";

type Block = { time: string; label: string; sub: string; emoji: string; tone: "primary" | "bark" | "warm" | "neutral" };

const TIMELINE: Block[] = [
  { time: "08:30", label: "Wandeling", sub: "15 min", emoji: "🚶", tone: "primary" },
  { time: "10:00", label: "School", sub: "tot 12:30", emoji: "📚", tone: "bark" },
  { time: "13:00", label: "Studeerblok", sub: "45 min focus", emoji: "🎯", tone: "primary" },
  { time: "17:30", label: "Eten", sub: "rustig moment", emoji: "🍽️", tone: "neutral" },
  { time: "20:30", label: "Rustmoment", sub: "ademen · 10 min", emoji: "🧘", tone: "warm" },
];

const TONE_BG: Record<Block["tone"], string> = {
  primary: "bg-primary-soft/15 border border-primary-soft/25",
  bark: "bg-bark/20 border border-bark/25",
  warm: "bg-yellow/15 border border-yellow/25",
  neutral: "bg-white/[0.06] border border-white/10",
};

export default function Planning() {
  const goals = useUserStore((s) => s.goals);

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row justify-between items-center mb-2">
        <Text className="text-white text-2xl font-extrabold">Planning</Text>
        <Mascot size={36} />
      </View>

      <ScrollView contentContainerClassName="px-5 pt-2 pb-32">
        <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-2 px-1">
          Mijn doelen
        </Text>
        <GlassCard className="p-4 mb-5">
          {goals.map((g, i) => (
            <View
              key={g}
              className={`flex-row items-center gap-3 py-2 ${
                i < goals.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <View className="w-6 h-6 rounded-full bg-primary border-2 border-primary" />
              <Text className="text-white text-sm font-semibold flex-1">{g}</Text>
              <Text className="text-white/45 text-xs">deze week</Text>
            </View>
          ))}
          <View className="flex-row items-center gap-3 py-3 border-t border-white/10 mt-1">
            <View className="w-6 h-6 rounded-full bg-white/15 items-center justify-center">
              <Text className="text-white font-bold">+</Text>
            </View>
            <Text className="text-white/65 text-sm font-bold">Doel toevoegen</Text>
          </View>
        </GlassCard>

        <View className="flex-row items-center gap-2 px-1 mb-2">
          <Text className="text-white/55 text-xs font-bold uppercase tracking-widest">
            Dagindeling
          </Text>
          <View className="bg-primary-soft/20 border border-primary-soft/30 px-1.5 py-0.5 rounded">
            <Text className="text-primary-soft text-[10px] font-bold">AI</Text>
          </View>
          <Text className="text-white/40 text-xs">— gemaakt voor jou</Text>
        </View>

        <GlassCard className="p-5 mb-5">
          {TIMELINE.map((b, i) => (
            <View key={b.time} className="flex-row items-center gap-3 mb-4 last:mb-0">
              <Text className="w-10 text-white/55 text-xs font-bold tabular-nums">{b.time}</Text>
              <View className="w-3 h-3 rounded-full bg-primary-soft" />
              <View className={`flex-1 rounded-2xl px-3.5 py-2.5 flex-row items-center justify-between ${TONE_BG[b.tone]}`}>
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-white/10 items-center justify-center">
                    <Text>{b.emoji}</Text>
                  </View>
                  <View>
                    <Text className="text-white text-sm font-bold">{b.label}</Text>
                    <Text className="text-white/55 text-[11px]">{b.sub}</Text>
                  </View>
                </View>
                <Text className="text-white/30 text-lg">⋮⋮</Text>
              </View>
            </View>
          ))}
        </GlassCard>

        <GlassCard variant="warm" className="p-4 mb-5 flex-row items-start gap-3">
          <Text style={{ fontSize: 22 }}>💡</Text>
          <View className="flex-1">
            <Text className="text-white text-sm font-semibold mb-2">
              Je planning is best vol. Zullen we het studeerblok inkorten?
            </Text>
            <View className="flex-row gap-2">
              <View className="bg-yellow rounded-xl px-3 py-2">
                <Text className="text-deep text-xs font-bold">Verplaatsen</Text>
              </View>
              <SoftButton label="Laat zo" onPress={() => {}} />
            </View>
          </View>
        </GlassCard>

        <Text className="text-center text-white/45 text-xs px-6">
          Je kunt alles aanpassen — niets is verplicht.
        </Text>
      </ScrollView>
    </View>
  );
}
