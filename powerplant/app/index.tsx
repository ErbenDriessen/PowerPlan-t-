import { View } from "react-native";
import { DuskBackground } from "../components/DuskBackground";
import { Tree } from "../components/Tree";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-end pb-20">
      <DuskBackground />
      <Tree size={220} stage={3} />
    </View>
  );
}
