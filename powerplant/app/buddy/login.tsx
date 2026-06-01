import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { PrimaryButton, GhostButton } from "../../components/buttons";
import { useBuddyStore } from "../../stores/useBuddyStore";
import * as buddyApi from "../../features/buddy/api/buddyApi";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setCurrentUser = useBuddyStore((s) => s.setCurrentUser);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Vul je e-mail en wachtwoord in");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await buddyApi.login(email.trim(), password);
      await buddyApi.saveToken(token);
      setCurrentUser(user);
      router.replace("/(tabs)/buddy");
    } catch (err: unknown) {
      Alert.alert("Inloggen mislukt", (err as Error).message ?? "Probeer opnieuw");
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
        <Text className="text-white text-2xl font-extrabold mb-1">Inloggen</Text>
        <Text className="text-white/55 text-sm mb-8">Toegang tot je buddy-koppeling</Text>

        <GlassCard className="p-5 mb-4">
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
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </GlassCard>

        <PrimaryButton
          label={loading ? "Inloggen..." : "Inloggen"}
          onPress={handleLogin}
        />
        <View className="mt-3">
          <GhostButton
            label="Nog geen account? Registreren"
            onPress={() => router.replace("/buddy/register")}
          />
        </View>
      </ScrollView>
    </View>
  );
}
