// powerplant/app/dagboek/index.tsx
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { PrimaryButton } from "../../components/buttons";
import { useJournalStore, Mood } from "../../stores/useJournalStore";

const MOOD_LABEL: Record<Mood, string> = {
  moe: "Moe 😴",
  onrustig: "Onrustig 😣",
  rustig: "Rustig 😌",
  blij: "Blij 🙂",
  dankbaar: "Dankbaar 🌿",
};

const MOOD_FACE: Record<Mood, string> = {
  moe: "😴",
  onrustig: "😣",
  rustig: "😌",
  blij: "🙂",
  dankbaar: "🌿",
};

export default function DagboekIndex() {
  const entries = useJournalStore((s) => s.entries);
  const todayId = useJournalStore((s) => s.todayEntryId);
  const today = entries.find((e) => e.id === todayId);
  const older = entries.filter((e) => e.id !== todayId);

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => router.back()}>
            <Text className="text-white/70 text-lg font-bold">←</Text>
          </Pressable>
          <Text className="text-white text-2xl font-extrabold">Dagboek</Text>
        </View>
        <Mascot size={36} />
      </View>

      <ScrollView contentContainerClassName="px-5 pt-2 pb-32">
        <Text className="text-white/70 text-sm leading-snug px-1 mb-5">
          Schrijf elke avond een paar woorden. Niemand leest mee — alleen jij.
        </Text>

        <GlassCard variant="warm" className="p-5 mb-5">
          <View className="flex-row justify-between mb-2">
            <Text className="text-yellow text-xs font-bold uppercase tracking-widest">
              Vandaag · do 11 mei
            </Text>
            <Text className="text-white/55 text-[10px] font-bold">
              {today ? MOOD_LABEL[today.mood] : "nog niet geschreven"}
            </Text>
          </View>
          <Text className="text-white/85 text-sm leading-snug mb-4">
            {today
              ? `"${today.text.slice(0, 140)}${today.text.length > 140 ? "…" : ""}"`
              : "Hoe voelde vandaag voor jou?"}
          </Text>
          <PrimaryButton
            label={today ? "✏️ Aanpassen" : "✏️ Schrijf nu"}
            onPress={() => router.push("/dagboek/writer" as any)}
          />
        </GlassCard>

        <View className="flex-row items-center justify-between px-1 mb-2">
          <Text className="text-white/55 text-xs font-bold uppercase tracking-widest">
            Eerder geschreven
          </Text>
          <Text className="text-white/40 text-xs font-bold">
            {older.length} {older.length === 1 ? "entry" : "entries"}
          </Text>
        </View>

        {older.length === 0 ? (
          <GlassCard className="p-6 items-center">
            <Text style={{ fontSize: 30 }}>📓</Text>
            <Text className="text-white font-bold mt-2">Nog geen entries</Text>
            <Text className="text-white/55 text-xs">Begin vanavond met één zin.</Text>
          </GlassCard>
        ) : (
          <View style={{ gap: 10 }}>
            {older.map((e) => (
              <GlassCard key={e.id} className="p-4">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-white/55 text-xs font-bold">{e.date}</Text>
                  <Text>{MOOD_FACE[e.mood]}</Text>
                </View>
                <Text className="text-white/80 text-sm" numberOfLines={3}>
                  {e.text}
                </Text>
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
