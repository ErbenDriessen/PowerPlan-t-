// powerplant/app/focus/running.tsx
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { Mascot } from "../../components/Mascot";
import { ProgressRing } from "../../components/ProgressRing";
import { useFocusStore } from "../../stores/useFocusStore";
import { useUserStore } from "../../stores/useUserStore";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function FocusRunning() {
  useKeepAwake();
  const remaining = useFocusStore((s) => s.remaining);
  const total = useFocusStore((s) => s.total);
  const isBreak = useFocusStore((s) => s.isBreak);
  const currentRnd = useFocusStore((s) => s.currentRnd);
  const rnds = useFocusStore((s) => s.rnds);
  const finished = useFocusStore((s) => s.finished);
  const tick = useFocusStore((s) => s.tick);
  const nextPhase = useFocusStore((s) => s.nextPhase);
  const stop = useFocusStore((s) => s.stop);
  const addPoints = useUserStore((s) => s.addPoints);

  const wasBreak = useRef(isBreak);

  // tick every second
  useEffect(() => {
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [tick]);

  // transition phases
  useEffect(() => {
    if (remaining === 0 && total > 0) {
      if (!isBreak) addPoints(20, 0.1);
      nextPhase();
    }
  }, [remaining, total, isBreak, addPoints, nextPhase]);

  // exit when finished
  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => router.replace("/(tabs)/home" as any), 2200);
      return () => clearTimeout(t);
    }
  }, [finished]);

  const progress = total ? 1 - remaining / total : 0;
  const label = finished
    ? "Klaar"
    : `${isBreak ? "Pauze" : "Werkblok"} ${currentRnd} van ${rnds}`;
  const mode = finished ? "Mooi gedaan." : isBreak ? "Pauze" : "Focus";
  const quote = finished
    ? "Je boom groeide vandaag. 🌿"
    : isBreak
      ? "Strek je benen. Drink wat water. Sprout wacht hier."
      : "Adem rustig in… en uit. Sprout zit met je mee.";

  return (
    <View className="flex-1 bg-night items-center justify-between py-12 px-6">
      <View className="items-center">
        <Text className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">
          {label}
        </Text>
        <Text className="text-white/80 text-sm font-semibold mt-1">{mode}</Text>
      </View>

      <View className="items-center justify-center" style={{ width: 300, height: 300 }}>
        <View style={{ position: "absolute" }}>
          <ProgressRing
            size={300}
            progress={progress}
            color={isBreak ? "#FFE38A" : "#9BCE5C"}
          />
        </View>
        <View className="items-center">
          <Text className="text-white text-7xl font-extrabold tabular-nums">
            {finished ? "✓" : fmt(remaining)}
          </Text>
          <Text className="text-white/40 text-xs uppercase tracking-[0.3em] mt-1 font-bold">
            {finished ? "" : isBreak ? "rust even" : "tikt rustig"}
          </Text>
        </View>
      </View>

      <View className="items-center gap-3">
        <Mascot size={96} breathing="fast" />
        <Text className="text-white/55 text-xs italic text-center px-6">{quote}</Text>
      </View>

      <Pressable
        onPress={() => {
          stop();
          router.back();
        }}
      >
        <Text className="text-white/35 text-[11px] font-bold">Noodstop</Text>
      </Pressable>
    </View>
  );
}
