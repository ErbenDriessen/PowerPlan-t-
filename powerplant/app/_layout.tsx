// powerplant/app/_layout.tsx
import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppFonts } from "../hooks/useAppFonts";
import { todayKey } from "../lib/dates";
import { useUserStore } from "../stores/useUserStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const hasHydrated = useUserStore((s) => s.hasHydrated);

  // Onboarded if the explicit flag is set OR any sign of earlier app
  // use exists. The defensive fallbacks cover edge cases where the
  // `hasOnboarded` write didn't fully flush to AsyncStorage before the
  // app was killed.
  const isOnboarded = useUserStore(
    (s) =>
      s.hasOnboarded ||
      s.name.length > 0 ||
      s.goals.length > 0 ||
      s.points > 0 ||
      s.bomenGeplant > 0,
  );

  useEffect(() => {
    if (fontsLoaded && hasHydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, hasHydrated]);

  // Day rollover: once hydrated, see if we crossed midnight and reset
  // today's done flags + streak math.
  useEffect(() => {
    if (hasHydrated) {
      useUserStore.getState().rolloverIfNewDay(todayKey());
    }
  }, [hasHydrated]);

  // Pick the initial route AFTER hydration finishes. Memoised on the
  // first hydrated render so we don't yank users between routes when
  // their onboarded-status changes mid-session.
  const initialRoute = useMemo<"(tabs)" | "onboarding" | null>(() => {
    if (!hasHydrated) return null;
    return isOnboarded ? "(tabs)" : "onboarding";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  if (!fontsLoaded || !hasHydrated || initialRoute === null) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="focus" />
        <Stack.Screen name="dagboek" />
        <Stack.Screen name="meditation" options={{ presentation: "modal" }} />
        <Stack.Screen name="breathing" options={{ presentation: "modal" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
