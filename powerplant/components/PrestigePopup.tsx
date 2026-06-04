// powerplant/components/PrestigePopup.tsx
//
// Globale prestige-popup. Hangt in de root-layout en verschijnt OVER elk
// scherm zodra een boom volgroeid is (pendingPrestige). De gebruiker viert
// het en kiest daarna zelf de volgende boomsoort.
//
// Belangrijk: tijdens focus, meditatie en ademhaling verschijnt de popup
// NIET (afleidend) — hij wacht tot de gebruiker die schermen verlaat, want
// pendingPrestige blijft staan tot er gekozen is.
import { usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { getMatureTreeSprite } from "../lib/plantSprites";
import { SPECIES } from "../lib/species";
import { useUserStore } from "../stores/useUserStore";
import { PlantSprite } from "./PlantSprite";

// Schermen waar de popup moet wachten (sessies waarop je niet gestoord
// wilt worden).
const SUPPRESS_PREFIXES = ["/focus", "/meditation", "/breathing"];

export function PrestigePopup() {
  const pendingPrestige = useUserStore((s) => s.pendingPrestige);
  const currentSpecies = useUserStore((s) => s.currentSpecies);
  const completePrestige = useUserStore((s) => s.completePrestige);
  const pathname = usePathname();

  const suppressed = SUPPRESS_PREFIXES.some((p) => pathname.startsWith(p));
  const visible = pendingPrestige && !suppressed;

  const [phase, setPhase] = useState<"celebrate" | "picker">("celebrate");
  const [selected, setSelected] = useState<number | null>(null);

  // Reset naar de vier-fase elke keer dat de popup opengaat.
  useEffect(() => {
    if (visible) {
      setPhase("celebrate");
      setSelected(null);
    }
  }, [visible]);

  // Zachte pulserende glow achter de boom.
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.12, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  // Eenmalige pop bij openen.
  const pop = useSharedValue(0.85);
  useEffect(() => {
    if (visible) {
      pop.value = 0.85;
      pop.value = withTiming(1, { duration: 340, easing: Easing.out(Easing.back(1.4)) });
    }
  }, [visible]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const matured = getMatureTreeSprite(currentSpecies);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View
        className="flex-1 items-center justify-center px-7"
        style={{ backgroundColor: "rgba(8,20,14,0.92)" }}
      >
        <Animated.View style={popStyle} className="items-center w-full">
          {phase === "celebrate" ? (
            <View className="items-center">
              <View className="items-center justify-center mb-2" style={{ height: 170 }}>
                <Animated.View
                  style={[
                    glowStyle,
                    {
                      position: "absolute",
                      width: 220,
                      height: 220,
                      borderRadius: 110,
                      backgroundColor: "rgba(155,206,92,0.16)",
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    glowStyle,
                    {
                      position: "absolute",
                      width: 130,
                      height: 130,
                      borderRadius: 65,
                      backgroundColor: "rgba(155,206,92,0.18)",
                    },
                  ]}
                />
                <PlantSprite rect={matured} height={150} />
              </View>
              <Text className="text-white text-2xl font-extrabold text-center">
                Je boom is volgroeid! 🌳
              </Text>
              <Text className="text-white/70 text-sm text-center mt-2 leading-snug max-w-[280px]">
                Mooi werk. Hij verhuist nu naar jouw bos — een blijvend bewijs van je groei.
              </Text>
              <Pressable
                onPress={() => setPhase("picker")}
                className="mt-7 bg-primary border border-primary-soft rounded-2xl px-10 py-3.5 active:opacity-80"
              >
                <Text className="text-white font-extrabold text-base">Kies je volgende boom</Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center w-full">
              <Text className="text-white text-xl font-extrabold text-center">
                Wat wil je hierna laten groeien?
              </Text>
              <Text className="text-white/65 text-sm text-center mt-1 mb-6">
                Elke soort draagt ander fruit.
              </Text>

              <View className="flex-row gap-3 w-full">
                {SPECIES.map((sp) => {
                  const isSel = selected === sp.id;
                  return (
                    <Pressable
                      key={sp.id}
                      onPress={() => setSelected(sp.id)}
                      className={`flex-1 rounded-3xl px-2 pt-3 pb-3 items-center border-2 ${
                        isSel
                          ? "border-primary-soft bg-primary/15"
                          : "border-white/10 bg-white/[0.06]"
                      }`}
                    >
                      <View className="h-[78px] justify-end mb-2">
                        <PlantSprite rect={getMatureTreeSprite(sp.id)} height={74} />
                      </View>
                      <Text className="text-white font-extrabold text-xs text-center">
                        {sp.name}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-1">
                        <View
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: sp.color,
                          }}
                        />
                        <Text className="text-white/55 text-[10px] font-semibold">{sp.fruit}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                disabled={selected === null}
                onPress={() => selected !== null && completePrestige(selected)}
                className={`mt-7 w-full items-center rounded-2xl px-6 py-4 border ${
                  selected === null
                    ? "bg-white/5 border-white/10"
                    : "bg-primary border-primary-soft active:opacity-80"
                }`}
              >
                <Text
                  className={`font-extrabold text-base ${
                    selected === null ? "text-white/35" : "text-white"
                  }`}
                >
                  Plant dit zaadje
                </Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
