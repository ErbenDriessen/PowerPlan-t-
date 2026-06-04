// powerplant/app/dagboek/writer.tsx
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "../../components/KeyboardAwareScrollView";
import { LinearGradient } from "expo-linear-gradient";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { MoodPicker } from "../../components/MoodPicker";
import { SoftButton } from "../../components/buttons";
import { formatDateNL } from "../../lib/dates";
import { useJournalStore, Mood } from "../../stores/useJournalStore";

const PROMPTS = [
  "Iets kleins wat ik vandaag fijn vond was…",
  "Waar ik mee zat vandaag is…",
  "Morgen wil ik rustig…",
];

export default function Writer() {
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = typeof params.id === "string" ? params.id : null;

  const existing = useJournalStore((s) =>
    editingId ? s.entries.find((e) => e.id === editingId) ?? null : null,
  );
  const addEntry = useJournalStore((s) => s.addEntry);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  // Capture today's label once on mount so editing an old entry doesn't
  // suddenly mutate its date if the user changes nothing else.
  const todayLabel = useMemo(() => formatDateNL(new Date()), []);

  const [mood, setMood] = useState<Mood | null>(existing?.mood ?? null);
  const [text, setText] = useState(existing?.text ?? "");

  const isEdit = editingId !== null;
  const headerTitle = isEdit ? "Entry bewerken" : "Nieuwe entry";
  const dateForEntry = existing?.date ?? todayLabel;

  const save = () => {
    if (!mood) return;
    if (isEdit && editingId) {
      updateEntry(editingId, { mood, text });
    } else {
      addEntry({ date: todayLabel, mood, text });
    }
    router.back();
  };

  const confirmDelete = () => {
    if (!editingId) return;
    Alert.alert(
      "Entry verwijderen?",
      "Deze entry wordt permanent gewist.",
      [
        { text: "Annuleer", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: () => {
            deleteEntry(editingId);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#2D4356", "#122538"] as [string, string]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()}>
          <Text className="text-white/70 font-bold text-sm">Annuleer</Text>
        </Pressable>
        <Text className="text-white text-base font-semibold">{headerTitle}</Text>
        <Pressable onPress={save} disabled={!mood}>
          <Text className={`font-bold text-sm ${mood ? "text-primary-soft" : "text-white/30"}`}>
            Bewaren
          </Text>
        </Pressable>
      </View>

      <KeyboardAwareScrollView contentContainerClassName="px-6 pb-12">
        <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-3">
          {dateForEntry}
        </Text>

        <Text className="text-white text-sm font-bold mb-3">Hoe voel je je?</Text>
        <MoodPicker value={mood} onChange={setMood} />

        <Text className="text-white text-sm font-bold mt-6 mb-2">
          Een paar woorden over vandaag
        </Text>
        <TextInput
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Vandaag was…"
          placeholderTextColor="rgba(255,255,255,0.35)"
          className="bg-white/[0.07] border border-white/10 rounded-3xl p-4 text-white text-base"
          style={{ minHeight: 180, textAlignVertical: "top" }}
        />

        <Text className="text-white/45 text-xs font-bold uppercase tracking-widest mt-5 mb-2">
          Geen idee? Probeer…
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <SoftButton
              key={p}
              label={p.length > 24 ? p.slice(0, 22) + "…" : p}
              onPress={() => setText((t) => (t ? t + "\n" + p : p))}
            />
          ))}
        </View>

        {isEdit && (
          <View className="mt-8 items-center">
            <Pressable onPress={confirmDelete} hitSlop={8}>
              <Text className="text-white/55 text-sm font-bold underline">
                Deze entry verwijderen
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}
