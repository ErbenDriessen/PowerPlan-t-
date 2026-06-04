import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { DuskBackground } from "../../components/DuskBackground";
import { useBuddyStore } from "../../stores/useBuddyStore";
import * as buddyApi from "../../features/buddy/api/buddyApi";
import { loadCachedMessages, cacheMessages } from "../../features/buddy/storage/buddyStorage";
import type { Message } from "../../features/buddy/types";

const PRESET_MESSAGES = [
  "Je doet het super! 💪",
  "Hoe gaat het vandaag?",
  "Ik heb mijn doel gehaald! 🌱",
  "Ga zo door!",
  "Ik struggle even...",
  "We doen het samen!",
  "Heb je al bewogen vandaag?",
  "Goed bezig!",
  "Ik ga even een pauze nemen",
  "Vandaag was moeilijk",
  "Check! Doel gedaan ✓",
  "Morgen beter!",
];

export default function ChatScreen() {
  const { buddyId: buddyIdParam, username } = useLocalSearchParams<{ buddyId: string; username: string }>();
  const buddyId = Number(buddyIdParam);
  const currentUser = useBuddyStore((s) => s.currentUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    loadCachedMessages(buddyIdParam).then((cached) => {
      if (cached.length > 0) setMessages(cached);
    });
    sync();
    const id = setInterval(sync, 10_000);
    return () => clearInterval(id);
  }, [buddyIdParam]);

  async function sync() {
    try {
      const fetched = await buddyApi.getMessages(buddyId);
      setMessages(fetched);
      await cacheMessages(buddyIdParam, fetched);
    } catch { /* offline — toon gecachte berichten */ }
  }

  async function handleSend(text: string) {
    const optimistic: Message = {
      id: -Date.now(),
      buddyId,
      senderId: currentUser?.id ?? "",
      body: text,
      type: "preset",
      sentAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const sent = await buddyApi.sendMessage(buddyId, text, "preset");
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? sent : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  }

  const myId = currentUser?.id ?? "";
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <DuskBackground />

      {/* Header */}
      <View className="px-5 pb-3 flex-row items-center gap-3" style={{ paddingTop: insets.top + 8 }}>
        <Pressable onPress={() => router.back()} className="pr-2 py-1">
          <Text className="text-white text-xl">‹</Text>
        </Pressable>
        <View className="w-9 h-9 rounded-full bg-primary/30 items-center justify-center">
          <Text className="text-white font-extrabold">
            {(username ?? "?")[0].toUpperCase()}
          </Text>
        </View>
        <Text className="text-white font-extrabold text-base">{username}</Text>
      </View>

      <View className="flex-1">
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerClassName="px-4 pt-2 pb-4"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item: m }) => {
            const mine = m.senderId === myId;
            return (
              <View className={`mb-2 max-w-[78%] ${mine ? "self-end" : "self-start"}`}>
                <View
                  className={`px-4 py-2.5 rounded-2xl ${
                    mine
                      ? "bg-primary rounded-br-sm"
                      : "bg-white/15 rounded-bl-sm"
                  } ${m.pending ? "opacity-60" : ""}`}
                >
                  <Text className="text-white text-sm leading-snug">{m.body}</Text>
                </View>
                <Text
                  className={`text-white/35 text-[10px] mt-0.5 ${
                    mine ? "text-right" : "text-left"
                  }`}
                >
                  {m.pending
                    ? "Verzenden..."
                    : new Date(m.sentAt).toLocaleTimeString("nl-NL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </Text>
              </View>
            );
          }}
        />

        {/* Preset berichten */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-t border-white/10 flex-grow-0"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: insets.bottom + 12,
            gap: 8,
            flexDirection: "row",
          }}
        >
          {PRESET_MESSAGES.map((msg) => (
            <Pressable
              key={msg}
              onPress={() => handleSend(msg)}
              className="bg-white/15 rounded-2xl px-4 py-2.5 active:opacity-60"
            >
              <Text className="text-white text-sm">{msg}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
