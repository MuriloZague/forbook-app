import BookImageViewerModal from "@/src/components/bookImageViewerModal";
import ScreenHeader from "@/src/components/screenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { getFavorites, saveFavorites } from "@/src/lib/favorites-storage";
import { addPurchase } from "../src/lib/purchases-storage";
import { ApiError } from "@/src/services/api";
import { userService, type UserProfile } from "@/src/services/user.service";
import {
    userBookService,
    type UserBook,
    type UserBookCondition,
} from "@/src/services/userBook.service";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
    Animated,
    Dimensions,
    FlatList,
  Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
  Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = 480;
const SYNOPSIS_BASE_TEXT = "Livro sem sinopse";
const DEFAULT_PRODUCT_DESCRIPTION = "descricao nao informa pelo anunciante";
const FALLBACK_IMAGE_URI = "https://via.placeholder.com/600x900.png?text=Livro";
const DEFAULT_ADDRESS_TEXT = "Endereço não informado";
const SHIPPING_FEE = 15;

type ConditionLabel =
  | "Novo"
  | "Usado"
  | "Usado (Bom)"
  | "Com Grifos"
  | "Danificado";

function getParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function mapConditionLabel(condition?: UserBookCondition | string): ConditionLabel {
  if (!condition) {
    return "Usado";
  }

  if (
    condition === "Novo" ||
    condition === "Usado (Bom)" ||
    condition === "Com Grifos" ||
    condition === "Danificado"
  ) {
    return condition;
  }

  if (condition === "NEW") {
    return "Novo";
  }

  if (condition === "LIKE_NEW" || condition === "GOOD") {
    return "Usado (Bom)";
  }

  if (condition === "ACCEPTABLE") {
    return "Com Grifos";
  }

  if (condition === "POOR") {
    return "Danificado";
  }

  return "Usado";
}

function formatPriceParts(value?: number): {
  priceWhole: string;
  priceCents: string;
} {
  const safeValue = Number.isFinite(value) ? (value as number) : 0;
  const [priceWhole, priceCents] = safeValue.toFixed(2).split(".") as [
    string,
    string,
  ];
  return { priceWhole, priceCents };
}

function splitSynopsis(text: string) {
  const trimmed = text.trim();

  if (trimmed.length <= 180) {
    return { base: trimmed, extra: "" };
  }

  return {
    base: trimmed.slice(0, 180).trimEnd(),
    extra: trimmed.slice(180).trimStart(),
  };
}

function parsePriceValue(whole: string, cents: string) {
  const safeWhole = whole.replace(/[^\d]/g, "");
  const safeCents = cents.replace(/[^\d]/g, "");
  const normalizedCents = (safeCents || "00").slice(0, 2).padEnd(2, "0");
  const numeric = Number(`${safeWhole || "0"}.${normalizedCents}`);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `R$ ${safeValue.toFixed(2).replace(".", ",")}`;
}

function getPrimaryAddress(user?: UserProfile | null) {
  const addresses = user?.Addresses ?? [];
  return addresses.find((item) => item.isDefault) ?? addresses[0];
}

function formatAddress(user?: UserProfile | null) {
  const address = getPrimaryAddress(user);
  if (!address) {
    return DEFAULT_ADDRESS_TEXT;
  }

  const complement = address.complement ? `, ${address.complement}` : "";
  return `${address.street}, ${address.number}${complement} - ${address.neighborhood}\n${address.city} - ${address.state} (${address.zipCode})`;
}

