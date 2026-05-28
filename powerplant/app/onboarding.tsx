// powerplant/app/onboarding.tsx
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Chip } from "../components/Chip";
import { DuskBackground } from "../components/DuskBackground";
import { FakeStatusBar } from "../components/FakeStatusBar";
import { Mascot } from "../components/Mascot";
import { PrimaryButton } from "../components/buttons";
import { GlassCard } from "../components/GlassCard";
import { useUserStore } from "../stores/useUserStore";

// Each chip turns into an actual goal when picked. The description is a
// suggested daily action so the goal feels concrete from the first day;
// the user can edit or replace it later from the Planning screen.
const GOAL_OPTIONS: { title: string; description: string }[] = [
  { title: "Meer bewegen", description: "Korte wandeling van 15 min" },
  { title: "Betere slaap", description: "Telefoon weg om 22:00" },
  { title: "Minder stress", description: "Ademhalingsoefening of korte pauze" },
  { title: "Schooldoelen", description: "Eén studeerblok of leesmoment" },
  { title: "Meer rust nemen", description: "5–10 min meditatie of stil zitten" },
  { title: "Beter focussen", description: "Eén focusblok zonder afleiding" },
];

function TimeColumn({
  value,
  onUp,
  onDown,
  accessibilityLabel,
}: {
  value: number;
  onUp: () => void;
  onDown: () => void;
  accessibilityLabel: string;
}) {
  return (
    <View className="items-center" style={{ gap: 8 }}>
      <Pressable
        onPress={onUp}
        hitSlop={16}
        accessibilityLabel={`${accessibilityLabel} omhoog`}
        className="w-16 h-12 items-center justify-center bg-white/[0.08] border border-white/15 rounded-2xl active:opacity-60"
      >
        <Text className="text-white text-lg font-bold">▴</Text>
      </Pressable>
      <Text className="text-white text-5xl font-extrabold tabular-nums">
        {String(value).padStart(2, "0")}
      </Text>
      <Pressable
        onPress={onDown}
        hitSlop={16}
        accessibilityLabel={`${accessibilityLabel} omlaag`}
        className="w-16 h-12 items-center justify-center bg-white/[0.08] border border-white/15 rounded-2xl active:opacity-60"
      >
        <Text className="text-white text-lg font-bold">▾</Text>
      </Pressable>
    </View>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const name = useUserStore((s) => s.name);
  const goals = useUserStore((s) => s.goals);
  const bedH = useUserStore((s) => s.bedH);
  const bedM = useUserStore((s) => s.bedM);
  const points = useUserStore((s) => s.points);
  const bomenGeplant = useUserStore((s) => s.bomenGeplant);
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  const setName = useUserStore((s) => s.setName);
  const toggleGoal = useUserStore((s) => s.toggleGoal);
  const bumpHour = useUserStore((s) => s.bumpHour);
  const bumpMin = useUserStore((s) => s.bumpMin);
  const finish = useUserStore((s) => s.finishOnboarding);

  // Last-resort safety net: if this screen mounts while the user is
  // already onboarded (deep link, route restoration, persist race…), get
  // out immediately. Snapshot the value at mount-time only — otherwise
  // typing a name or toggling a goal during onboarding would flip the
  // flag mid-session and kick the new user back to home.
  const initiallyOnboardedRef = useRef(
    hasOnboarded ||
      name.length > 0 ||
      goals.length > 0 ||
      points > 0 ||
      bomenGeplant > 0,
  );
  useEffect(() => {
    if (initiallyOnboardedRef.current) router.replace("/(tabs)/home");
  }, []);

  const done = () => {
    finish();
    router.replace("/(tabs)/home");
  };

  return (
    <View className="flex-1">
      <DuskBackground variant="warm" />
      <FakeStatusBar />

      {/* Progress dots with back / skip */}
      <View className="px-6 pt-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {step > 1 ? (
            <Pressable
              onPress={() => setStep(((step - 1) as 1 | 2 | 3))}
              hitSlop={8}
              accessibilityLabel="Vorige stap"
            >
              <Text className="text-white/55 text-lg font-bold">←</Text>
            </Pressable>
          ) : (
            <View style={{ width: 14 }} />
          )}
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
              Kies wat bij je past. Elke keuze wordt een doel met een kleine suggestie —
              je kunt alles later aanpassen.
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {GOAL_OPTIONS.map((g) => (
                <Chip
                  key={g.title}
                  label={g.title}
                  selected={goals.some((x) => x.title === g.title)}
                  onPress={() => toggleGoal(g.title, g.description)}
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
            <GlassCard className="p-6 flex-row items-center justify-center gap-4">
              <TimeColumn
                value={bedH}
                onUp={() => bumpHour(1)}
                onDown={() => bumpHour(-1)}
                accessibilityLabel="Uur"
              />
              <Text className="text-white text-5xl font-extrabold">:</Text>
              <TimeColumn
                value={bedM}
                onUp={() => bumpMin(15)}
                onDown={() => bumpMin(-15)}
                accessibilityLabel="Minuut"
              />
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
