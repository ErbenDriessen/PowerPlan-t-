// powerplant/app/_layout.tsx
import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAppFonts } from "../hooks/useAppFonts";
import { useUserStore } from "../stores/useUserStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const hasHydrated = useUserStore((s) => s.hasHydrated);

  useEffect(() => {
    if (fontsLoaded && hasHydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, hasHydrated]);

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
