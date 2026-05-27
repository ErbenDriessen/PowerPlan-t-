// powerplant/components/FakeStatusBar.tsx
import { View } from "react-native";

// Spacer below the real status bar. Used to be a faux 9:41 / signal-dots
// mock from the prototype; removed because the real device already paints
// its own status bar above the app.
export function FakeStatusBar() {
  return <View className="pt-3 pb-1" />;
}
