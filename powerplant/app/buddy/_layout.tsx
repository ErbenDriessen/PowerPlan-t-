import { Stack } from "expo-router";

export default function BuddyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="account" />
    </Stack>
  );
}
