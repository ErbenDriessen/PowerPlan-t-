// powerplant/components/Tree.tsx
//
// Standalone tree component for the home hero card. Uses the *actual*
// stage sprite from the atlas per growth stage (sapling → mature), so
// the user sees the tree's silhouette transform as it grows — not just
// a shrunken mature tree. Each stage renders at its own sensible
// height to keep saplings crisp.

import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { getTreeSprite } from "../lib/plantSprites";
import { PlantSprite } from "./PlantSprite";

// Design-pixel heights per stage. Tuned so each stage looks meaningful
// without aggressive upscaling of the small early sprites. Callers can
// pass `size` to proportionally scale the whole curve up or down.
const STAGE_HEIGHTS = [60, 92, 124, 150, 170] as const;
const BASELINE = STAGE_HEIGHTS[4];

type Props = {
  /** Display height at the mature (final) stage. Earlier stages render
   *  proportionally smaller, using their own stage sprite. */
  size?: number;
  /** Growth stage 1..5. */
  stage?: number;
  /** Species index 0..2. */
  species?: number;
  sway?: boolean;
};

export function Tree({ size = BASELINE, stage = 5, species = 0, sway = true }: Props) {
  const rot = useSharedValue(0);

  useEffect(() => {
    if (!sway) return;
    rot.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [sway]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  const visibleStage = Math.max(0, Math.min(STAGE_HEIGHTS.length - 1, stage - 1));
  const sizeFactor = size / BASELINE;
  const renderHeight = STAGE_HEIGHTS[visibleStage] * sizeFactor;
  const sprite = getTreeSprite(species, visibleStage);

  return (
    <Animated.View
      style={[
        { alignItems: "center", justifyContent: "flex-end", transformOrigin: "bottom" },
        style,
      ]}
    >
      <PlantSprite rect={sprite} height={renderHeight} />
    </Animated.View>
  );
}
