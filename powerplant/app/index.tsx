import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { DuskBackground } from "../components/DuskBackground";
import { ProgressRing } from "../components/ProgressRing";

export default function Index() {
  const [p, setP] = useState(0.4);
  return (
    <View className="flex-1 items-center justify-center">
      <DuskBackground />
      <ProgressRing size={240} progress={p} />
      <Pressable onPress={() => setP((x) => (x >= 1 ? 0 : x + 0.1))} className="mt-6 px-4 py-2 bg-primary rounded-full">
        <Text className="text-white font-bold">+ 10%</Text>
      </Pressable>
    </View>
  );
}
