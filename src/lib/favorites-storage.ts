import * as SecureStore from "expo-secure-store";

const FAVORITES_KEY = "forbook.favorites";

export async function getFavorites(): Promise<string[]> {
  try {
    const raw = await SecureStore.getItemAsync(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed as string[];
    return [];
  } catch {
    return [];
  }
}

export async function saveFavorites(ids: string[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export async function clearFavorites(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(FAVORITES_KEY);
  } catch {
    // ignore
  }
}
