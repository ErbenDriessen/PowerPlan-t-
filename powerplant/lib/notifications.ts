// powerplant/lib/notifications.ts
//
// Thin wrapper around expo-notifications that no-ops inside Expo Go.
//
// Why: since Expo SDK 53 the Expo Go client no longer ships the push-token
// native code, and `expo-notifications/build/DevicePushTokenAutoRegistration`
// throws at module-import time when it tries to wire that up. Even though
// we only use *local* (scheduled) notifications, just importing the module
// crashes the bundle in Expo Go. So we lazy-`require` it only when running
// in a real (development or production) build, and expose a safe API that
// silently does nothing inside Expo Go.

import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

type NotifModule = typeof import("expo-notifications");
let mod: NotifModule | null = null;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("expo-notifications") as NotifModule;
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowAlert: true,
      }),
    });
  } catch {
    mod = null;
  }
}

export const notificationsAvailable = mod !== null;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!mod) return false;
  try {
    const current = await mod.getPermissionsAsync();
    if (current.status === "granted") return true;
    if (current.status === "undetermined") {
      const asked = await mod.requestPermissionsAsync();
      return asked.status === "granted";
    }
    return false;
  } catch {
    return false;
  }
}

export async function scheduleAt(
  when: Date,
  title: string,
  body: string,
): Promise<string | null> {
  if (!mod) return null;
  try {
    const id = await mod.scheduleNotificationAsync({
      content: { title, body, sound: true },
      // The any-cast covers a minor type mismatch between expo-notifications
      // versions on the DATE trigger shape; the date form is supported.
      trigger: { date: when } as any,
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelScheduled(id: string | null): Promise<void> {
  if (!mod || !id) return;
  try {
    await mod.cancelScheduledNotificationAsync(id);
  } catch {
    // already fired or invalid id — nothing to do
  }
}
