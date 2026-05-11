// powerplant/app/(tabs)/home.tsx
import { Text, View } from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";

export default function Home() {
  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-2xl font-extrabold">Vandaag</Text>
      </View>
    </View>
  );
}
