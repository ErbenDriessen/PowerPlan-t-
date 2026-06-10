// powerplant/app/(tabs)/rust.tsx
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";

type Tile = {
  emoji: string;
  title: string;
  sub: string;
  variant: "default" | "warm" | "green";
  onPress: () => void;
};

export default function Rust() {
  const tiles: Tile[] = [
    {
      emoji: "🌬️",
      title: "Ademhaling",
      sub: "kies je techniek",
      variant: "default",
      onPress: () => router.push("/breathing" as any),
    },
    {
      emoji: "🧘",
      title: "Korte meditatie",
      sub: "3, 5 of 10 min",
      variant: "warm",
      onPress: () => router.push("/meditation" as any),
    },
    {
      emoji: "📓",
      title: "Schrijf in je dagboek",
      sub: "1 zin is genoeg",
      variant: "default",
      onPress: () => router.push("/dagboek" as any),
    },
  ];

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row items-center justify-between mb-2">
        <Text className="text-white text-2xl font-extrabold">Rustmoment</Text>
        <Mascot size={36} />
      </View>

      <ScrollView contentContainerClassName="px-6 pt-4 pb-32">
        <View className="mt-4 mb-8">
          <Text className="text-white text-3xl font-extrabold mb-2">
            Tijd om af te schakelen 🌙
          </Text>
          <Text className="text-white/70">Even je hoofd laten zakken?</Text>
        </View>

        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {tiles.map((t) => (
            <Pressable
              key={t.title}
              onPress={t.onPress}
              style={{ width: "47%", aspectRatio: 1 }}
            >
              <GlassCard variant={t.variant} className="p-5 flex-1 justify-between">
                <Text style={{ fontSize: 28 }}>{t.emoji}</Text>
                <View>
                  <Text className="text-white font-extrabold text-base">{t.title}</Text>
                  <Text className="text-white/50 text-xs mt-1">{t.sub}</Text>
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </View>

        <Text className="text-center text-white/40 text-xs mt-6">Geen druk. Kies wat past.</Text>
      </ScrollView>
    </View>
  );
}
