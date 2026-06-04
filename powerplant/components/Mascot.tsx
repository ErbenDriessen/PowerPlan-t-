// powerplant/components/Mascot.tsx
//
// Sprout — de mascotte. Hi-res, één schaalbare SVG met zachte gradient-
// shading (geport uit het prototype "Sprout mascot.html"). De gradient-id's
// zijn per instance uniek (useId), zodat meerdere Sprouts op één scherm
// elkaars gradients niet overschrijven.
import { useEffect, useId } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

type Props = { size?: number; breathing?: "off" | "fast" | "slow" };

export function Mascot({ size = 100, breathing = "off" }: Props) {
  const scale = useSharedValue(1);
  const raw = useId();
  const uid = raw.replace(/:/g, ""); // ":" breekt url(#…)-verwijzingen

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

  const id = (k: string) => `${uid}-${k}`;
  const url = (k: string) => `url(#${id(k)})`;

  return (
    <Animated.View style={[{ width: size, height: size * 1.1 }, style]}>
      <Svg viewBox="0 0 300 320" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <RadialGradient id={id("body")} cx="40%" cy="32%" r="78%">
            <Stop offset="0" stopColor="#BCE684" />
            <Stop offset="0.52" stopColor="#86C24A" />
            <Stop offset="1" stopColor="#5C982C" />
          </RadialGradient>
          <LinearGradient id={id("lap")} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6FAC3A" />
            <Stop offset="1" stopColor="#4C8124" />
          </LinearGradient>
          <LinearGradient id={id("leaf")} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#A6D866" />
            <Stop offset="1" stopColor="#5C982C" />
          </LinearGradient>
          <RadialGradient id={id("belly")} cx="50%" cy="42%" r="58%">
            <Stop offset="0" stopColor="#DCF3AE" stopOpacity="0.85" />
            <Stop offset="1" stopColor="#DCF3AE" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#9BCE5C" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#9BCE5C" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={id("shine")} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* aura + grondschaduw */}
        <Circle cx="150" cy="186" r="128" fill={url("aura")} />
        <Ellipse cx="150" cy="300" rx="78" ry="12" fill="#000000" opacity={0.18} />

        {/* steel + blaadjes */}
        <Path
          d="M150 120 C149 104 150 96 150 82"
          fill="none"
          stroke="#5C982C"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <G>
          <Path d="M150 96 C162 82 182 74 196 73 C193 91 174 102 151 101 Z" fill={url("leaf")} />
          <Path d="M150 102 C137 90 122 75 117 60 C133 59 150 75 153 98 Z" fill={url("leaf")} />
          <Path
            d="M156 92 C168 86 180 81 190 79"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.45}
          />
          <Path
            d="M147 92 C137 84 129 76 124 67"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.4}
          />
          <Circle cx="186" cy="78" r="3" fill="#FFFFFF" opacity={0.6} />
        </G>

        {/* lijf */}
        <Path
          d="M150 116 C196 116 224 152 224 200 C224 250 193 280 150 280 C107 280 76 250 76 200 C76 152 104 116 150 116 Z"
          fill={url("body")}
        />
        <Ellipse cx="150" cy="210" rx="56" ry="62" fill={url("belly")} />
        <Ellipse
          cx="116"
          cy="162"
          rx="20"
          ry="28"
          fill={url("shine")}
          transform="rotate(-18 116 162)"
        />

        {/* gekruiste benen */}
        <Path
          d="M82 268 C82 253 116 247 150 247 C184 247 218 253 218 268 C218 286 184 295 150 295 C116 295 82 286 82 268 Z"
          fill={url("lap")}
        />
        <Path
          d="M98 259 C124 252 176 252 202 259"
          fill="none"
          stroke="#9BD15E"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.5}
        />
        <Ellipse cx="120" cy="284" rx="15" ry="10" fill="#7CB342" />
        <Ellipse cx="180" cy="284" rx="15" ry="10" fill="#7CB342" />
        <Path
          d="M150 248 C146 262 146 276 150 288"
          fill="none"
          stroke="#3E6E22"
          strokeWidth="2.5"
          opacity={0.35}
          strokeLinecap="round"
        />

        {/* armen */}
        <Path
          d="M101 202 C86 224 90 248 122 258"
          fill="none"
          stroke={url("body")}
          strokeWidth="23"
          strokeLinecap="round"
        />
        <Path
          d="M199 202 C214 224 210 248 178 258"
          fill="none"
          stroke={url("body")}
          strokeWidth="23"
          strokeLinecap="round"
        />
        {/* rustende handen */}
        <Ellipse cx="128" cy="260" rx="17" ry="12" fill="#86C24A" />
        <Ellipse cx="172" cy="260" rx="17" ry="12" fill="#86C24A" />
        <Ellipse cx="128" cy="257" rx="13" ry="7" fill="#A6D866" opacity={0.55} />
        <Ellipse cx="172" cy="257" rx="13" ry="7" fill="#A6D866" opacity={0.55} />

        {/* gezicht */}
        <G>
          <Ellipse cx="111" cy="210" rx="12" ry="7.5" fill="#F4A29A" opacity={0.55} />
          <Ellipse cx="189" cy="210" rx="12" ry="7.5" fill="#F4A29A" opacity={0.55} />
          <Path
            d="M114 196 Q125 205 136 196"
            fill="none"
            stroke="#2E5D3A"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <Path
            d="M164 196 Q175 205 186 196"
            fill="none"
            stroke="#2E5D3A"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <Path
            d="M112 197 l-4 -2 M188 197 l4 -2"
            stroke="#2E5D3A"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={0.7}
          />
          <Path
            d="M140 213 Q150 224 160 213"
            fill="none"
            stroke="#2E5D3A"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </Animated.View>
  );
}
