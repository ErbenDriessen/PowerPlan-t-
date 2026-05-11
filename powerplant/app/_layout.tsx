// powerplant/app/_layout.tsx
import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAppFonts } from "../hooks/useAppFonts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useAppFonts();

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
