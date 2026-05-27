// powerplant/components/PlantSprite.tsx
//
// Renders a single sprite from the Plants.png atlas by drawing the full
// (scaled) atlas inside an overflow-hidden viewport and translating the
// desired sprite rect into view. Cheap and avoids slicing the atlas into
// per-sprite PNG files.

import { Image, View } from "react-native";
import { ATLAS, SpriteRect } from "../lib/plantSprites";

type Props = {
  rect: SpriteRect;
  /** Display height in points. Width follows the sprite's aspect ratio. */
  height: number;
  /** Optional opacity, for atmospheric-perspective layering. */
  opacity?: number;
};

export function PlantSprite({ rect, height, opacity = 1 }: Props) {
  const scale = height / rect.h;
  const width = rect.w * scale;
  return (
    <View
      style={{
        width,
        height,
        overflow: "hidden",
        opacity,
      }}
    >
      <Image
        source={ATLAS.source}
        style={{
          width: ATLAS.width * scale,
          height: ATLAS.height * scale,
          transform: [
            { translateX: -rect.x * scale },
            { translateY: -rect.y * scale },
          ],
        }}
      />
    </View>
  );
}
