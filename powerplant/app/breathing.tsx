// powerplant/app/breathing.tsx
//
// Ademhalingsoefening met een setup-stap (kies techniek + rondes, zelfde
// tegel-UI als meditatie/focus) en daarna een geanimeerde adem-balk. De
// hele sessie loopt via één opgeruimde sequentie, zodat de animatie netjes
// door alle rondes loopt zonder dubbele timers.
import { useKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BackButton } from "../components/BackButton";
import { DuskBackground } from "../components/DuskBackground";
import { FakeStatusBar } from "../components/FakeStatusBar";
import { GlassCard } from "../components/GlassCard";
import { Mascot } from "../components/Mascot";
import { PrimaryButton } from "../components/buttons";

type Phase = "in" | "holdIn" | "out" | "holdOut";
type Stage = "setup" | "running" | "done";

type Pattern = {
  id: string;
  label: string;
  note: string;
  in: number;
  holdIn: number;
  out: number;
  holdOut: number;
};

const PATTERNS: Pattern[] = [
  { id: "478", label: "4-7-8", note: "ontspannen", in: 4, holdIn: 7, out: 8, holdOut: 0 },
  { id: "box", label: "Box", note: "4·4·4·4", in: 4, holdIn: 4, out: 4, holdOut: 4 },
  { id: "55", label: "5-5", note: "in balans", in: 5, holdIn: 0, out: 5, holdOut: 0 },
];

const CUE: Record<Phase, string> = {
  in: "Adem in…",
  holdIn: "Houd vast…",
  out: "Adem uit…",
  holdOut: "Rust…",
};

const BAR_MIN = 30;
const BAR_MAX = 220;

