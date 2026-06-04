// powerplant/components/BackButton.tsx
//
// Eén consistente terug-knop voor de header van schermen binnen een stack.
// Toont een chevron, met optioneel het woord "Terug" ernaast. Zo ziet elke
// terug-actie er door de hele app hetzelfde uit.
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export function BackButton({
  label,
  onPress,
}: {
  /** Tekst naast de chevron. Laat leeg voor alleen het icoon. */
  label?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
      accessibilityLabel={label ?? "Terug"}
      className="flex-row items-center active:opacity-70"
    >
      <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.7)" />
      {label ? <Text className="text-white/70 text-sm font-bold">{label}</Text> : null}
    </Pressable>
  );
}
