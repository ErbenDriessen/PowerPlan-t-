import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

type Props = { size?: number; stage?: 1 | 2 | 3 | 4 | 5 | 6 | 7; sway?: boolean };

// Linear scale of the foliage. Stage 7 = full size; stage 1 = sapling.
const STAGE_SCALE: Record<number, number> = {
  1: 0.35,
  2: 0.5,
  3: 0.7,
  4: 0.82,
  5: 0.92,
  6: 0.97,
  7: 1,
};

export function Tree({ size = 200, stage = 3, sway = true }: Props) {
  const rot = useSharedValue(0);
  useEffect(() => {
    if (!sway) return;
    rot.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [sway]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  const s = STAGE_SCALE[stage];

  return (
    <Animated.View style={[{ width: size, height: size * 1.2 }, style]}>
      <Svg viewBox="0 0 200 240" width="100%" height="100%">
        <Ellipse cx="100" cy="228" rx="64" ry="6" fill="#000" opacity={0.25} />
        <Path
          d="M92 228 C90 200 88 170 94 140 C98 120 100 105 100 90 C100 105 102 120 106 140 C112 170 110 200 108 228 Z"
          fill="#8B6F47"
        />
        <Path
          d="M100 228 C100 200 100 170 100 140 C100 120 100 105 100 90 L100 228 Z"
          fill="#6F5638"
          opacity={0.5}
        />
        <G origin="100 100" scale={s}>
          <Path
            d="M100 130 Q86 122 76 116"
            stroke="#8B6F47"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M100 124 Q116 116 128 110"
            stroke="#8B6F47"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="100" cy="92" r="44" fill="#7CB342" />
          <Circle cx="72" cy="108" r="32" fill="#6BA235" />
          <Circle cx="130" cy="106" r="32" fill="#8FC85A" />
          <Circle cx="100" cy="70" r="28" fill="#9BCE5C" />
          <Circle cx="86" cy="100" r="22" fill="#7CB342" />
          <Circle cx="118" cy="96" r="24" fill="#6BA235" />
          <Circle cx="60" cy="92" r="18" fill="#7CB342" />
          <Circle cx="140" cy="86" r="20" fill="#8FC85A" />
          <Circle cx="116" cy="74" r="7" fill="#C2E58E" opacity={0.7} />
          <Circle cx="80" cy="86" r="5" fill="#C2E58E" opacity={0.6} />
          <Circle cx="98" cy="58" r="4" fill="#C2E58E" opacity={0.5} />
        </G>
      </Svg>
    </Animated.View>
  );
}
