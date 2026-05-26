import * as SecureStore from "expo-secure-store";

const FAVORITES_KEY = "forbook.favorites";

function buildFavoritesKey(userId?: string) {
  if (userId && userId.trim().length > 0) {
    return `${FAVORITES_KEY}.${userId}`;
  }

  return FAVORITES_KEY;
}

export async function getFavorites(userId?: string): Promise<string[]> {
  try {
    const raw = await SecureStore.getItemAsync(buildFavoritesKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed as string[];
    return [];
  } catch {
    return [];
  }
}

export async function saveFavorites(ids: string[], userId?: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      buildFavoritesKey(userId),
      JSON.stringify(ids),
    );
  } catch {
    // ignore
  }
}

export async function clearFavorites(userId?: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(buildFavoritesKey(userId));
  } catch {
    // ignore
  }
}
