// powerplant/app/_layout.tsx
import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAppFonts } from "../hooks/useAppFonts";
import { todayKey } from "../lib/dates";
import { useUserStore } from "../stores/useUserStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const hasHydrated = useUserStore((s) => s.hasHydrated);

  useEffect(() => {
    if (fontsLoaded && hasHydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, hasHydrated]);

  // Day rollover: as soon as the user store has hydrated, check whether
  // we're looking at a new local date and reset today's done flags if so.
  useEffect(() => {
    if (hasHydrated) {
      useUserStore.getState().rolloverIfNewDay(todayKey());
    }
  }, [hasHydrated]);

  if (!fontsLoaded || !hasHydrated) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="focus" />
      <Stack.Screen name="dagboek" />
      <Stack.Screen name="meditation" options={{ presentation: "modal" }} />
      <Stack.Screen name="breathing" options={{ presentation: "modal" }} />
    </Stack>
  );
}
