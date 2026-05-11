// powerplant/components/Star.tsx
import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = { top: string; left: string; delayMs?: number };

export function Star({ top, left, delayMs = 0 }: Props) {
  const o = useSharedValue(0.4);
  const s = useSharedValue(0.9);

  useEffect(() => {
    o.value = withDelay(
      delayMs,
      withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    s.value = withDelay(
      delayMs,
      withRepeat(withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [delayMs]);

  const style = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ scale: s.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute" as const,
          top: top as `${number}%`,
          left: left as `${number}%`,
          width: 2,
          height: 2,
          backgroundColor: "#FFF4C2",
          borderRadius: 1,
        },
        style,
      ]}
    />
  );
}
