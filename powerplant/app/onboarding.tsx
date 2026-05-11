// powerplant/app/onboarding.tsx
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Chip } from "../components/Chip";
import { DuskBackground } from "../components/DuskBackground";
import { FakeStatusBar } from "../components/FakeStatusBar";
import { Mascot } from "../components/Mascot";
import { PrimaryButton } from "../components/buttons";
import { GlassCard } from "../components/GlassCard";
import { useUserStore } from "../stores/useUserStore";

const GOAL_OPTIONS = [
  "Meer bewegen",
  "Betere slaap",
  "Minder stress",
  "Schooldoelen",
  "Meer rust nemen",
  "Beter focussen",
];

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const name = useUserStore((s) => s.name);
  const goals = useUserStore((s) => s.goals);
  const bedH = useUserStore((s) => s.bedH);
  const bedM = useUserStore((s) => s.bedM);
  const setName = useUserStore((s) => s.setName);
  const toggleGoal = useUserStore((s) => s.toggleGoal);
  const bumpHour = useUserStore((s) => s.bumpHour);
  const bumpMin = useUserStore((s) => s.bumpMin);
  const finish = useUserStore((s) => s.finishOnboarding);

  const done = () => {
    finish();
    router.replace("/(tabs)/home");
  };

  return (
    <View className="flex-1">
      <DuskBackground variant="warm" />
      <FakeStatusBar />

      {/* Progress dots */}
      <View className="px-6 pt-2 flex-row items-center justify-between">
        <View className="flex-row gap-1.5">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className={`h-1.5 w-8 rounded-full ${
                i <= step ? "bg-primary-soft" : "bg-white/15"
              }`}
            />
          ))}
        </View>
        {step < 3 && (
          <Pressable onPress={done}>
            <Text className="text-white/55 text-sm font-bold">Overslaan</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 flex-1 justify-between">
        {step === 1 && (
          <View className="items-center justify-center flex-1">
            <Mascot size={140} breathing="slow" />
            <Text className="text-white text-3xl font-extrabold mt-6 text-center">
              Hoi! Ik ben Sprout 🌱
            </Text>
            <Text className="text-white/70 text-lg mt-2 mb-6">Hoe heet jij?</Text>
            <TextInput
              defaultValue={name}
              onChangeText={setName}
              placeholder="Jouw naam"
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoCapitalize="words"
              className="w-full bg-white/10 border-2 border-white/15 rounded-2xl px-5 py-4 text-lg text-white font-bold text-center"
            />
          </View>
        )}

        {step === 2 && (
          <View className="flex-1">
            <Mascot size={64} breathing="off" />
            <Text className="text-white text-2xl font-extrabold mt-4">
              Waar wil jij aan werken?
            </Text>
            <Text className="text-white/65 mt-1 mb-6">
              Kies wat bij je past. Je kunt het later aanpassen.
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {GOAL_OPTIONS.map((g) => (
                <Chip
                  key={g}
                  label={g}
                  selected={goals.includes(g)}
                  onPress={() => toggleGoal(g)}
                />
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="flex-1">
            <Mascot size={64} breathing="off" />
            <Text className="text-white text-2xl font-extrabold mt-4">
              Hoe laat wil je meestal naar bed?
            </Text>
            <Text className="text-white/65 mt-1 mb-6">
              We gebruiken dit alleen om je rustig richting bedtijd te begeleiden.
            </Text>
            <GlassCard className="p-6 flex-row items-center justify-center gap-3">
              <View className="items-center">
                <Pressable onPress={() => bumpHour(1)}>
                  <Text className="text-white/50 text-xl">▴</Text>
                </Pressable>
                <Text className="text-white text-5xl font-extrabold tabular-nums">
                  {String(bedH).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => bumpHour(-1)}>
                  <Text className="text-white/50 text-xl">▾</Text>
                </Pressable>
              </View>
              <Text className="text-white text-5xl font-extrabold -mt-2">:</Text>
              <View className="items-center">
                <Pressable onPress={() => bumpMin(15)}>
                  <Text className="text-white/50 text-xl">▴</Text>
                </Pressable>
                <Text className="text-white text-5xl font-extrabold tabular-nums">
                  {String(bedM).padStart(2, "0")}
                </Text>
                <Pressable onPress={() => bumpMin(-15)}>
                  <Text className="text-white/50 text-xl">▾</Text>
                </Pressable>
              </View>
            </GlassCard>
            <Text className="text-white/55 text-center mt-3">🌙 Bedtijd</Text>
          </View>
        )}

        <View className="mt-6">
          <PrimaryButton
            label={step < 3 ? "Verder" : "Klaar"}
            onPress={() => (step < 3 ? setStep(((step + 1) as 1 | 2 | 3)) : done())}
          />
        </View>
      </ScrollView>
    </View>
  );
}
