import BookCard from "@/src/components/bookCard";
import ScreenHeader from "@/src/components/screenHeader";
import { ApiError } from "@/src/services/api";
import {
  userBookService,
  type UserBook,
  type UserBookCondition,
} from "@/src/services/userBook.service";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text
} from "react-native";
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

export default function MyAnnounces() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const myBooks = await userBookService.listMyUserBooks();
        if (!cancelled) {
          setBooks(myBooks.map(mapUserBookToCard));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar seus anúncios.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Meus Anúncios"/>
      {loading ? (
        <ActivityIndicator
          color="#6c63ff"
          size="large"
          style={{ marginTop: 48 }}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : books.length === 0 ? (
        <Text style={styles.emptyText}>Você ainda não tem anúncios.</Text>
      ) : (
        <FlatList
        style={{marginTop: 18}}
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
    margin: 6,
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
