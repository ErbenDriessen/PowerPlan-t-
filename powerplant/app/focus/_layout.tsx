import { Stack } from "expo-router";

export default function FocusLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup" />
      <Stack.Screen name="running" options={{ presentation: "fullScreenModal", gestureEnabled: false }} />
    </Stack>
  );
}
