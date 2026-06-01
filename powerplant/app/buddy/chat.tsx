import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { DuskBackground } from "../../components/DuskBackground";
import { useBuddyStore } from "../../stores/useBuddyStore";
import * as buddyApi from "../../features/buddy/api/buddyApi";
import { loadCachedMessages, cacheMessages } from "../../features/buddy/storage/buddyStorage";
import type { Message } from "../../features/buddy/types";

export default function ChatScreen() {
  const { buddyId, username } = useLocalSearchParams<{ buddyId: string; username: string }>();
  const currentUser = useBuddyStore((s) => s.currentUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    loadCachedMessages(buddyId).then((cached) => {
      if (cached.length > 0) setMessages(cached);
    });
    sync();
    const id = setInterval(sync, 10_000);
    return () => clearInterval(id);
  }, [buddyId]);

  async function sync() {
    try {
      const fetched = await buddyApi.getMessages(buddyId);
      setMessages(fetched);
      await cacheMessages(buddyId, fetched);
    } catch { /* offline — toon gecachte berichten */ }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const optimistic: Message = {
      id: `pending-${Date.now()}`,
      buddyId: parseInt(buddyId, 10),
      senderId: currentUser?.id ?? 0,
      body: text,
      type: "text",
      sentAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const sent = await buddyApi.sendMessage(buddyId, text);
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? sent : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  }

  const myId = currentUser?.id ?? 0;
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <DuskBackground />

      {/* Header — begint onder de systeembalk */}
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

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
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

        {/* Invoerbalk */}
        <View
          className="flex-row items-center gap-2 px-4 py-3 border-t border-white/10"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <TextInput
            className="flex-1 text-white text-sm bg-white/10 rounded-2xl px-4 py-2.5"
            placeholder="Schrijf een berichtje..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleSend}
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
          >
            <Text className="text-white font-bold text-base">↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
