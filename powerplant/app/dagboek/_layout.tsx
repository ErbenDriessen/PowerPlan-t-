import { Stack } from "expo-router";

export default function DagboekLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="writer" options={{ presentation: "modal" }} />
    </Stack>
  );
}
