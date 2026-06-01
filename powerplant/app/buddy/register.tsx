import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { PrimaryButton, GhostButton } from "../../components/buttons";
import { useBuddyStore } from "../../stores/useBuddyStore";
import * as buddyApi from "../../features/buddy/api/buddyApi";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setCurrentUser = useBuddyStore((s) => s.setCurrentUser);

  async function handleRegister() {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Vul alle velden in");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await buddyApi.register(username.trim(), email.trim(), password);
      await buddyApi.saveToken(token);
      setCurrentUser(user);
      router.replace("/(tabs)/buddy");
    } catch (err: unknown) {
      Alert.alert("Registreren mislukt", (err as Error).message ?? "Probeer opnieuw");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />
      <ScrollView
        contentContainerClassName="px-5 pt-10 pb-32"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-white text-2xl font-extrabold mb-1">Account aanmaken</Text>
        <Text className="text-white/55 text-sm mb-8">Kies een naam die je buddy ziet</Text>

        <GlassCard className="p-5 mb-4">
          <Text className="text-white/70 text-xs font-bold mb-1 uppercase tracking-widest">
            Gebruikersnaam
          </Text>
          <TextInput
            className="text-white text-base py-2 border-b border-white/20 mb-4"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text className="text-white/70 text-xs font-bold mb-1 uppercase tracking-widest">
            E-mail
          </Text>
          <TextInput
            className="text-white text-base py-2 border-b border-white/20 mb-4"
            placeholder="jouw@email.nl"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text className="text-white/70 text-xs font-bold mb-1 uppercase tracking-widest">
            Wachtwoord
          </Text>
          <TextInput
            className="text-white text-base py-2 border-b border-white/20"
            placeholder="Minimaal 8 tekens, 1 letter + 1 cijfer"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </GlassCard>

        <PrimaryButton
          label={loading ? "Aanmaken..." : "Account aanmaken"}
          onPress={handleRegister}
        />
        <View className="mt-3">
          <GhostButton
            label="Al een account? Inloggen"
            onPress={() => router.replace("/buddy/login")}
          />
        </View>
      </ScrollView>
    </View>
  );
}
