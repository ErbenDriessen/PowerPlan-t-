// powerplant/app/(tabs)/planning.tsx
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Mascot } from "../../components/Mascot";
import { PrimaryButton, SoftButton } from "../../components/buttons";
import {
  getPlannedDay,
  getSuggestion,
  PlanTone,
} from "../../lib/aiCalendar";
import { useUserStore } from "../../stores/useUserStore";

const TONE_BG: Record<PlanTone, string> = {
  primary: "bg-primary-soft/15 border border-primary-soft/25",
  bark: "bg-bark/20 border border-bark/25",
  warm: "bg-yellow/15 border border-yellow/25",
  neutral: "bg-white/[0.06] border border-white/10",
};

type GoalEdit =
  | { mode: "add"; title: string; description: string }
  | { mode: "edit"; id: string; title: string; description: string };

export default function Planning() {
  const goals = useUserStore((s) => s.goals);
  const addGoal = useUserStore((s) => s.addGoal);
  const updateGoal = useUserStore((s) => s.updateGoal);
  const removeGoal = useUserStore((s) => s.removeGoal);

  const [editing, setEditing] = useState<GoalEdit | null>(null);

  const timeline = getPlannedDay();
  const suggestion = getSuggestion();

  const openAdd = () => setEditing({ mode: "add", title: "", description: "" });
  const openEdit = (g: { id: string; title: string; description: string }) =>
    setEditing({ mode: "edit", id: g.id, title: g.title, description: g.description });
  const closeModal = () => setEditing(null);

  const submitGoal = () => {
    if (!editing) return;
    const title = editing.title.trim();
    if (!title) {
      closeModal();
      return;
    }
    if (editing.mode === "add") {
      addGoal({ title, description: editing.description });
    } else {
      updateGoal(editing.id, { title, description: editing.description });
    }
    closeModal();
  };

  const deleteCurrent = () => {
    if (editing?.mode !== "edit") return;
    removeGoal(editing.id);
    closeModal();
  };

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row justify-between items-center mb-2">
        <Text className="text-white text-2xl font-extrabold">Planning</Text>
        <Mascot size={36} />
      </View>

      <ScrollView contentContainerClassName="px-5 pt-2 pb-32">
        <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-2 px-1">
          Mijn doelen
        </Text>
        <GlassCard className="p-4 mb-5">
          {goals.length === 0 && (
            <Text className="text-white/55 text-sm py-2">
              Nog geen doelen. Voeg er hieronder een toe.
            </Text>
          )}
          {goals.map((g, i) => (
            <Pressable
              key={g.id}
              onPress={() => openEdit(g)}
              className={`flex-row items-center gap-3 py-2 ${
                i < goals.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <Text style={{ fontSize: 18 }}>🎯</Text>
              <View className="flex-1">
                <Text className="text-white text-sm font-semibold">{g.title}</Text>
                {g.description.length > 0 && (
                  <Text className="text-white/55 text-xs">{g.description}</Text>
                )}
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => removeGoal(g.id)}
                className="w-7 h-7 items-center justify-center rounded-full bg-white/[0.06]"
              >
                <Text className="text-white/55 text-base">×</Text>
              </Pressable>
            </Pressable>
          ))}
          <Pressable
            onPress={openAdd}
            className={`flex-row items-center gap-3 py-3 mt-1 ${
              goals.length > 0 ? "border-t border-white/10" : ""
            }`}
          >
            <View className="w-6 h-6 rounded-full bg-white/15 items-center justify-center">
              <Text className="text-white font-bold">+</Text>
            </View>
            <Text className="text-white/65 text-sm font-bold">Doel toevoegen</Text>
          </Pressable>
        </GlassCard>

        <View className="flex-row items-center gap-2 px-1 mb-2">
          <Text className="text-white/55 text-xs font-bold uppercase tracking-widest">
            Dagindeling
          </Text>
          <View className="bg-primary-soft/20 border border-primary-soft/30 px-1.5 py-0.5 rounded">
            <Text className="text-primary-soft text-[10px] font-bold">AI</Text>
          </View>
          <Text className="text-white/40 text-xs">— gemaakt voor jou</Text>
        </View>

        <GlassCard className="p-5 mb-5">
          {timeline.map((b) => (
            <View key={b.time} className="flex-row items-center gap-3 mb-4 last:mb-0">
              <Text className="w-10 text-white/55 text-xs font-bold tabular-nums">{b.time}</Text>
              <View className="w-3 h-3 rounded-full bg-primary-soft" />
              <View className={`flex-1 rounded-2xl px-3.5 py-2.5 flex-row items-center justify-between ${TONE_BG[b.tone]}`}>
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-white/10 items-center justify-center">
                    <Text>{b.emoji}</Text>
                  </View>
                  <View>
                    <Text className="text-white text-sm font-bold">{b.label}</Text>
                    <Text className="text-white/55 text-[11px]">{b.sub}</Text>
                  </View>
                </View>
                <Text className="text-white/30 text-lg">⋮⋮</Text>
              </View>
            </View>
          ))}
        </GlassCard>

        {suggestion ? (
          <GlassCard variant="warm" className="p-4 mb-5 flex-row items-start gap-3">
            <Text style={{ fontSize: 22 }}>💡</Text>
            <View className="flex-1">
              <Text className="text-white text-sm font-semibold mb-2">{suggestion.text}</Text>
              {(suggestion.primaryAction || suggestion.dismissAction) && (
                <View className="flex-row gap-2">
                  {suggestion.primaryAction && (
                    <View className="bg-yellow rounded-xl px-3 py-2">
                      <Text className="text-deep text-xs font-bold">
                        {suggestion.primaryAction.label}
                      </Text>
                    </View>
                  )}
                  {suggestion.dismissAction && (
                    <SoftButton label={suggestion.dismissAction.label} onPress={() => {}} />
                  )}
                </View>
              )}
            </View>
          </GlassCard>
        ) : (
          <GlassCard variant="warm" className="p-4 mb-5 flex-row items-start gap-3">
            <Text style={{ fontSize: 22 }}>🔧</Text>
            <View className="flex-1">
              <Text className="text-white text-sm font-semibold mb-1">
                Slimme planning-suggesties
              </Text>
              <Text className="text-white/65 text-xs leading-snug">
                Onderdeel van een andere epic (AI-kalender). Verschijnt hier zodra het werk
                van mijn teamgenoot klaar is.
              </Text>
            </View>
          </GlassCard>
        )}

        <Text className="text-center text-white/45 text-xs px-6">
          Je kunt alles aanpassen — niets is verplicht.
        </Text>
      </ScrollView>

      {/* Goal add/edit modal */}
      <Modal
        visible={editing !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center px-6 bg-black/60"
        >
          <View className="bg-night border border-white/15 rounded-3xl p-5">
            <Text className="text-white text-lg font-extrabold mb-1">
              {editing?.mode === "add" ? "Nieuw doel" : "Doel bewerken"}
            </Text>
            <Text className="text-white/55 text-xs mb-4">
              Geef je doel een korte titel en eventueel een beschrijving.
            </Text>
            <TextInput
              value={editing?.title ?? ""}
              onChangeText={(t) =>
                setEditing((prev) => (prev ? { ...prev, title: t } : prev))
              }
              placeholder="Titel — bv. Wandelen"
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoFocus
              returnKeyType="next"
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-white text-base mb-3"
            />
            <TextInput
              value={editing?.description ?? ""}
              onChangeText={(t) =>
                setEditing((prev) => (prev ? { ...prev, description: t } : prev))
              }
              placeholder="Beschrijving — bv. 15 min, buiten (optioneel)"
              placeholderTextColor="rgba(255,255,255,0.35)"
              returnKeyType="done"
              onSubmitEditing={submitGoal}
              multiline
              className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-white text-base mb-4"
              style={{ minHeight: 60, textAlignVertical: "top" }}
            />
            <View className="flex-row justify-between items-center">
              {editing?.mode === "edit" ? (
                <Pressable onPress={deleteCurrent} hitSlop={8}>
                  <Text className="text-white/55 text-sm font-bold">Verwijderen</Text>
                </Pressable>
              ) : (
                <View />
              )}
              <View className="flex-row gap-2">
                <SoftButton label="Annuleer" onPress={closeModal} />
                <PrimaryButton
                  label="Bewaren"
                  onPress={submitGoal}
                  className="!py-2 !px-4"
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
