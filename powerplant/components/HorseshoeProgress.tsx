// powerplant/components/HorseshoeProgress.tsx
//
// A U-shaped (horseshoe) progress arc with the opening at the bottom.
// Fills from the LEFT tip clockwise via the top to the RIGHT tip as
// `progress` goes from 0 to 1 — feels more natural for a daily progress
// dial since the "starting from 12 o'clock" feel of a full ring is
// arbitrary, while a horseshoe visually invites the user's eye to read
// left → right.

import { useEffect } from "react";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  size: number;
  progress: number; // 0..1
  strokeWidth?: number;
  /** Total opening at the bottom in degrees (centered on 6 o'clock). */
  openingDeg?: number;
  color?: string;
  trackColor?: string;
};

export function HorseshoeProgress({
  size,
  progress,
  strokeWidth = 4,
  openingDeg = 100,
  color = "#9BCE5C",
  trackColor = "rgba(255,255,255,0.12)",
}: Props) {
  // Geometry in the SVG's own viewBox (size × size).
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - strokeWidth * 2;

  // SVG angle convention: 0° = right, 90° = bottom, 180° = left, 270° = top.
  // Opening straddles 6 o'clock (90°), so the two tips sit at:
  //   left tip:  90° + openingDeg/2 = 140° (default)
  //   right tip: 90° - openingDeg/2 =  40° (default)
  // and the arc traces the long way around via the top.
  const half = openingDeg / 2;
  const leftAngle = (90 + half) * (Math.PI / 180);
  const rightAngle = (90 - half) * (Math.PI / 180);
  const startX = cx + r * Math.cos(leftAngle);
  const startY = cy + r * Math.sin(leftAngle);
  const endX = cx + r * Math.cos(rightAngle);
  const endY = cy + r * Math.sin(rightAngle);

  const arcSpanDeg = 360 - openingDeg;
  const arcLength = (Math.PI * r * arcSpanDeg) / 180;

  // Path traverses LEFT tip → top → RIGHT tip. large-arc=1 (long way),
  // sweep=1 means visually clockwise via the top in SVG coords.
  const d =
    `M ${startX.toFixed(2)} ${startY.toFixed(2)} ` +
    `A ${r} ${r} 0 1 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;

  const offset = useSharedValue(arcLength);

  useEffect(() => {
    offset.value = withTiming(
      arcLength * (1 - Math.max(0, Math.min(1, progress))),
      { duration: 600 },
    );
  }, [progress, arcLength]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <Svg width={size} height={size}>
      {/* Background track */}
      <Path
        d={d}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      {/* Animated fill */}
      <AnimatedPath
        d={d}
        stroke={color}
        strokeWidth={strokeWidth + 1}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={arcLength}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
