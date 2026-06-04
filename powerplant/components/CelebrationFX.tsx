// powerplant/components/CelebrationFX.tsx
//
// Feestelijke flair achter de volgroeide boom in de prestige-popup, geport
// uit "Prestige flow.html": een zachte glow-core, langzaam draaiende
// lichtstralen, en een eenmalig confetti-schot bij openen.
//
// Bedoeld om absoluut over een kaart te liggen (inset 0), ACHTER de inhoud.
// `trigger` herstart het confetti-schot elke keer dat de popup opent;
// `accent` kleurt de glow mee met de boomsoort.
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  FeGaussianBlur,
  Filter,
  G,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

const RAY_COUNT = 12;
const CONFETTI_COUNT = 24;
const CONFETTI_COLORS = ["#9BCE5C", "#FFE8A0", "#E0B33C", "#D65A52", "#9B6BC4", "#7CB342"];

type PieceCfg = {
  color: string;
  leftPct: number;
  delay: number;
  drift: number;
  size: number;
};

function ConfettiPiece({ cfg, trigger }: { cfg: PieceCfg; trigger: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = 0;
    p.value = withDelay(cfg.delay, withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }));
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.1, 0.8, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(p.value, [0, 1], [-10, 250]) },
      { translateX: interpolate(p.value, [0, 1], [0, cfg.drift]) },
      { rotate: `${p.value * 420}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 22,
          left: `${cfg.leftPct}%`,
          width: cfg.size,
          height: cfg.size,
          borderRadius: 2,
          backgroundColor: cfg.color,
        },
        style,
      ]}
    />
  );
}

export function CelebrationFX({ trigger, accent = "#9BCE5C" }: { trigger: number; accent?: string }) {
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 16000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.92 + pulse.value * 0.16 }],
    opacity: 0.85 + pulse.value * 0.15,
  }));

  const pieces = useMemo<PieceCfg[]>(
    () =>
      Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        leftPct: 8 + Math.random() * 84,
        delay: Math.random() * 450,
        drift: (Math.random() - 0.5) * 64,
        size: 7 + Math.round(Math.random() * 3),
      })),
    [],
  );

  const rays = useMemo(
    () => Array.from({ length: RAY_COUNT }, (_, i) => (i * 360) / RAY_COUNT),
    [],
  );

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, overflow: "hidden" }}
    >
      {/* glow-core (gecentreerd op de boom, ~150px van boven) */}
      <Animated.View
        style={[{ position: "absolute", top: 0, left: "50%", marginLeft: -150, width: 300, height: 300 }, pulseStyle]}
      >
        <Svg width={300} height={300} viewBox="0 0 300 300">
          <Defs>
            <RadialGradient id="fxGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={accent} stopOpacity="0.42" />
              <Stop offset="0.34" stopColor="#FFF4C2" stopOpacity="0.16" />
              <Stop offset="0.62" stopColor="#FFF4C2" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="150" cy="150" r="150" fill="url(#fxGlow)" />
        </Svg>
      </Animated.View>

      {/* langzaam draaiende lichtstralen — geblurd tot zachte lichtstrepen.
          De rotatie zit op de Animated.View, dus de geblurde svg wordt één
          keer gerasterd en die bitmap draait (goedkoop + soepel). */}
      <Animated.View
        style={[{ position: "absolute", top: 0, left: "50%", marginLeft: -150, width: 300, height: 300 }, spinStyle]}
      >
        <Svg width={300} height={300} viewBox="0 0 300 300">
          <Defs>
            {/* bright in het midden van de straal, vervaagt naar beide einden */}
            <LinearGradient id="fxRay" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFF8DC" stopOpacity="0" />
              <Stop offset="0.5" stopColor="#FFF4C2" stopOpacity="0.32" />
              <Stop offset="1" stopColor="#FFF8DC" stopOpacity="0" />
            </LinearGradient>
            <Filter id="fxSoften" x="-40%" y="-40%" width="180%" height="180%">
              <FeGaussianBlur stdDeviation="5" />
            </Filter>
          </Defs>
          <G filter="url(#fxSoften)">
            {rays.map((a, i) => (
              <Rect
                key={i}
                x={140}
                y={8}
                width={20}
                height={150}
                rx={10}
                fill="url(#fxRay)"
                transform={`rotate(${a} 150 150)`}
              />
            ))}
          </G>
        </Svg>
      </Animated.View>

      {/* confetti-schot */}
      {pieces.map((cfg, i) => (
        <ConfettiPiece key={i} cfg={cfg} trigger={trigger} />
      ))}
    </View>
  );
}
