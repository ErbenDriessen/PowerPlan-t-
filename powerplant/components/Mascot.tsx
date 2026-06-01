import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Ellipse, G, Line, Path } from "react-native-svg";

type Props = { size?: number; breathing?: "off" | "fast" | "slow" };

export function Mascot({ size = 100, breathing = "off" }: Props) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (breathing === "off") return;
    const dur = breathing === "fast" ? 4800 : 7000;
    scale.value = withRepeat(
      withTiming(1.04, { duration: dur / 2, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breathing]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size * 1.1 }, style]}>
      <Svg viewBox="0 0 100 110" width="100%" height="100%">
        <Ellipse cx="50" cy="92" rx="26" ry="7" fill="#6BA235" />
        <Ellipse cx="50" cy="90" rx="26" ry="6" fill="#7CB342" />
        <Path
          d="M50 22 C30 22 22 42 22 60 C22 78 34 86 50 86 C66 86 78 78 78 60 C78 42 70 22 50 22 Z"
          fill="#7CB342"
        />
        <Path
          d="M34 42 C30 50 30 60 34 68 C38 60 38 50 34 42 Z"
          fill="#9BCE5C"
          opacity={0.55}
        />
        <Ellipse cx="26" cy="78" rx="9" ry="5" fill="#6BA235" transform="rotate(-15 26 78)" />
        <Ellipse cx="74" cy="78" rx="9" ry="5" fill="#6BA235" transform="rotate(15 74 78)" />
        <G>
          <Path d="M50 22 C49 16 45 12 47 6 C50 9 53 14 52 22 Z" fill="#2E5D3A" />
          <Path d="M50 22 C51 16 55 12 53 6 C50 9 47 14 48 22 Z" fill="#4F7F3F" />
          <Line x1="50" y1="22" x2="50" y2="14" stroke="#2E5D3A" strokeWidth="0.8" />
        </G>
        <Path
          d="M37 52 Q41 56 45 52"
          stroke="#2E5D3A"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M55 52 Q59 56 63 52"
          stroke="#2E5D3A"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <Ellipse cx="34" cy="62" rx="3.5" ry="2.2" fill="#F4A6A0" opacity={0.55} />
        <Ellipse cx="66" cy="62" rx="3.5" ry="2.2" fill="#F4A6A0" opacity={0.55} />
        <Path
          d="M44 64 Q50 70 56 64"
          stroke="#2E5D3A"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}
