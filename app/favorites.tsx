import BookCard from "@/src/components/bookCard";
import ScreenHeader from "@/src/components/screenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { getFavorites } from "@/src/lib/favorites-storage";
import { ApiError, apiFetch } from "@/src/services/api";
import { userService } from "@/src/services/user.service";
import {
  userBookService,
  type UserBook,
  type UserBookCondition,
} from "@/src/services/userBook.service";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Condition = "Novo" | "Usado";

const FALLBACK_IMAGE_URI = "https://via.placeholder.com/600x900.png?text=Livro";

function mapConditionLabel(condition: UserBookCondition): Condition {
  if (condition === "NEW") return "Novo";
  return "Usado";
}

function formatPriceParts(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const [priceWhole, priceCents] = safeValue.toFixed(2).split(".") as [
    string,
    string,
  ];
  return { priceWhole, priceCents };
}

function mapUserBookToCard(userBook: UserBook) {
  const { priceWhole, priceCents } = formatPriceParts(userBook.price);

  return {
    id: userBook.id,
    title: userBook.CatalogBook.title,
    author: userBook.CatalogBook.author,
    priceWhole,
    priceCents,
    imageUri: userBook.MainImage?.url ?? FALLBACK_IMAGE_URI,
    condition: mapConditionLabel(userBook.condition),
  };
}

export default function MyFavorites() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const load = useCallback(async () => {
    let cancelled = false;
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        if (!cancelled) setBooks([]);
        return;
      }

      const me = await userService.getMe();
      let wishlist: any;

      try {
        wishlist = await userService.getUserWishlist(me.id);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          const favIds = await getFavorites(me.id);

          if (favIds.length === 0) {
            if (!cancelled) setBooks([]);
            return;
          }

          const items = await Promise.all(
            favIds.map((id) => userBookService.getUserBookById(id)),
          );

          if (!cancelled) setBooks(items.map(mapUserBookToCard));
          return;
        }

        throw err;
      }
      const catalogBooks = wishlist?.CatalogBooks ?? [];

      const cards: any[] = [];

      await Promise.all(
        catalogBooks.map(async (cb: any) => {
          try {
            const filter = JSON.stringify({ bookId: cb.id });
            const res = await apiFetch<{ data: any[] }>(
              `/user-books?filter=${encodeURIComponent(filter)}`,
            );
            const ub = res.data?.[0];
            if (ub) {
              cards.push({
                id: ub.id,
                title: ub.CatalogBook.title,
                author: ub.CatalogBook.author,
                priceWhole: (ub.price ?? 0).toFixed(2).split(".")[0],
                priceCents: (ub.price ?? 0).toFixed(2).split(".")[1],
                imageUri: ub.MainImage?.url ?? FALLBACK_IMAGE_URI,
                condition: mapConditionLabel(ub.condition),
                catalogId: cb.id,
              });
            } else {
              cards.push({
                id: cb.id,
                title: cb.title,
                author: cb.author,
                priceWhole: "0",
                priceCents: "00",
                imageUri: FALLBACK_IMAGE_URI,
                condition: "Usado",
                catalogId: cb.id,
              });
            }
          } catch {
            cards.push({
              id: cb.id,
              title: cb.title,
              author: cb.author,
              priceWhole: "0",
              priceCents: "00",
              imageUri: FALLBACK_IMAGE_URI,
              condition: "Usado",
              catalogId: cb.id,
            });
          }
        }),
      );

      if (!cancelled) setBooks(cards);
    } catch (err) {
      if (!cancelled)
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar os favoritos.",
        );
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      load();
      return () => {
        active = false;
      };
    }, [load]),
  );

  // unfavorite handled from details screen; removing inline unfavorite button

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Livros Favoritos" />
      {loading ? (
        <ActivityIndicator
          color="#6c63ff"
          size="large"
          style={{ marginTop: 48 }}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : books.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum livro favoritado.</Text>
      ) : (
        <FlatList
          style={{ marginTop: 18 }}
          data={books}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            paddingHorizontal: 6,
          }}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <BookCard
              title={item.title}
              priceWhole={item.priceWhole}
              priceCents={item.priceCents}
              imageUri={item.imageUri}
              condition={item.condition}
              onPress={() =>
                router.push({
                  pathname: "/book-details",
                  params: { id: item.id },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  errorText: {
    fontFamily: "montserratRegular",
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 32,
    fontSize: 14,
  },
  emptyText: {
    fontFamily: "montserratRegular",
    color: "#7a7f86",
    textAlign: "center",
    marginTop: 32,
    fontSize: 14,
  },
});
