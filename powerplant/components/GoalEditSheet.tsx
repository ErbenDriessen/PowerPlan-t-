// powerplant/components/GoalEditSheet.tsx
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
import { useKeyboardPadding } from "../lib/useKeyboardPadding";
import { GhostButton, PrimaryButton } from "./buttons";

const SHEET_OFFSCREEN = 700;
const SWIPE_DISMISS_PX = 90;
const SWIPE_DISMISS_VELOCITY = 700;

export type GoalEditValue = {
  title: string;
  description: string;
};

export function GoalEditSheet({
  visible,
  mode,
  initial,
  onConfirm,
  onCancel,
  onDelete,
}: {
  visible: boolean;
  mode: "add" | "edit";
  initial: GoalEditValue;
  onConfirm: (value: GoalEditValue) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  // Keep mounted through the slide-down so the close animation is visible.
  const [mounted, setMounted] = useState(visible);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);

  const translateY = useSharedValue(SHEET_OFFSCREEN);
  const backdrop = useSharedValue(0);
  const keyboardPad = useKeyboardPadding();

  // Hold the latest `initial` in a ref so we can read it inside an effect
  // that only fires on `visible` change — avoids re-running the open
  // animation every render and reseting input state mid-edit.
  const initialRef = useRef(initial);
  initialRef.current = initial;

  useEffect(() => {
    if (visible) {
      // Force a clean starting position even if the previous close was
      // cancelled mid-flight; otherwise the open animation can be a no-op.
      translateY.value = SHEET_OFFSCREEN;
      setMounted(true);
      setTitle(initialRef.current.title);
      setDescription(initialRef.current.description);
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

  const submit = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      onCancel();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onConfirm({ title: cleanTitle, description: description.trim() });
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onDelete();
  };

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/* GestureHandlerRootView is needed inside Modal — the modal renders
          in a separate native window that doesn't inherit the app-root one. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onCancel} accessibilityLabel="Sluit doel" />
        </Animated.View>

        <Animated.View
          style={[styles.kavWrap, keyboardPad]}
          pointerEvents="box-none"
        >
          <Animated.View style={sheetStyle}>
            <View style={styles.sheet}>
              <GestureDetector gesture={panGesture}>
                <View style={styles.dragHandleZone}>
                  <View style={styles.grabber} />
                  <Text className="text-white text-xl font-extrabold text-center mt-1">
                    {mode === "add" ? "Nieuw doel" : "Doel bewerken"}
                  </Text>
                  <Text className="text-white/55 text-sm text-center mt-1 mb-5">
                    Korte titel, en eventueel een beschrijving.
                  </Text>
                </View>
              </GestureDetector>

              <View className="bg-white/[0.07] border border-white/10 rounded-3xl px-4 pt-3 pb-3 mb-3">
                <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-1.5">
                  Titel
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="bv. Wandelen"
                  placeholderTextColor="rgba(255,255,255,0.30)"
                  autoFocus
                  returnKeyType="next"
                  className="text-white text-base"
                  style={{ paddingVertical: 6 }}
                />
              </View>

              <View className="bg-white/[0.07] border border-white/10 rounded-3xl px-4 pt-3 pb-3 mb-5">
                <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-1.5">
                  Beschrijving{" "}
                  <Text className="text-white/30 text-[10px] normal-case">(optioneel)</Text>
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="bv. 15 min, buiten"
                  placeholderTextColor="rgba(255,255,255,0.30)"
                  returnKeyType="done"
                  onSubmitEditing={submit}
                  multiline
                  className="text-white text-base"
                  style={{ minHeight: 56, textAlignVertical: "top", paddingVertical: 6 }}
                />
              </View>

              <PrimaryButton label="Bewaren" onPress={submit} />
              <View style={{ height: 10 }} />
              <GhostButton label="Annuleren" onPress={onCancel} />

              {mode === "edit" && onDelete ? (
                <Pressable
                  onPress={handleDelete}
                  hitSlop={8}
                  style={{ marginTop: 14, alignSelf: "center" }}
                  accessibilityLabel="Verwijder dit doel"
                >
                  <Text className="text-white/55 text-sm font-bold">Verwijderen</Text>
                </Pressable>
              ) : null}
            </View>
          </Animated.View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  kavWrap: {
    flex: 1,
    justifyContent: "flex-end",
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