export default function Breathing() {
  useKeepAwake();
  const [stage, setStage] = useState<Stage>("setup");
  const [patternId, setPatternId] = useState("478");
  const [rounds, setRounds] = useState(4);

  // Live weergave tijdens het ademen.
  const [phase, setPhase] = useState<Phase>("in");
  const [round, setRound] = useState(1);
  const [stepSecs, setStepSecs] = useState(0);

  const height = useSharedValue(BAR_MIN);
  const barStyle = useAnimatedStyle(() => ({ height: height.value }));

  const pattern = PATTERNS.find((p) => p.id === patternId) ?? PATTERNS[0];

  // Eén sequentie die alle fases van alle rondes afloopt. Start zodra we
  // naar "running" gaan en wordt netjes opgeruimd bij stoppen — geen
  // dubbele timer-kettingen.
  useEffect(() => {
    if (stage !== "running") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const seq: { phase: Phase; secs: number; round: number }[] = [];
    for (let r = 1; r <= rounds; r++) {
      seq.push({ phase: "in", secs: pattern.in, round: r });
      if (pattern.holdIn > 0) seq.push({ phase: "holdIn", secs: pattern.holdIn, round: r });
      seq.push({ phase: "out", secs: pattern.out, round: r });
      if (pattern.holdOut > 0) seq.push({ phase: "holdOut", secs: pattern.holdOut, round: r });
    }

    height.value = BAR_MIN;
    let i = 0;
    const step = () => {
      if (cancelled) return;
      if (i >= seq.length) {
        setStage("done");
        return;
      }
      const s = seq[i++];
      setPhase(s.phase);
      setRound(s.round);
      setStepSecs(s.secs);
      if (s.phase === "in") {
        height.value = withTiming(BAR_MAX, { duration: s.secs * 1000, easing: Easing.inOut(Easing.sin) });
      } else if (s.phase === "out") {
        height.value = withTiming(BAR_MIN, { duration: s.secs * 1000, easing: Easing.inOut(Easing.sin) });
      }
      // holdIn/holdOut: balk blijft staan.
      timer = setTimeout(step, s.secs * 1000);
    };
    step();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [stage, rounds, pattern, height]);

  // Na afloop rustig terug.
  useEffect(() => {
    if (stage !== "done") return;
    const t = setTimeout(() => router.back(), 2200);
    return () => clearTimeout(t);
  }, [stage]);

  // ───────── Setup ─────────
  if (stage === "setup") {
    return (
      <View className="flex-1">
        <DuskBackground variant="deep" />
        <FakeStatusBar />
        <View className="px-6 pt-2 flex-row items-center justify-between mb-3">
          <BackButton label="Terug" />
          <Text className="text-white text-base font-semibold">Ademhaling</Text>
          <View style={{ width: 36 }} />
        </View>

        <View className="px-6">
          <View className="items-center mt-2 mb-4">
            <Mascot size={130} breathing="slow" />
          </View>

          <GlassCard className="p-6 mb-4">
            <Text className="text-white text-2xl font-extrabold text-center mb-1">
              Even ademhalen
            </Text>
            <Text className="text-white/65 text-sm text-center mb-5">
              Kies een ritme. Sprout ademt met je mee.
            </Text>

            <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
              Techniek
            </Text>
            <View className="flex-row gap-2 mb-5">
              {PATTERNS.map((p) => {
                const selected = p.id === patternId;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPatternId(p.id)}
                    className={`flex-1 py-3 rounded-2xl items-center ${
                      selected
                        ? "bg-primary border border-primary-soft"
                        : "bg-white/[0.06] border border-white/10"
                    }`}
                  >
                    <Text className="text-white text-base font-bold">{p.label}</Text>
                    <Text className="text-white/50 text-[10px] font-semibold">{p.note}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
              Rondes
            </Text>
            <View className="flex-row gap-2">
              {[3, 4, 5, 6].map((n) => {
                const selected = n === rounds;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setRounds(n)}
                    className={`flex-1 py-3 rounded-2xl items-center ${
                      selected
                        ? "bg-primary border border-primary-soft"
                        : "bg-white/[0.06] border border-white/10"
                    }`}
                  >
                    <Text className="text-white font-bold">{n}</Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          <PrimaryButton
            label="Start ademhaling"
            onPress={() => {
              setRound(1);
              setPhase("in");
              setStage("running");
            }}
          />
          <Text className="text-center text-white/45 text-xs mt-3">
            Je kunt op elk moment stoppen.
          </Text>
        </View>
      </View>
    );
  }

  // ───────── Done ─────────
  if (stage === "done") {
    return (
      <View className="flex-1 items-center justify-center">
        <LinearGradient
          colors={["#1B3A2F", "#0F2820"] as [string, string]}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <Mascot size={140} breathing="slow" />
        <Text className="text-white text-3xl font-extrabold mt-6">Mooi gedaan 🌿</Text>
        <Text className="text-white/55 text-sm mt-2">Neem nog even een rustige adem.</Text>
      </View>
    );
  }

  // ───────── Running ─────────
  return (
    <View className="flex-1 items-center justify-center">
      <LinearGradient
        colors={["#1B3A2F", "#0F2820"] as [string, string]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <Text className="text-white text-3xl font-extrabold mb-2">{CUE[phase]}</Text>
      <Text className="text-white/50 text-sm mb-10">{stepSecs} sec</Text>

      <View style={{ height: 240, justifyContent: "flex-end" }}>
        <Animated.View
          style={[
            {
              width: 80,
              borderRadius: 999,
              backgroundColor: "#9BCE5C",
              shadowColor: "#7CB342",
              shadowOpacity: 0.5,
              shadowRadius: 40,
            },
            barStyle,
          ]}
        />
      </View>

      <View className="mt-10">
        <Mascot size={64} breathing="slow" />
      </View>
      <Text className="text-white/40 text-xs mt-6">
        Ronde {round} van {rounds}
      </Text>

      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        className="absolute bottom-12 left-0 right-0 items-center"
      >
        <Text className="text-white/45 text-xs font-bold">Stoppen</Text>
      </Pressable>
    </View>
  );
}
