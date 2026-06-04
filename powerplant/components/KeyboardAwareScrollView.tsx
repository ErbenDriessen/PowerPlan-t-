// powerplant/components/KeyboardAwareScrollView.tsx
//
// Eén bron van waarheid voor scrollbare schermen met invoervelden: schuift
// de inhoud soepel boven het toetsenbord zodat je altijd ziet wat je typt.
// Gebruik dit i.p.v. een kale ScrollView op schermen met een TextInput.
//
// De ruimte voor het toetsenbord wordt via reanimated geanimeerd (zie
// useKeyboardPadding), dus het schuift vloeiend i.p.v. er hard in te
// springen — en het werkt met Android edge-to-edge.
import { ComponentProps } from "react";
import { ScrollView } from "react-native";
import Animated from "react-native-reanimated";
import { useKeyboardPadding } from "../lib/useKeyboardPadding";

type Props = ComponentProps<typeof ScrollView>;

export function KeyboardAwareScrollView(props: Props) {
  const keyboardPad = useKeyboardPadding();
  return (
    <Animated.View style={[{ flex: 1 }, keyboardPad]}>
      <ScrollView keyboardShouldPersistTaps="handled" {...props} />
    </Animated.View>
  );
}