export default function BookDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string | string[];
    title?: string | string[];
    author?: string | string[];
    priceWhole?: string | string[];
    priceCents?: string | string[];
    imageUri?: string | string[];
    condition?: string | string[];
  }>();

  const bookId = getParam(params.id) || "book";
  const title = getParam(params.title) || "Livro sem titulo";
  const author = getParam(params.author) || "Autor desconhecido";
  const priceWhole = getParam(params.priceWhole) || "0";
  const priceCents = getParam(params.priceCents) || "00";
  const imageUri = getParam(params.imageUri) || FALLBACK_IMAGE_URI;
  const conditionParam = getParam(params.condition);
  const [bookData, setBookData] = useState<UserBook | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadBook() {
      if (!bookId || bookId === "book") {
        return;
      }

      try {
        setLoadError(null);
        const userBook = await userBookService.getUserBookById(bookId);

        if (!cancelled) {
          setBookData(userBook);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof ApiError
              ? error.message
              : "Não foi possível carregar o anúncio.",
          );
        }
      }
    }

    loadBook();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  useEffect(() => {
    let cancelled = false;

    async function loadFav() {
      if (!bookId || bookId === "book") return;

      try {
        if (!isAuthenticated) {
          if (!cancelled) setIsFavorited(false);
          return;
        }

        const me = await userService.getMe();

        try {
          const wishlist = await userService.getUserWishlist(me.id);
          const catalogIds =
            wishlist?.CatalogBooks?.map((b: any) => b.id) ?? [];
          const currentCatalogId = bookData?.CatalogBook?.id;
          if (!cancelled)
            setIsFavorited(
              Boolean(
                currentCatalogId && catalogIds.includes(currentCatalogId),
              ),
            );
          return;
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            const ids = await getFavorites(me.id);
            if (!cancelled) setIsFavorited(ids.includes(bookId));
            return;
          }

          throw err;
        }
      } catch {
        // ignore
      }
    }

    loadFav();

    return () => {
      cancelled = true;
    };
  }, [bookId, isAuthenticated, bookData?.CatalogBook?.id]);

  const resolvedTitle = bookData?.CatalogBook.title ?? title;
  const resolvedAuthor = bookData?.CatalogBook.author ?? author;
  const resolvedCondition = mapConditionLabel(
    bookData?.condition ?? conditionParam,
  );
  const resolvedPrice = bookData
    ? formatPriceParts(bookData.price)
    : { priceWhole, priceCents };
  const synopsisText =
    bookData?.CatalogBook.description?.trim() || SYNOPSIS_BASE_TEXT;
  const { base: synopsisBaseText, extra: synopsisExtraText } = useMemo(
    () => splitSynopsis(synopsisText),
    [synopsisText],
  );
  const descriptionText =
    bookData?.description?.trim() || DEFAULT_PRODUCT_DESCRIPTION;
  const sellerName = bookData?.User.name ?? "Carregando..";
  const sellerImageUrl = bookData?.User.ProfileImage?.url ?? "";
  const galleryImages = useMemo(() => {
    if (bookData) {
      const images = [
        bookData.MainImage?.url,
        ...bookData.GalleryImages.map((image) => image.url),
      ].filter(Boolean) as string[];
      const unique = Array.from(new Set(images));

      if (unique.length > 0) {
        return unique;
      }
    }

    return imageUri ? [imageUri] : [FALLBACK_IMAGE_URI];
  }, [bookData, imageUri]);

  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [isPurchaseModalVisible, setIsPurchaseModalVisible] = useState(false);
  const [purchaseAddress, setPurchaseAddress] = useState(DEFAULT_ADDRESS_TEXT);
  const [purchaseUserId, setPurchaseUserId] = useState<string | null>(null);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isPurchaseFinalizing, setIsPurchaseFinalizing] = useState(false);
  const listRef = useRef<FlatList<string>>(null);

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-10)).current;
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  function showSavedToast() {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    toastOpacity.stopAnimation();
    toastTranslateY.stopAnimation();

    toastOpacity.setValue(0);
    toastTranslateY.setValue(-10);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      toastTimeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: -10,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1100);
    });
  }

  function handleFavoritePress() {
    if (!isAuthenticated) return;

    setIsFavorited((prev) => {
      const next = !prev;

      (async () => {
        try {
          const me = await userService.getMe();
          const catalogId = bookData?.CatalogBook?.id;
          if (!catalogId) {
            const ids = await getFavorites(me.id);
            const nextSet = new Set(ids);

            if (next) {
              nextSet.add(bookId);
            } else {
              nextSet.delete(bookId);
            }

            await saveFavorites(Array.from(nextSet), me.id);
            return;
          }

          if (next) {
            await userService.addBookToWishlist(me.id, catalogId);
          } else {
            await userService.removeBookFromWishlist(me.id, catalogId);
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            try {
              const me = await userService.getMe();
              const ids = await getFavorites(me.id);
              const nextSet = new Set(ids);

              if (next) {
                nextSet.add(bookId);
              } else {
                nextSet.delete(bookId);
              }

              await saveFavorites(Array.from(nextSet), me.id);
            } catch {
              // ignore
            }
          }
        }
      })();

      if (next) showSavedToast();

      return next;
    });
  }

  function handleSynopsisToggle() {
    setIsSynopsisExpanded((prev) => !prev);
  }

  function handleOpenImageViewer(index: number) {
    setViewerImageIndex(index);
    setIsImageViewerVisible(true);
  }

  function handleCloseImageViewer() {
    setIsImageViewerVisible(false);
    setCurrentImageIndex(viewerImageIndex);

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: viewerImageIndex,
        animated: false,
      });
    });
  }

  function scrollToImage(index: number) {
    const clampedIndex = Math.max(0, Math.min(index, galleryImages.length - 1));
    listRef.current?.scrollToIndex({ index: clampedIndex, animated: true });
    setCurrentImageIndex(clampedIndex);
  }

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / SCREEN_WIDTH);

    setCurrentImageIndex(
      Math.max(0, Math.min(nextIndex, galleryImages.length - 1)),
    );
  }

  async function handleOpenPurchaseModal() {
    if (!isAuthenticated) {
      Alert.alert("Login necessário", "Faça login para comprar.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Entrar", onPress: () => router.push("/login") },
      ]);
      return;
    }

    setIsPurchaseModalVisible(true);
    setIsPurchaseLoading(true);

    try {
      const me = await userService.getMe();
      setPurchaseUserId(me.id);
      setPurchaseAddress(formatAddress(me));
    } catch {
      setPurchaseUserId(null);
      setPurchaseAddress(DEFAULT_ADDRESS_TEXT);
    } finally {
      setIsPurchaseLoading(false);
    }
  }

  function handleClosePurchaseModal() {
    if (isPurchaseFinalizing) {
      return;
    }

    setIsPurchaseModalVisible(false);
  }

  async function handleFinalizePurchase() {
    if (isPurchaseFinalizing) {
      return;
    }

    setIsPurchaseFinalizing(true);

    try {
      const userId = purchaseUserId ?? (await userService.getMe()).id;
      const priceValue =
        bookData?.price ?? parsePriceValue(priceWhole, priceCents);
      const totalValue = priceValue + SHIPPING_FEE;
      const addressText = purchaseAddress || DEFAULT_ADDRESS_TEXT;

      await addPurchase(
        {
          id: `${bookId}-${Date.now()}`,
          bookId,
          title: resolvedTitle,
          author: resolvedAuthor,
          imageUri: galleryImages[0] ?? FALLBACK_IMAGE_URI,
          condition: resolvedCondition,
          price: priceValue,
          shipping: SHIPPING_FEE,
          total: totalValue,
          addressText,
          purchasedAt: new Date().toISOString(),
        },
        userId,
      );

      setIsPurchaseModalVisible(false);
      router.push("/mypurchases");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof ApiError
          ? error.message
          : "Não foi possível finalizar a compra.",
      );
    } finally {
      setIsPurchaseFinalizing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Anúncio"
        iconName="close"
        iconSize={26}
        titleFontFamily="lexendBold"
        borderBottomColor="#f0f0f0"
      />

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
              pointerEvents: "none",
            },
          ]}
        >
          <Text style={styles.toastText}>Livro Salvo</Text>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 120 + insets.bottom },
          ]}
        >
          {loadError ? (
            <Text style={styles.loadErrorText}>{loadError}</Text>
          ) : null}

          <View style={styles.sellerRow}>
            <View style={styles.sellerInfo}>
              <Image
                source={sellerImageUrl}
                style={styles.avatar}
                contentFit="cover"
              />
              <View>
                <Text style={styles.sellerName}>{sellerName}</Text>
                <Text style={styles.sellerMeta}>Anunciado 3 horas atrás</Text>
              </View>
            </View>

            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.topIconBtn}
                onPress={handleFavoritePress}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isFavorited ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorited ? "#f66183" : "#2b2e34"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.topIconBtn}
                onPress={() => console.log("Compartilhar anúncio", bookId)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="share-social-outline"
                  size={23}
                  color="#2b2e34"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.carouselContainer}>
            <FlatList
              ref={listRef}
              data={galleryImages}
              keyExtractor={(_, index) => `${bookId}-${index}`}
              horizontal
              pagingEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                requestAnimationFrame(() => {
                  listRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                });
              }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.slide}
                  activeOpacity={1}
                  onPress={() => handleOpenImageViewer(index)}
                >
                  <Image
                    source={{ uri: item }}
                    style={styles.bookImage}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              )}
            />

            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{resolvedCondition}</Text>
            </View>

            <TouchableOpacity
              style={[styles.carouselArrow, styles.carouselArrowLeft]}
              onPress={() => scrollToImage(currentImageIndex - 1)}
              activeOpacity={0.85}
            >
              <Ionicons name="chevron-back" size={24} color="#5d5f63" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.carouselArrow, styles.carouselArrowRight]}
              onPress={() => scrollToImage(currentImageIndex + 1)}
              activeOpacity={0.85}
            >
              <Ionicons name="chevron-forward" size={24} color="#5d5f63" />
            </TouchableOpacity>

            <View style={styles.dotsRow}>
              {galleryImages.map((_, index) => (
                <View
                  key={`dot-${index}`}
                  style={[
                    styles.dot,
                    index === currentImageIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.titlePriceRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.bookTitle}>{resolvedTitle}</Text>
              <Text style={styles.bookAuthor}>{resolvedAuthor}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.currency}>R$</Text>
              <Text style={styles.priceWhole}>{resolvedPrice.priceWhole}</Text>
              <Text style={styles.priceCents}>{resolvedPrice.priceCents}</Text>
            </View>
          </View>

          <View style={styles.textSection}>
            <Text style={styles.sectionLabel}>Sinopse</Text>
            <Text style={styles.sectionText}>{synopsisBaseText}</Text>
            {synopsisExtraText ? (
              <>
                {isSynopsisExpanded ? (
                  <Text style={styles.sectionText}>{synopsisExtraText}</Text>
                ) : null}
                <TouchableOpacity
                  onPress={handleSynopsisToggle}
                  activeOpacity={0.8}
                >
                  <Text style={styles.readMoreStandalone}>
                    {isSynopsisExpanded ? "Mostrar menos" : "Ler mais..."}
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.textSection}>
            <Text style={styles.sectionLabel}>Descrição do produto</Text>
            <Text style={styles.descriptionText}>{descriptionText}</Text>
          </View>

        </ScrollView>

        <BookImageViewerModal
          visible={isImageViewerVisible}
          imageUris={galleryImages}
          imageIndex={viewerImageIndex}
          onImageIndexChange={(index) => setViewerImageIndex(index)}
          onRequestClose={handleCloseImageViewer}
        />

        <Modal
          visible={isPurchaseModalVisible}
          animationType="slide"
          transparent
          onRequestClose={handleClosePurchaseModal}
        >
          <Pressable
            style={styles.purchaseBackdrop}
            onPress={handleClosePurchaseModal}
          >
            <Pressable
              style={[
                styles.purchaseSheet,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
              onPress={() => {}}
            >
              <View style={styles.purchaseHeader}>
                <Text style={styles.purchaseTitle}>Finalizar compra</Text>
                <TouchableOpacity
                  style={styles.purchaseCloseButton}
                  onPress={handleClosePurchaseModal}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color="#2b2e34" />
                </TouchableOpacity>
              </View>

              <View style={styles.purchaseSection}>
                <Text style={styles.purchaseSectionTitle}>Resumo</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Preço do anúncio</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(
                      bookData?.price ??
                        parsePriceValue(priceWhole, priceCents),
                    )}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Frete (fixo)</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(SHIPPING_FEE)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>
                    {formatCurrency(
                      (bookData?.price ??
                        parsePriceValue(priceWhole, priceCents)) + SHIPPING_FEE,
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.purchaseSection}>
                <Text style={styles.purchaseSectionTitle}>Entrega</Text>
                {isPurchaseLoading ? (
                  <ActivityIndicator size="small" color="#6c63ff" />
                ) : (
                  <Text style={styles.addressText}>{purchaseAddress}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  isPurchaseFinalizing && styles.purchaseButtonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleFinalizePurchase}
                disabled={isPurchaseFinalizing}
              >
                <Ionicons name="bag-check-outline" size={18} color="#fff" />
                <Text style={styles.purchaseButtonText}>
                  {isPurchaseFinalizing
                    ? "Finalizando..."
                    : "Finalizar compra"}
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <TouchableOpacity
            style={[styles.bottomButton, styles.buyButton]}
            activeOpacity={0.85}
            onPress={handleOpenPurchaseModal}
          >
            <Ionicons name="bag-outline" size={18} color="#fff" />
            <Text style={styles.buyButtonText}>Comprar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomButton, styles.tradeButton]}
            activeOpacity={0.85}
          >
            <Text style={styles.tradeButtonText}>Oferecer Troca</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  toast: {
    position: "absolute",
    right: 25,
    top: -18,
    zIndex: 40,
    backgroundColor: "#f66d89",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toastText: {
    color: "#fff",
    fontFamily: "montserratBold",
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 12,
  },
  loadErrorText: {
    fontFamily: "montserratRegular",
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    backgroundColor: "#d8dbe1",
  },
  sellerName: {
    fontFamily: "montserratBold",
    fontSize: 16,
    color: "#17191f",
  },
  sellerMeta: {
    fontFamily: "montserratRegular",
    fontSize: 12,
    color: "#9ca1a8",
    marginTop: 1,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topIconBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  carouselContainer: {
    marginBottom: 12,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 18,
  },
  bookImage: {
    width: "100%",
    height: IMAGE_HEIGHT,
    borderRadius: 28,
    backgroundColor: "#d5d8df",
  },
  conditionBadge: {
    position: "absolute",
    top: 14,
    left: 30,
    backgroundColor: "rgba(210,212,215,0.95)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  conditionText: {
    fontFamily: "montserratBold",
    color: "#7f848a",
    fontSize: 15,
  },
  carouselArrow: {
    position: "absolute",
    top: IMAGE_HEIGHT / 2 - 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(212,214,218,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  carouselArrowLeft: {
    left: 22,
  },
  carouselArrowRight: {
    right: 22,
  },
  dotsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d5d8de",
  },
  dotActive: {
    backgroundColor: "#6c63ff",
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  titlePriceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  bookTitle: {
    fontFamily: "lexendBold",
    color: "#1f2228",
    fontSize: 20,
    lineHeight: 24,
  },
  bookAuthor: {
    fontFamily: "montserratRegular",
    color: "#868b92",
    fontSize: 15,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  currency: {
    fontFamily: "montserratRegular",
    color: "#2b2e34",
    fontSize: 16,
    alignSelf: "center",
    marginRight: 3,
  },
  priceWhole: {
    fontFamily: "montserratRegular",
    color: "#2b2e34",
    fontSize: 40,
    lineHeight: 58,
  },
  priceCents: {
    fontFamily: "montserratRegular",
    color: "#2b2e34",
    fontSize: 20,
    lineHeight: 26,
    marginTop: 8,
  },
  textSection: {
    paddingHorizontal: 18,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: "montserratBold",
    color: "#8e9399",
    fontSize: 20,
    marginBottom: 2,
  },
  sectionText: {
    fontFamily: "montserratRegular",
    color: "#2d3137",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "justify",
  },
  readMoreStandalone: {
    color: "#f06486",
    fontFamily: "montserratBold",
    fontSize: 16,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#d0d4da",
    marginTop: 14,
    marginBottom: 8,
  },
  descriptionText: {
    fontFamily: "montserratRegular",
    color: "#2d3137",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "justify",
  },
  purchaseBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  purchaseSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 16,
  },
  purchaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  purchaseTitle: {
    fontFamily: "lexendBold",
    fontSize: 18,
    color: "#1f2228",
  },
  purchaseCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#eef0f3",
    alignItems: "center",
    justifyContent: "center",
  },
  purchaseSection: {
    backgroundColor: "#f7f8fa",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  purchaseSectionTitle: {
    fontFamily: "montserratBold",
    fontSize: 15,
    color: "#7f848a",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontFamily: "montserratRegular",
    fontSize: 14,
    color: "#6f747a",
  },
  summaryValue: {
    fontFamily: "montserratBold",
    fontSize: 14,
    color: "#2b2e34",
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e1e4ea",
    paddingTop: 8,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontFamily: "lexendBold",
    fontSize: 15,
    color: "#1f2228",
  },
  summaryTotalValue: {
    fontFamily: "lexendBold",
    fontSize: 16,
    color: "#1f2228",
  },
  addressText: {
    fontFamily: "montserratRegular",
    fontSize: 14,
    color: "#2d3137",
    lineHeight: 20,
  },
  purchaseButton: {
    marginBottom: 6,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#6c63ff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontFamily: "lexendBold",
    fontSize: 16,
    color: "#fff",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "#d3d7de",
    backgroundColor: "#F0F2F5",
  },
  bottomButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  buyButton: {
    backgroundColor: "#6c63ff",
  },
  buyButtonText: {
    color: "#fff",
    fontFamily: "lexendBold",
    fontSize: 16,
  },
  tradeButton: {
    backgroundColor: "#cdd1d7",
  },
  tradeButtonText: {
    color: "#23262d",
    fontFamily: "montserratRegular",
    fontSize: 16,
  },
});
