// powerplant/components/FakeStatusBar.tsx
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Spacer onder de échte statusbalk. Omdat de app edge-to-edge tekent (achter
// de klok/notch/camera), nemen we de werkelijke safe-area-hoogte van het
// toestel + een beetje lucht, zodat headers en terug-knoppen niet tegen de
// statusbalk plakken.
export function FakeStatusBar() {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.top + 8 }} />;
}
