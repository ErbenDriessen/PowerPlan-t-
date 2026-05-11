// powerplant/app/breathing.tsx
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Mascot } from "../components/Mascot";

type Phase = "in" | "hold" | "out" | "done";

const CUE: Record<Phase, { text: string; count: string }> = {
  in: { text: "Adem in…", count: "4 sec" },
  hold: { text: "Houd vast…", count: "7 sec" },
  out: { text: "Adem uit…", count: "8 sec" },
  done: { text: "Mooi gedaan.", count: "🌿" },
};

export default function Breathing() {
  const [phase, setPhase] = useState<Phase>("in");
  const [round, setRound] = useState(1);
  const height = useSharedValue(30);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function go(p: Phase) {
      setPhase(p);
      if (p === "in") {
        height.value = withTiming(220, { duration: 4000, easing: Easing.inOut(Easing.sin) });
        timer.current = setTimeout(() => go("hold"), 4000);
      } else if (p === "hold") {
        timer.current = setTimeout(() => go("out"), 7000);
      } else if (p === "out") {
        height.value = withTiming(30, { duration: 8000, easing: Easing.inOut(Easing.sin) });
        timer.current = setTimeout(() => {
          if (round < 4) {
            setRound((r) => r + 1);
            go("in");
          } else {
            go("done");
            timer.current = setTimeout(() => router.back(), 1800);
          }
        }, 8000);
      }
    }
    go("in");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [round]);

  const barStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <View className="flex-1 items-center justify-center">
      <LinearGradient
        colors={["#1B3A2F", "#0F2820"] as [string, string]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <Pressable onPress={() => router.back()} className="absolute top-12 right-6">
        <Text className="text-white/60 text-sm font-bold">Sluiten ×</Text>
      </Pressable>

      <Text className="text-white text-3xl font-extrabold mb-2">{CUE[phase].text}</Text>
      <Text className="text-white/50 text-sm mb-10">{CUE[phase].count}</Text>

      <View style={{ height: 240, justifyContent: "flex-end" }}>
        <Animated.View
          style={[
            {
              width: 80,
              borderRadius: 999,
              backgroundColor: "#9BCE5C",
              shadowColor: "#7CB342",
              shadowOpacity: 0.5,
              shadowRadius: 40,
            },
            barStyle,
          ]}
        />
      </View>

      <View className="mt-10">
        <Mascot size={64} breathing="slow" />
      </View>
      <Text className="text-white/40 text-xs mt-6">
        Ronde {round} van 4
      </Text>
    </View>
  );
}
