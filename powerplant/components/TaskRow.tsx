// powerplant/components/TaskRow.tsx
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  label: string;
  sub: string;
  time?: string;
  done: boolean;
  onToggle: () => void;
};

export function TaskRow({ label, sub, time, done, onToggle }: Props) {
  const floatY = useSharedValue(0);
  const floatO = useSharedValue(0);

  useEffect(() => {
    // run +10 float only when toggling on; reset on done=false
    if (done) {
      floatO.value = 0;
      floatO.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 900 }),
      );
      floatY.value = 0;
      floatY.value = withTiming(-40, { duration: 1100 });
    }
  }, [done]);

  const floatStyle = useAnimatedStyle(() => ({
    opacity: floatO.value,
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <Pressable onPress={onToggle} className="flex-row items-center gap-3 py-1.5">
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          done ? "bg-primary border-primary" : "border-white/30 bg-transparent"
        }`}
      >
        {done && (
          <View
            className="w-1.5 h-3 border-r-2 border-b-2 border-white"
            style={{ transform: [{ rotate: "45deg" }, { translateY: -2 }] }}
          />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm">{label}</Text>
        <Text className="text-white/55 text-xs">{sub}</Text>
      </View>
      {time ? (
        <Text className="text-white/65 font-bold text-xs tabular-nums">{time}</Text>
      ) : null}
      <Animated.Text
        style={[
          {
            position: "absolute",
            right: 10,
            color: "#9BCE5C",
            fontWeight: "800",
            fontSize: 14,
            textShadowColor: "rgba(155,206,92,0.6)",
            textShadowRadius: 12,
          },
          floatStyle,
        ]}
      >
        +10
      </Animated.Text>
    </Pressable>
  );
}
