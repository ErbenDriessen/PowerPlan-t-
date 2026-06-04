// powerplant/components/WindowControls.tsx
//
// Demo-bediening voor het raam-uitzicht, getoond op het Mijn boom-scherm
// wanneer de toggle in Meer aanstaat. Sleep de tijdbalk of druk op
// "Speel dag af" om de scene door dag → schemering → nacht te laten lopen,
// of "Nu" om het raam weer de echte klok te laten volgen.
import Slider from "@react-native-community/slider";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { formatClock, sceneAt } from "../lib/skyScene";
import { GlassCard } from "./GlassCard";

// Speelt een hele dag (1440 min) af in ~14s.
const PLAY_TICK_MS = 80;
const PLAY_STEP_MIN = 8;

type Props = {
  /** Tijd die de scene nu toont (minuten sinds middernacht). */
  sceneMinutes: number;
  /** Volgt het raam de echte klok? (geen handmatige override) */
  isAuto: boolean;
  /** Zet een handmatige tijd (stopt het volgen van de klok). */
  onScrub: (minutes: number) => void;
  /** Laat het raam weer de echte klok volgen. */
  onAuto: () => void;
};

export function WindowControls({ sceneMinutes, isAuto, onScrub, onAuto }: Props) {
  const [playing, setPlaying] = useState(false);
  // Eigen lopende waarde tijdens het afspelen, los van de async prop-update.
  const playMinutes = useRef(sceneMinutes);

  // Houd de speel-cursor gelijk met de scene zolang we niet afspelen.
  useEffect(() => {
    if (!playing) playMinutes.current = sceneMinutes;
  }, [sceneMinutes, playing]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      playMinutes.current = (playMinutes.current + PLAY_STEP_MIN) % 1440;
      onScrub(playMinutes.current);
    }, PLAY_TICK_MS);
    return () => clearInterval(id);
  }, [playing, onScrub]);

  const phase = sceneAt(sceneMinutes).phase;

  function handleSlide(v: number) {
    if (playing) setPlaying(false);
    onScrub(Math.round(v));
  }

  function handleAuto() {
    if (playing) setPlaying(false);
    onAuto();
  }

  return (
    <GlassCard className="p-4 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white text-3xl font-extrabold tabular-nums">
          {formatClock(sceneMinutes)}
        </Text>
        <View className="flex-row items-center gap-2">
          {isAuto && (
            <View className="rounded-full px-2.5 py-1 bg-white/10 border border-white/15">
              <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                live
              </Text>
            </View>
          )}
          <View className="rounded-full px-3 py-1 bg-primary/20 border border-primary-soft">
            <Text className="text-primary-soft text-xs font-bold capitalize">{phase}</Text>
          </View>
        </View>
      </View>

      <Slider
        minimumValue={0}
        maximumValue={1440}
        step={1}
        value={sceneMinutes}
        onValueChange={handleSlide}
        minimumTrackTintColor="#9BCE5C"
        maximumTrackTintColor="rgba(255,255,255,0.18)"
        thumbTintColor="#FFFFFF"
      />
      <View className="flex-row justify-between px-1">
        {["00", "06", "12", "18", "24"].map((t) => (
          <Text key={t} className="text-white/40 text-[10px] font-semibold">
            {t}
          </Text>
        ))}
      </View>

      <View className="flex-row gap-2 mt-3">
        <Pressable
          onPress={() => setPlaying((p) => !p)}
          className="flex-1 rounded-2xl px-4 py-2.5 items-center bg-primary border border-primary-soft active:opacity-80"
        >
          <Text className="text-white font-bold text-sm">
            {playing ? "⏸ Pauze" : "▶ Speel dag af"}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleAuto}
          className={`flex-1 rounded-2xl px-4 py-2.5 items-center border active:opacity-80 ${
            isAuto ? "bg-white/5 border-white/10" : "bg-white/10 border-white/15"
          }`}
        >
          <Text className={`font-bold text-sm ${isAuto ? "text-white/40" : "text-white"}`}>
            🕐 Nu
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}
