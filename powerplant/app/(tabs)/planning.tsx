// powerplant/app/(tabs)/planning.tsx
import { ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { SoftButton } from "../../components/buttons";
import {
  getPlannedDay,
  getSuggestion,
  PlanTone,
} from "../../lib/aiCalendar";
import { useUserStore } from "../../stores/useUserStore";

const TONE_BG: Record<PlanTone, string> = {
  primary: "bg-primary-soft/15 border border-primary-soft/25",
  bark: "bg-bark/20 border border-bark/25",
  warm: "bg-yellow/15 border border-yellow/25",
  neutral: "bg-white/[0.06] border border-white/10",
};

export default function Planning() {
  const goals = useUserStore((s) => s.goals);

  // Both calls hit the AI calendar boundary module. Replacing those
  // function bodies with real logic is enough — this screen is agnostic.
  const timeline = getPlannedDay();
  const suggestion = getSuggestion();

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
          {timeline.map((b) => (
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

        {suggestion ? (
          <GlassCard variant="warm" className="p-4 mb-5 flex-row items-start gap-3">
            <Text style={{ fontSize: 22 }}>💡</Text>
            <View className="flex-1">
              <Text className="text-white text-sm font-semibold mb-2">{suggestion.text}</Text>
              {(suggestion.primaryAction || suggestion.dismissAction) && (
                <View className="flex-row gap-2">
                  {suggestion.primaryAction && (
                    <View className="bg-yellow rounded-xl px-3 py-2">
                      <Text className="text-deep text-xs font-bold">
                        {suggestion.primaryAction.label}
                      </Text>
                    </View>
                  )}
                  {suggestion.dismissAction && (
                    <SoftButton label={suggestion.dismissAction.label} onPress={() => {}} />
                  )}
                </View>
              )}
            </View>
          </GlassCard>
        ) : (
          <GlassCard variant="warm" className="p-4 mb-5 flex-row items-start gap-3">
            <Text style={{ fontSize: 22 }}>🔧</Text>
            <View className="flex-1">
              <Text className="text-white text-sm font-semibold mb-1">
                Slimme planning-suggesties
              </Text>
              <Text className="text-white/65 text-xs leading-snug">
                Onderdeel van een andere epic (AI-kalender). Verschijnt hier zodra het werk
                van mijn teamgenoot klaar is.
              </Text>
            </View>
          </GlassCard>
        )}

        <Text className="text-center text-white/45 text-xs px-6">
          Je kunt alles aanpassen — niets is verplicht.
        </Text>
      </ScrollView>
    </View>
  );
}
