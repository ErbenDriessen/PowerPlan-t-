import { View } from "react-native";
import { DuskBackground } from "../components/DuskBackground";
import { Mascot } from "../components/Mascot";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <DuskBackground />
      <Mascot size={160} breathing="slow" />
    </View>
  );
}
