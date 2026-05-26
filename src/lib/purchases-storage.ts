import * as SecureStore from "expo-secure-store";

type PurchaseCondition =
  | "Novo"
  | "Usado"
  | "Usado (Bom)"
  | "Com Grifos"
  | "Danificado";

export type Purchase = {
  id: string;
  bookId: string;
  title: string;
  author: string;
  imageUri: string;
  condition: PurchaseCondition;
  price: number;
  shipping: number;
  total: number;
  addressText: string;
  purchasedAt: string;
};

const PURCHASES_KEY = "forbook.purchases";

function buildPurchasesKey(userId?: string) {
  if (userId && userId.trim().length > 0) {
    return `${PURCHASES_KEY}.${userId}`;
  }

  return PURCHASES_KEY;
}

function isPurchaseArray(value: unknown): value is Purchase[] {
  return Array.isArray(value);
}

export async function getPurchases(userId?: string): Promise<Purchase[]> {
  try {
    const raw = await SecureStore.getItemAsync(buildPurchasesKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (isPurchaseArray(parsed)) return parsed as Purchase[];
    return [];
  } catch {
    return [];
  }
}

export async function savePurchases(
  purchases: Purchase[],
  userId?: string,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      buildPurchasesKey(userId),
      JSON.stringify(purchases),
    );
  } catch {
    // ignore
  }
}

export async function addPurchase(
  purchase: Purchase,
  userId?: string,
): Promise<void> {
  try {
    const current = await getPurchases(userId);
    const next = [purchase, ...current];
    await savePurchases(next, userId);
  } catch {
    // ignore
  }
}

export async function clearPurchases(userId?: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(buildPurchasesKey(userId));
  } catch {
    // ignore
  }
}
