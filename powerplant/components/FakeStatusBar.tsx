// powerplant/components/FakeStatusBar.tsx
import { Text, View } from "react-native";

export function FakeStatusBar() {
  return (
    <View className="px-7 pt-3 pb-1 flex-row justify-between items-center">
      <Text className="text-white/90 font-bold text-sm">9:41</Text>
      <Text className="text-white/90 font-bold text-sm">●●●</Text>
    </View>
  );
}
