// powerplant/app/onboarding.tsx
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { DuskBackground } from "../components/DuskBackground";
import { useUserStore } from "../stores/useUserStore";

export default function Onboarding() {
  const finish = useUserStore((s) => s.finishOnboarding);
  return (
    <View className="flex-1 items-center justify-center">
      <DuskBackground variant="warm" />
      <Text className="text-white text-2xl font-extrabold mb-4">Onboarding placeholder</Text>
      <Pressable
        onPress={() => {
          finish();
          router.replace("/(tabs)/home");
        }}
        className="bg-primary px-5 py-3 rounded-2xl"
      >
        <Text className="text-white font-extrabold">Klaar</Text>
      </Pressable>
    </View>
  );
}
