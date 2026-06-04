// powerplant/app/dagboek/index.tsx
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { BackButton } from "../../components/BackButton";
import { Mascot } from "../../components/Mascot";
import { PrimaryButton } from "../../components/buttons";
import { useJournalStore, Mood } from "../../stores/useJournalStore";

const MOOD_FACE: Record<Mood, string> = {
  moe: "😴",
  onrustig: "😣",
  rustig: "😌",
  blij: "🙂",
  dankbaar: "🌿",
};

export default function DagboekIndex() {
  const entries = useJournalStore((s) => s.entries);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const confirmDelete = (id: string, date: string) => {
    Alert.alert(
      "Entry verwijderen?",
      `De entry van ${date} wordt permanent gewist.`,
      [
        { text: "Annuleer", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: () => deleteEntry(id),
        },
      ],
    );
  };

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <BackButton />
          <Text className="text-white text-2xl font-extrabold">Dagboek</Text>
        </View>
        <Mascot size={36} />
      </View>

      <ScrollView contentContainerClassName="px-5 pt-2 pb-32">
        <Text className="text-white/70 text-sm leading-snug px-1 mb-5">
          Schrijf wanneer je wil een paar woorden. Niemand leest mee — alleen jij.
        </Text>

        <PrimaryButton
          label="✏️ Nieuwe entry"
          onPress={() => router.push("/dagboek/writer" as any)}
          className="mb-6"
        />

        <View className="flex-row items-center justify-between px-1 mb-2">
          <Text className="text-white/55 text-xs font-bold uppercase tracking-widest">
            Alle entries
          </Text>
          <Text className="text-white/40 text-xs font-bold">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </Text>
        </View>

        {entries.length === 0 ? (
          <GlassCard className="p-6 items-center">
            <Text style={{ fontSize: 30 }}>📓</Text>
            <Text className="text-white font-bold mt-2">Nog geen entries</Text>
            <Text className="text-white/55 text-xs mt-1 text-center">
              Tap op "Nieuwe entry" om er eentje te schrijven.
            </Text>
          </GlassCard>
        ) : (
          <View style={{ gap: 10 }}>
            {entries.map((e) => (
              <Pressable
                key={e.id}
                onPress={() =>
                  router.push({ pathname: "/dagboek/writer", params: { id: e.id } } as any)
                }
              >
                <GlassCard className="p-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-2">
                      <Text>{MOOD_FACE[e.mood]}</Text>
                      <Text className="text-white/55 text-xs font-bold">{e.date}</Text>
                    </View>
                    <Pressable
                      hitSlop={10}
                      onPress={() => confirmDelete(e.id, e.date)}
                      className="w-7 h-7 items-center justify-center rounded-full bg-white/[0.06]"
                    >
                      <Text className="text-white/55 text-base">×</Text>
                    </Pressable>
                  </View>
                  <Text className="text-white/80 text-sm" numberOfLines={3}>
                    {e.text || "(geen tekst)"}
                  </Text>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
