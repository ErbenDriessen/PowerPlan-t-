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
  withTiming,
} from "react-native-reanimated";
import { getMatureTreeSprite } from "../lib/plantSprites";
import { SPECIES } from "../lib/species";
import { useUserStore } from "../stores/useUserStore";
import { CelebrationFX } from "./CelebrationFX";
import { PlantSprite } from "./PlantSprite";

// Schermen waar de popup moet wachten (sessies waarop je niet gestoord
// wilt worden).
const SUPPRESS_PREFIXES = ["/focus", "/meditation", "/breathing"];

const speciesById = (id: number) => SPECIES.find((s) => s.id === id) ?? SPECIES[0];

export function PrestigePopup() {
  const pendingPrestige = useUserStore((s) => s.pendingPrestige);
  const currentSpecies = useUserStore((s) => s.currentSpecies);
  const completePrestige = useUserStore((s) => s.completePrestige);
  const pathname = usePathname();

  const suppressed = SUPPRESS_PREFIXES.some((p) => pathname.startsWith(p));
  const visible = pendingPrestige && !suppressed;

  const [phase, setPhase] = useState<"celebrate" | "picker">("celebrate");
  const [selected, setSelected] = useState<number | null>(null);
  // Loopt op bij elke opening — herstart de confetti.
  const [openCount, setOpenCount] = useState(0);

  // Reset naar de vier-fase elke keer dat de popup opengaat.
  useEffect(() => {
    if (visible) {
      setPhase("celebrate");
      setSelected(null);
      setOpenCount((n) => n + 1);
    }
  }, [visible]);

  // Eenmalige pop bij openen van de kaart.
  const pop = useSharedValue(0.9);
  useEffect(() => {
    if (visible) {
      pop.value = 0.9;
      pop.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.back(1.5)) });
    }
  }, [visible]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const grown = speciesById(currentSpecies);
  const matured = getMatureTreeSprite(currentSpecies);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(9,20,15,0.74)" }}
      >
        <Animated.View
          style={[popStyle, { overflow: "hidden" }]}
          className="w-full max-w-[360px] rounded-[30px] border border-white/10 px-6 pt-7 pb-6 items-center"
        >
          {/* kaart-achtergrond */}
          <View
            className="absolute inset-0 rounded-[30px]"
            style={{ backgroundColor: "#15281E" }}
          />

          {/* feest-flair (glow + stralen + confetti) — alleen in de viering */}
          {phase === "celebrate" && <CelebrationFX trigger={openCount} accent={grown.color} />}

          {phase === "celebrate" ? (
            <>
              <Text className="text-primary-soft text-xs font-extrabold tracking-[2px] uppercase mb-1">
                Volgroeid
              </Text>

              {/* podium met boom (glow zit in de FX erachter) */}
              <View className="items-center justify-center my-3" style={{ height: 168 }}>
                <PlantSprite rect={matured} height={150} />
              </View>

              <Text className="text-white text-2xl font-extrabold text-center">
                Je {grown.name.toLowerCase()} is klaar! 🌳
              </Text>
              <Text className="text-white/65 text-sm text-center mt-2 leading-snug max-w-[270px]">
                Mooi werk — hij verhuist nu naar jouw bos als blijvend bewijs van je groei.
              </Text>

              <Pressable
                onPress={() => setPhase("picker")}
                className="mt-6 w-full items-center bg-primary rounded-2xl py-4 active:opacity-80"
              >
                <Text className="text-white font-extrabold text-base">Kies je volgende boom</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-white text-xl font-extrabold text-center">
                Wat plant je hierna?
              </Text>
              <Text className="text-white/60 text-sm text-center mt-1 mb-5">
                Elke soort draagt ander fruit.
              </Text>

              <View className="flex-row w-full" style={{ gap: 10 }}>
                {SPECIES.map((sp) => {
                  const isSel = selected === sp.id;
                  return (
                    <Pressable
                      key={sp.id}
                      onPress={() => setSelected(sp.id)}
                      className="flex-1 rounded-3xl pt-3 pb-3 px-1 items-center border-2"
                      style={{
                        borderColor: isSel ? sp.color : "rgba(255,255,255,0.08)",
                        backgroundColor: isSel ? `${sp.color}1F` : "rgba(255,255,255,0.04)",
                      }}
                    >
                      <View className="h-[76px] justify-end mb-2">
                        <PlantSprite rect={getMatureTreeSprite(sp.id)} height={72} />
                      </View>
                      <Text className="text-white font-extrabold text-xs text-center">
                        {sp.name.replace("boom", "")}
                      </Text>
                      <View
                        className="flex-row items-center mt-1.5 rounded-full px-2 py-0.5"
                        style={{ backgroundColor: `${sp.color}26` }}
                      >
                        <View
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: sp.color,
                            marginRight: 4,
                          }}
                        />
                        <Text className="text-white/75 text-[10px] font-bold">
                          {sp.fruit.replace(" fruit", "")}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                disabled={selected === null}
                onPress={() => selected !== null && completePrestige(selected)}
                className="mt-6 w-full items-center rounded-2xl py-4"
                style={{
                  backgroundColor:
                    selected === null ? "rgba(255,255,255,0.06)" : speciesById(selected).color,
                }}
              >
                <Text
                  className={`font-extrabold text-base ${
                    selected === null ? "text-white/35" : "text-white"
                  }`}
                >
                  {selected === null
                    ? "Kies een boom"
                    : `Plant je ${speciesById(selected).name.toLowerCase()}`}
                </Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
