import BookCard from "@/src/components/bookCard";
import ScreenHeader from "@/src/components/screenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { getPurchases, type Purchase } from "@/src/lib/purchases-storage";
import { ApiError } from "@/src/services/api";
import { userService } from "@/src/services/user.service";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FALLBACK_IMAGE_URI = "https://via.placeholder.com/600x900.png?text=Livro";

function formatPriceParts(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const [priceWhole, priceCents] = safeValue.toFixed(2).split(".") as [
    string,
    string,
  ];
  return { priceWhole, priceCents };
}

function formatCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `R$ ${safeValue.toFixed(2).replace(".", ",")}`;
}

function formatPurchaseDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

export default function MyPurchases() {
  const { isAuthenticated } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        try {
          setLoading(true);
          setError(null);

          if (!isAuthenticated) {
            if (!cancelled) setPurchases([]);
            return;
          }

          const me = await userService.getMe();
          const items = await getPurchases(me.id);
          if (!cancelled) setPurchases(items);
        } catch (err) {
          if (!cancelled)
            setError(
              err instanceof ApiError
                ? err.message
                : "Não foi possível carregar suas compras.",
            );
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();

      return () => {
        cancelled = true;
      };
    }, [isAuthenticated]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Minhas Compras" />
      {loading ? (
        <ActivityIndicator
          color="#6c63ff"
          size="large"
          style={{ marginTop: 48 }}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : purchases.length === 0 ? (
        <Text style={styles.emptyText}>
          {isAuthenticated
            ? "Você ainda não tem compras."
            : "Faça login para ver suas compras."}
        </Text>
      ) : (
        <FlatList
          style={{ marginTop: 18 }}
          data={purchases}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            paddingHorizontal: 6,
          }}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => {
            const { priceWhole, priceCents } = formatPriceParts(item.price);
            const formattedDate = formatPurchaseDate(item.purchasedAt);

            return (
              <View style={styles.purchaseItem}>
                <BookCard
                  title={item.title}
                  priceWhole={priceWhole}
                  priceCents={priceCents}
                  imageUri={item.imageUri || FALLBACK_IMAGE_URI}
                  condition={item.condition}
                  columns={2}
                  extraInfo={
                    <View style={styles.purchaseMetaInline}>
                      <Text style={styles.purchaseMetaText}>
                        Frete: {formatCurrency(item.shipping)}
                      </Text>
                      <Text style={styles.purchaseMetaText}>
                        Total: {formatCurrency(item.total)}
                      </Text>
                      <Text style={styles.purchaseMetaDate}>
                        {formattedDate
                          ? `Compra em ${formattedDate}`
                          : "Compra registrada"}
                      </Text>
                    </View>
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/book-details",
                      params: { id: item.bookId },
                    })
                  }
                />
              </View>
            );
          }}
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
    paddingHorizontal: 24,
  },
  purchaseItem: {
    alignItems: "center",
  },
  purchaseMetaInline: {
    gap: 4,
  },
  purchaseMetaText: {
    fontFamily: "montserratRegular",
    fontSize: 14,
    color: "#2b2e34",
  },
  purchaseMetaDate: {
    fontFamily: "montserratBold",
    fontSize: 13,
    color: "#6c63ff",
  },
});
