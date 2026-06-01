// powerplant/app/focus/running.tsx
import { useKeepAwake } from "expo-keep-awake";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, Pressable, Text, View } from "react-native";
import { Mascot } from "../../components/Mascot";
import { ProgressRing } from "../../components/ProgressRing";
import {
  cancelScheduled,
  ensureNotificationPermission,
  scheduleAt,
} from "../../lib/notifications";
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
  const phaseEndAt = useFocusStore((s) => s.phaseEndAt);
  const completedWorkRounds = useFocusStore((s) => s.completedWorkRounds);
  const tick = useFocusStore((s) => s.tick);
  const stop = useFocusStore((s) => s.stop);
  const addPoints = useUserStore((s) => s.addPoints);

  const notifIdRef = useRef<string | null>(null);
  const prevCompletedRef = useRef(completedWorkRounds);

  // Ask for notification permission once (no-op in Expo Go).
  useEffect(() => {
    ensureNotificationPermission().catch(() => {});
  }, []);

  // Tick every second from wall-clock time. tick() handles phase rollovers.
  useEffect(() => {
    tick(); // immediate sync on mount
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [tick]);

  // Snap the countdown forward the moment we come back from background.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });
    return () => sub.remove();
  }, [tick]);

  // Award points whenever a work round completes. Uses a ref to detect
  // deltas, so backgrounded sessions that skip multiple rounds still pay out.
  useEffect(() => {
    const delta = completedWorkRounds - prevCompletedRef.current;
    if (delta > 0) addPoints(20 * delta, 0.1 * delta);
    prevCompletedRef.current = completedWorkRounds;
  }, [completedWorkRounds, addPoints]);

  // Schedule a notification at the next phase boundary, so the user is
  // pinged even if the app is backgrounded when the phase rolls over.
  // No-op in Expo Go (the wrapper handles that).
  useEffect(() => {
    const previousId = notifIdRef.current;
    notifIdRef.current = null;
    cancelScheduled(previousId).catch(() => {});

    if (finished || phaseEndAt === null) return;
    const ms = phaseEndAt - Date.now();
    if (ms <= 1500) return;

    let title: string;
    let body: string;
    if (!isBreak) {
      title = "Werktijd voorbij — pauze begint!";
      body = "Strek je benen even. Sprout wacht hier.";
    } else if (currentRnd < rnds) {
      title = "Pauze voorbij — terug aan het werk";
      body = `Ronde ${currentRnd + 1} van ${rnds} kan beginnen.`;
    } else {
      title = "Focusblok klaar! 🌳";
      body = "Mooi gedaan — je boom is weer wat gegroeid.";
    }

    scheduleAt(new Date(phaseEndAt), title, body)
      .then((id) => {
        notifIdRef.current = id;
      })
      .catch(() => {});

    return () => {
      const idToCancel = notifIdRef.current;
      notifIdRef.current = null;
      cancelScheduled(idToCancel).catch(() => {});
    };
  }, [phaseEndAt, isBreak, currentRnd, rnds, finished]);

  // exit when finished
  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => router.replace("/(tabs)/home" as any), 2200);
      return () => clearTimeout(t);
    }
  }, [finished]);

  // Countdown ring: starts full, drains counter-clockwise as time passes.
  const progress = total ? remaining / total : 0;
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
