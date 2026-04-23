import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SESSION_STORAGE_KEY = "forbook.session";
const LEGACY_WEB_SESSION_STORAGE_KEY = "@forbook:session";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeSession = value as Partial<AuthSession>;

  return (
    typeof maybeSession.accessToken === "string" &&
    maybeSession.accessToken.length > 0 &&
    typeof maybeSession.refreshToken === "string" &&
    maybeSession.refreshToken.length > 0
  );
}

export async function persistSession(session: AuthSession): Promise<void> {
  const serialized = JSON.stringify(session);

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STORAGE_KEY, serialized);
      window.localStorage.removeItem(LEGACY_WEB_SESSION_STORAGE_KEY);
    }
    return;
  }

  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, serialized);
}

export async function clearPersistedSession(): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_WEB_SESSION_STORAGE_KEY);
    }
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}

export async function loadPersistedSession(): Promise<AuthSession | null> {
  let rawSession: string | null = null;

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      rawSession =
        window.localStorage.getItem(SESSION_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_WEB_SESSION_STORAGE_KEY);

      if (rawSession && !window.localStorage.getItem(SESSION_STORAGE_KEY)) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, rawSession);
        window.localStorage.removeItem(LEGACY_WEB_SESSION_STORAGE_KEY);
      }
    }
  } else {
    rawSession = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
  }

  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as unknown;

    if (!isValidSession(parsed)) {
      await clearPersistedSession();
      return null;
    }

    return parsed;
  } catch {
    await clearPersistedSession();
    return null;
  }
}
