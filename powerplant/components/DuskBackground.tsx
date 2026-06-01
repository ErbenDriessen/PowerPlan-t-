// powerplant/components/DuskBackground.tsx
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Star } from "./Star";

type Variant = "default" | "warm" | "deep";

const PALETTES: Record<Variant, string[]> = {
  default: ["#A8C8A0", "#7AA37C", "#4E7B58", "#2C5238", "#1B3A2A"],
  warm: ["#C2C29A", "#94A77B", "#5F7E5A", "#38543C", "#1F3826"],
  deep: ["#5C8262", "#3F6B49", "#25422D", "#25422D", "#25422D"],
};

type Props = {
  variant?: Variant;
  showStars?: boolean;
  showMoon?: boolean;
  moonPosition?: { top: number; right?: number; left?: number; size?: number; opacity?: number };
};

export function DuskBackground({
  variant = "default",
  showStars = true,
  showMoon = true,
  moonPosition,
}: Props) {
  const colors = PALETTES[variant] as [string, string, ...string[]];

  return (
    <View pointerEvents="none" className="absolute inset-0">
      <LinearGradient colors={colors} locations={[0, 0.28, 0.6, 0.88, 1]} style={{ flex: 1 }} />

      {showStars && (
        <View className="absolute inset-0">
          <Star top="8%" left="18%" />
          <Star top="14%" left="74%" delayMs={1000} />
          <Star top="22%" left="42%" delayMs={2000} />
          <Star top="10%" left="88%" delayMs={500} />
          <Star top="28%" left="18%" delayMs={1500} />
        </View>
      )}

      {showMoon && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: moonPosition?.top ?? 110,
            right: moonPosition?.right ?? 24,
            left: moonPosition?.left,
            width: moonPosition?.size ?? 140,
            height: moonPosition?.size ?? 140,
            opacity: moonPosition?.opacity ?? 1,
          }}
        >
          <Svg width="100%" height="100%" viewBox="0 0 140 140">
            <Path
              d="M0,70 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0"
              fill="rgba(255,250,210,0.40)"
            />
          </Svg>
        </View>
      )}

      {/* Hill silhouettes */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 170 }}
      >
        <Svg width="100%" height={170} viewBox="0 0 390 170" preserveAspectRatio="none">
          <Path d="M0 110 Q60 70 130 90 T260 85 T390 100 L390 170 L0 170 Z" fill="#1B3A2A" opacity={0.55} />
          <Path d="M0 135 Q80 105 160 120 T320 125 T390 135 L390 170 L0 170 Z" fill="#0F2218" opacity={0.78} />
        </Svg>
      </View>
    </View>
  );
}
