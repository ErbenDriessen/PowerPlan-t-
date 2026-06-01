import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Buddy, Message } from '../types';

/**
 * Voor Expo Go op een fysiek Android/iOS apparaat:
 * vervang localhost door het LAN-IP van je computer (bijv. http://192.168.1.10:3000).
 * Voor Android emulator: http://10.0.2.2:3000
 * Voor iOS simulator: localhost werkt gewoon.
 */
export const API_BASE = 'http://145.138.68.44:3306';
const TOKEN_KEY = 'buddy-jwt';

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json();
  if (!res.ok) {
    const err = data as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

// Auth
export function register(username: string, email: string, password: string) {
  return request<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  }, false);
}

export function login(email: string, password: string) {
  return request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false);
}

// Users
export function getMe() {
  return request<User>('/users/me');
}

export function updateMe(data: { username?: string; password?: string; currentPassword?: string }) {
  return request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteMe() {
  return request<void>('/users/me', { method: 'DELETE' });
}

export function searchUsers(q: string) {
  return request<{ id: string; username: string }[]>(
    `/users/search?q=${encodeURIComponent(q)}`
  );
}

// Buddies
export function getBuddies() {
  return request<Buddy[]>('/buddies');
}

export function sendBuddyRequest(receiverId: string) {
  return request<Buddy>('/buddies', { method: 'POST', body: JSON.stringify({ receiverId }) });
}

export function updateBuddyStatus(buddyId: string, status: 'accepted' | 'blocked') {
  return request<Buddy>(`/buddies/${buddyId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Messages
export function getMessages(buddyId: string, since?: string) {
  const q = since ? `?since=${encodeURIComponent(since)}` : '';
  return request<Message[]>(`/buddies/${buddyId}/messages${q}`);
}

export function sendMessage(buddyId: string, body: string, type = 'text') {
  return request<Message>(`/buddies/${buddyId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body, type }),
  });
}
