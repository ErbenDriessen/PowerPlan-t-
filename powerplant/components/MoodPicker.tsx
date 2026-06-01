// powerplant/components/MoodPicker.tsx
import { Pressable, Text, View } from "react-native";
import type { Mood } from "../stores/useJournalStore";

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: "moe", emoji: "😴", label: "Moe" },
  { key: "onrustig", emoji: "😣", label: "Onrustig" },
  { key: "rustig", emoji: "😌", label: "Rustig" },
  { key: "blij", emoji: "🙂", label: "Blij" },
  { key: "dankbaar", emoji: "🌿", label: "Dankbaar" },
];

type Props = { value: Mood | null; onChange: (m: Mood) => void };

export function MoodPicker({ value, onChange }: Props) {
  return (
    <View className="flex-row gap-1 bg-white/[0.07] border border-white/10 rounded-2xl p-2">
      {MOODS.map((m) => {
        const selected = value === m.key;
        return (
          <Pressable
            key={m.key}
            onPress={() => onChange(m.key)}
            className="flex-1 items-center py-2.5 rounded-2xl"
          >
            <View
              className={`w-10 h-10 rounded-full items-center justify-center border ${
                selected ? "bg-yellow/20 border-yellow" : "bg-white/[0.07] border-white/10"
              }`}
            >
              <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
            </View>
            <Text
              className={`text-[10px] font-bold mt-1 ${
                selected ? "text-yellow" : "text-white/55"
              }`}
            >
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
