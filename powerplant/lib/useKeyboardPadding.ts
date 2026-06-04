// powerplant/lib/useKeyboardPadding.ts
//
// Geeft een geanimeerde stijl ({ paddingBottom }) terug die soepel
// meebeweegt met het toetsenbord. Gebruik 'm op een <Animated.View> die
// een ScrollView of bottom-sheet omhult, zodat invoervelden vloeiend boven
// het toetsenbord schuiven i.p.v. er hard in te springen.
//
// Werkt in Expo Go (gebaseerd op de RN Keyboard-events + reanimated) en
// dus ook met Android edge-to-edge.
import { useEffect } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function useKeyboardPadding() {
  const height = useSharedValue(0);

  useEffect(() => {
    // iOS levert "will"-events mét duur (perfect synced); Android alleen
    // "did"-events, dus daar animeren we met een nette vaste duur.
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: KeyboardEvent) => {
      height.value = withTiming(e.endCoordinates.height, {
        duration: e.duration || 250,
        easing: Easing.out(Easing.cubic),
      });
    };
    const onHide = (e: KeyboardEvent) => {
      height.value = withTiming(0, {
        duration: e.duration || 220,
        easing: Easing.out(Easing.cubic),
      });
    };

    const showSub = Keyboard.addListener(showEvt, onShow);
    const hideSub = Keyboard.addListener(hideEvt, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [height]);

  return useAnimatedStyle(() => ({ paddingBottom: height.value }));
}
