import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { DuskBackground } from "../../components/DuskBackground";
import { FakeStatusBar } from "../../components/FakeStatusBar";
import { GlassCard } from "../../components/GlassCard";
import { PrimaryButton } from "../../components/buttons";
import { useBuddyStore } from "../../stores/useBuddyStore";
import { useUserStore } from "../../stores/useUserStore";
import * as buddyApi from "../../features/buddy/api/buddyApi";
import type { Buddy } from "../../features/buddy/types";

export default function BuddyTab() {
  const { currentUser, isLoggedIn, setCurrentUser } = useBuddyStore();
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [matches, setMatches] = useState<{ id: string; username: string; goals: string[] }[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const goals = useUserStore((s) => s.goals);

  useEffect(() => {
    if (!isLoggedIn) {
      buddyApi
        .getMe()
        .then((user) => setCurrentUser(user))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadAll();
  }, [isLoggedIn]);

  async function loadAll() {
    setMatchLoading(true);
    try {
      const myGoals = goals.map((g) => g.title);
      const [fetchedBuddies, fetchedMatches] = await Promise.all([
        buddyApi.getBuddies(),
        buddyApi.findMatchingUsers(myGoals),
      ]);
      setBuddies(fetchedBuddies);
      const existingIds = new Set(fetchedBuddies.map((b) => b.other.id));
      setMatches(fetchedMatches.filter((u) => !existingIds.has(u.id)));
    } catch { /* offline */ }
    finally { setMatchLoading(false); }
  }

  async function handleAdd(receiverId: string) {
    try {
      await buddyApi.sendBuddyRequest(receiverId);
      setMatches((prev) => prev.filter((u) => u.id !== receiverId));
      await loadAll();
    } catch (err: unknown) {
      alert((err as Error).message ?? "Verzoek mislukt");
    }
  }

  async function handleAccept(buddyId: number) {
    await buddyApi.updateBuddyStatus(buddyId, "accepted");
    await loadAll();
  }

  if (!isLoggedIn) {
    return (
      <View className="flex-1">
        <DuskBackground />
        <FakeStatusBar />
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontSize: 48 }} className="mb-4">🤝</Text>
          <Text className="text-white text-xl font-extrabold text-center mb-2">
            Buddy-systeem
          </Text>
          <Text className="text-white/55 text-sm text-center mb-8">
            Log in om contact te houden met een buddy
          </Text>
          <PrimaryButton label="Inloggen" onPress={() => router.push("/buddy/login")} />
          <Pressable
            onPress={() => router.push("/buddy/register")}
            className="mt-4 py-3 w-full items-center"
          >
            <Text className="text-white/55 text-sm">Nog geen account? Registreren</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const pending = buddies.filter((b) => b.status === "pending" && !b.isRequester);
  const sent = buddies.filter((b) => b.status === "pending" && b.isRequester);
  const accepted = buddies.filter((b) => b.status === "accepted");

  return (
    <View className="flex-1">
      <DuskBackground />
      <FakeStatusBar />

      <View className="px-6 pt-2 flex-row justify-between items-center mb-2">
        <Text className="text-white text-2xl font-extrabold">Buddy</Text>
        <Pressable
          onPress={() => router.push("/buddy/account")}
          className="bg-white/10 rounded-full px-3 py-1"
        >
          <Text className="text-white text-xs font-bold">
            {currentUser?.username ?? "Ik"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerClassName="px-5 pb-32"
        data={accepted}
        keyExtractor={(b) => String(b.id)}
        ListHeaderComponent={
          <View>
            {/* Mensen met dezelfde doelen */}
            <GlassCard className="p-4 mb-4">
              <Text className="text-white/70 text-xs font-bold mb-3 uppercase tracking-widest">
                Mensen met dezelfde doelen
              </Text>
              {matchLoading ? (
                <Text className="text-white/45 text-sm">Zoeken...</Text>
              ) : goals.length === 0 ? (
                <Text className="text-white/45 text-sm">
                  Voeg doelen toe via Planning om buddies te vinden
                </Text>
              ) : matches.length === 0 ? (
                <Text className="text-white/45 text-sm">
                  Nog niemand met dezelfde doelen gevonden 🌱
                </Text>
              ) : (
                matches.map((u) => (
                  <Pressable
                    key={u.id}
                    onPress={() => handleAdd(u.id)}
                    className="flex-row justify-between items-center py-3 border-t border-white/10"
                  >
                    <View>
                      <Text className="text-white font-semibold">{u.username}</Text>
                      <Text className="text-white/45 text-xs mt-0.5">
                        {u.goals
                          .filter((g) => goals.some((myG) => myG.title === g))
                          .join(" · ")}
                      </Text>
                    </View>
                    <Text className="text-green-400 text-xs font-bold">+ Toevoegen</Text>
                  </Pressable>
                ))
              )}
            </GlassCard>

            {/* Inkomende verzoeken */}
            {pending.length > 0 && (
              <View className="mb-4">
                <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-2 px-1">
                  Verzoeken
                </Text>
                {pending.map((b) => (
                  <GlassCard
                    key={b.id}
                    className="p-4 mb-2 flex-row justify-between items-center"
                  >
                    <Text className="text-white font-semibold">{b.other.username}</Text>
                    <Pressable
                      onPress={() => handleAccept(b.id)}
                      className="bg-primary rounded-2xl px-4 py-1.5"
                    >
                      <Text className="text-white text-xs font-bold">Accepteren</Text>
                    </Pressable>
                  </GlassCard>
                ))}
              </View>
            )}

            {/* Verstuurd, wacht op acceptatie */}
            {sent.length > 0 && (
              <View className="mb-4">
                <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-2 px-1">
                  Verstuurd
                </Text>
                {sent.map((b) => (
                  <GlassCard key={b.id} className="p-4 mb-2">
                    <Text className="text-white font-semibold">{b.other.username}</Text>
                    <Text className="text-white/45 text-xs mt-1">In afwachting...</Text>
                  </GlassCard>
                ))}
              </View>
            )}

            {accepted.length > 0 && (
              <Text className="text-white/55 text-xs font-bold uppercase tracking-widest mb-2 px-1">
                Mijn buddy's
              </Text>
            )}
          </View>
        }
        renderItem={({ item: b }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/buddy/chat",
                params: { buddyId: b.id, username: b.other.username },
              } as never)
            }
          >
            <GlassCard className="p-4 mb-2 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-primary/30 items-center justify-center">
                <Text className="text-white font-extrabold text-base">
                  {b.other.username[0].toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">{b.other.username}</Text>
                <Text className="text-white/45 text-xs mt-0.5">Tik om te chatten</Text>
              </View>
              <Text className="text-white/40 text-lg">›</Text>
            </GlassCard>
          </Pressable>
        )}
        ListEmptyComponent={
          accepted.length === 0 && pending.length === 0 && sent.length === 0 ? (
            <GlassCard className="p-6 items-center">
              <Text style={{ fontSize: 32 }} className="mb-2">🌱</Text>
              <Text className="text-white/55 text-sm text-center">
                Voeg hierboven iemand met dezelfde doelen toe als buddy
              </Text>
            </GlassCard>
          ) : null
        }
      />
    </View>
  );
}
