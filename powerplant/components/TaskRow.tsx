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
  onEdit?: () => void;
};

export function TaskRow({ label, sub, time, done, onToggle, onEdit }: Props) {
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
    <View className="flex-row items-center py-1.5">
      {/* Toggle area: checkbox + label/sub. Its own Pressable so the edit
          button on the right never accidentally toggles the goal. */}
      <Pressable
        onPress={onToggle}
        className="flex-row items-center gap-3 flex-1"
      >
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
          {sub.length > 0 ? (
            <Text className="text-white/55 text-xs">{sub}</Text>
          ) : null}
        </View>
      </Pressable>

      {time ? (
        <Text className="text-white/65 font-bold text-xs tabular-nums mr-1">
          {time}
        </Text>
      ) : null}

      {onEdit ? (
        <Pressable
          onPress={onEdit}
          hitSlop={12}
          accessibilityLabel={`${label} bewerken`}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-white/[0.10]"
        >
          <Text className="text-white/60 text-2xl leading-none">⋯</Text>
        </Pressable>
      ) : null}

      <Animated.Text
        style={[
          {
            position: "absolute",
            right: 50,
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
    </View>
  );
}
