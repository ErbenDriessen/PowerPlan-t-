import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Message } from '../types';

function key(buddyId: string) {
  return `buddy-messages-${buddyId}`;
}

export async function loadCachedMessages(buddyId: string): Promise<Message[]> {
  try {
    const raw = await AsyncStorage.getItem(key(buddyId));
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}

export async function cacheMessages(buddyId: string, messages: Message[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key(buddyId), JSON.stringify(messages));
  } catch {
    // silently ignore cache failures
  }
}

export async function clearBuddyCache(buddyId: string): Promise<void> {
  await AsyncStorage.removeItem(key(buddyId));
}
