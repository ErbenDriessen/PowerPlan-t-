// powerplant/components/Chip.tsx
import { Pressable, Text } from "react-native";

type Props = { label: string; selected: boolean; onPress: () => void };

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-3 rounded-full border ${
        selected ? "bg-primary border-primary-soft" : "bg-white/10 border-white/15"
      }`}
    >
      <Text className={`font-bold text-sm ${selected ? "text-white" : "text-white/85"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
