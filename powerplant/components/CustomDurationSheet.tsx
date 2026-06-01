// powerplant/components/CustomDurationSheet.tsx
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { GhostButton, PrimaryButton } from "./buttons";

const SHEET_OFFSCREEN = 700;
const SWIPE_DISMISS_PX = 90;
const SWIPE_DISMISS_VELOCITY = 700;

function StepperCard({
  label,
  value,
  unit,
  hint,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  unit: string;
  hint?: string;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const bump = (delta: number) => {
    const next = clamp(value + delta);
    if (next !== value) {
      Haptics.selectionAsync().catch(() => {});
      onChange(next);
    }
  };
  return (
    <View className="bg-white/[0.07] border border-white/10 rounded-3xl px-5 py-5 mb-3">
      <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-3 text-center">
        {label}
      </Text>
      <View className="flex-row items-center justify-center" style={{ gap: 24 }}>
        <Pressable
          onPress={() => bump(-step)}
          hitSlop={16}
          accessibilityLabel={`${label} omlaag`}
          className="w-12 h-12 rounded-full border border-white/20 bg-white/[0.06] items-center justify-center active:opacity-60"
        >
          <Text className="text-white text-2xl font-bold">−</Text>
        </Pressable>
        <View className="items-center" style={{ minWidth: 110 }}>
          <Text className="text-white text-5xl font-extrabold tabular-nums">{value}</Text>
          <Text className="text-white/50 text-xs font-semibold mt-1">{unit}</Text>
        </View>
        <Pressable
          onPress={() => bump(step)}
          hitSlop={16}
          accessibilityLabel={`${label} omhoog`}
          className="w-12 h-12 rounded-full border border-white/20 bg-white/[0.06] items-center justify-center active:opacity-60"
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </Pressable>
      </View>
      {hint ? (
        <Text className="text-white/45 text-[11px] text-center mt-3">{hint}</Text>
      ) : null}
    </View>
  );
}

export function CustomDurationSheet({
  visible,
  initialDur,
  initialBrk,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  initialDur: number;
  initialBrk: number;
  onConfirm: (dur: number, brk: number) => void;
  onCancel: () => void;
}) {
  // Keep mounted during the close animation so the slide-down stays visible.
  const [mounted, setMounted] = useState(visible);
  const [dur, setDur] = useState(initialDur);
  const [brk, setBrk] = useState(initialBrk);

  const translateY = useSharedValue(SHEET_OFFSCREEN);
  const backdrop = useSharedValue(0);

  // Latest initial values via ref so the open-effect only fires on `visible`
  // change — prevents re-opens from getting stuck on stale animation state.
  const initialDurRef = useRef(initialDur);
  const initialBrkRef = useRef(initialBrk);
  initialDurRef.current = initialDur;
  initialBrkRef.current = initialBrk;

  useEffect(() => {
    if (visible) {
      // Force a clean starting position even if the previous close was
      // cancelled mid-flight; otherwise the open animation can be a no-op.
      translateY.value = SHEET_OFFSCREEN;
      setMounted(true);
      setDur(initialDurRef.current);
      setBrk(initialBrkRef.current);
      translateY.value = withTiming(0, {
        duration: 340,
        easing: Easing.out(Easing.cubic),
      });
      backdrop.value = withTiming(1, { duration: 240 });
    } else {
      translateY.value = withTiming(SHEET_OFFSCREEN, {
        duration: 280,
        easing: Easing.in(Easing.cubic),
      });
      backdrop.value = withTiming(0, { duration: 280 }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
  }, [visible, translateY, backdrop]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  const confirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onConfirm(dur, brk);
  };

  // Swipe-down on the drag handle dismisses the sheet.
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > SWIPE_DISMISS_PX || e.velocityY > SWIPE_DISMISS_VELOCITY) {
        runOnJS(onCancel)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const ratioHint = `1 ronde duurt ${dur + brk} min in totaal`;

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      {/* GestureHandlerRootView is needed inside Modal — the modal renders
          in a separate native window that doesn't inherit the app-root one. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onCancel} accessibilityLabel="Sluit instellen" />
        </Animated.View>

        <Animated.View style={[styles.sheetWrap, sheetStyle]}>
          <View style={styles.sheet}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.dragHandleZone}>
                <View style={styles.grabber} />
                <Text className="text-white text-2xl font-extrabold text-center mt-1">
                  Eigen ritme
                </Text>
                <Text className="text-white/55 text-sm text-center mt-1 mb-5">
                  Hoe lang werk je en hoe lang pauzeer je per ronde?
                </Text>
              </View>
            </GestureDetector>

            <StepperCard
              label="Werktijd"
              value={dur}
              unit="minuten"
              onChange={setDur}
              min={5}
              max={90}
              step={5}
            />
            <StepperCard
              label="Pauze"
              value={brk}
              unit="minuten"
              onChange={setBrk}
              min={1}
              max={30}
              step={1}
              hint={ratioHint}
            />

            <View style={{ marginTop: 14 }}>
              <PrimaryButton label={`Bevestig ${dur}/${brk}`} onPress={confirm} />
              <View style={{ height: 10 }} />
              <GhostButton label="Annuleren" onPress={onCancel} />
            </View>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: "#1B3A2F",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 36,
  },
  // Bigger drag-handle hit area than the visible bar alone, so a slow
  // swipe near the title still triggers the dismiss gesture.
  dragHandleZone: {
    paddingBottom: 4,
  },
  grabber: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.28)",
    marginBottom: 12,
  },
});
