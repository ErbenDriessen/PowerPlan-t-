import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { Chip } from "../../components/Chip";
import { PrimaryButton, GhostButton } from "../../components/buttons";
import { useBuddyStore } from "../../stores/useBuddyStore";
import * as buddyApi from "../../features/buddy/api/buddyApi";

const GOAL_OPTIONS = [
  { title: "Meer bewegen", description: "Korte wandeling van 15 min" },
  { title: "Betere slaap", description: "Telefoon weg om 22:00" },
  { title: "Minder stress", description: "Ademhalingsoefening of korte pauze" },
  { title: "Schooldoelen", description: "Eén studeerblok of leesmoment" },
  { title: "Meer rust nemen", description: "5–10 min meditatie of stil zitten" },
  { title: "Beter focussen", description: "Eén focusblok zonder afleiding" },
];

export default function AccountScreen() {
  const { currentUser, setCurrentUser, logout } = useBuddyStore();

  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    buddyApi.getMyGoals()
      .then(setSelectedGoals)
      .catch(() => {});
  }, []);

  function toggleSelected(title: string) {
    setSelectedGoals((prev) =>
      prev.includes(title) ? prev.filter((g) => g !== title) : [...prev, title]
    );
  }

  async function handleSave() {
    if (!username.trim()) return;
    setSaving(true);
    try {
      const data: { username?: string; password?: string; currentPassword?: string } = {};
      if (username.trim() !== currentUser?.username) data.username = username.trim();
      if (newPassword) {
        data.password = newPassword;
        data.currentPassword = currentPassword;
      }
      if (Object.keys(data).length > 0) {
        const updated = await buddyApi.updateMe(data);
        setCurrentUser({ ...currentUser!, ...updated });
      }
      await buddyApi.syncGoals(selectedGoals);
      Alert.alert("Opgeslagen");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      Alert.alert("Opslaan mislukt", (err as Error).message ?? "Probeer opnieuw");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/(tabs)/buddy");
  }

  function handleDelete() {
    Alert.alert(
      "Account verwijderen",
      "Je gegevens worden na 30 dagen permanent verwijderd. Je buddygesprekken blijven zichtbaar als 'Verwijderde gebruiker'. Doorgaan?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: async () => {
            try {
              await buddyApi.deleteMe();
              await logout();
              router.replace("/(tabs)/buddy");
            } catch (err: unknown) {
              Alert.alert("Mislukt", (err as Error).message ?? "Probeer opnieuw");
            }
          },
        },
      ]
    );
  }

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-5 pt-2 flex-row items-center gap-3 mb-2">
        <Pressable onPress={() => router.back()} className="pr-2 py-1">
          <Text className="text-white text-xl">‹</Text>
        </Pressable>
        <Text className="text-white text-xl font-extrabold">Mijn account</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-32"
        keyboardShouldPersistTaps="handled"
      >
        <GlassCard className="p-5 mb-4">
          <Text className="text-white/70 text-xs font-bold mb-1 uppercase tracking-widest">
            Gebruikersnaam
          </Text>
          <TextInput
            className="text-white text-base py-2 border-b border-white/20 mb-4"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text className="text-white/70 text-xs font-bold mb-1 uppercase tracking-widest">
            Huidig wachtwoord
          </Text>
          <TextInput
            className="text-white text-base py-2 border-b border-white/20 mb-4"
            placeholder="Alleen nodig bij wachtwoordwijziging"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <Text className="text-white/70 text-xs font-bold mb-1 uppercase tracking-widest">
            Nieuw wachtwoord
          </Text>
          <TextInput
            className="text-white text-base py-2 border-b border-white/20"
            placeholder="Laat leeg om niet te wijzigen"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </GlassCard>

        <GlassCard className="p-5 mb-5">
          <Text className="text-white/70 text-xs font-bold mb-1 uppercase tracking-widest">
            Mijn doelen
          </Text>
          <Text className="text-white/45 text-xs mb-3">
            Andere gebruikers vinden je op basis van deze doelen
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {GOAL_OPTIONS.map((g) => (
              <Chip
                key={g.title}
                label={g.title}
                selected={selectedGoals.includes(g.title)}
                onPress={() => toggleSelected(g.title)}
              />
            ))}
          </View>
        </GlassCard>

        <PrimaryButton label={saving ? "Opslaan..." : "Opslaan"} onPress={handleSave} />
        <View className="mt-3">
          <GhostButton label="Uitloggen" onPress={handleLogout} />
        </View>
        <Pressable onPress={handleDelete} className="mt-3 py-3 items-center">
          <Text className="text-red-400/70 text-sm">Account verwijderen</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
