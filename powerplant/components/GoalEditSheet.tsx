// powerplant/components/GoalEditSheet.tsx
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { GhostButton, PrimaryButton } from "./buttons";

const SHEET_OFFSCREEN = 700;

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

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setTitle(initial.title);
      setDescription(initial.description);
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
      backdrop.value = withTiming(0, { duration: 240 }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
  }, [visible, initial.title, initial.description, translateY, backdrop]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

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
      <View style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onCancel} accessibilityLabel="Sluit doel" />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.kavWrap}
          pointerEvents="box-none"
        >
          <Animated.View style={sheetStyle}>
            <View style={styles.sheet}>
              <View style={styles.grabber} />

              <Text className="text-white text-xl font-extrabold text-center mt-1">
                {mode === "add" ? "Nieuw doel" : "Doel bewerken"}
              </Text>
              <Text className="text-white/55 text-sm text-center mt-1 mb-5">
                Korte titel, en eventueel een beschrijving.
              </Text>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Titel — bv. Wandelen"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoFocus
                returnKeyType="next"
                className="bg-white/[0.07] border border-white/15 rounded-2xl px-4 py-3 text-white text-base mb-3"
              />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Beschrijving — bv. 15 min, buiten (optioneel)"
                placeholderTextColor="rgba(255,255,255,0.35)"
                returnKeyType="done"
                onSubmitEditing={submit}
                multiline
                className="bg-white/[0.07] border border-white/15 rounded-2xl px-4 py-3 text-white text-base mb-5"
                style={{ minHeight: 64, textAlignVertical: "top" }}
              />

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
        </KeyboardAvoidingView>
      </View>
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
  grabber: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.28)",
    marginBottom: 12,
  },
});
