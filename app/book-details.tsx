import BookImageViewerModal from "@/src/components/bookImageViewerModal";
import ScreenHeader from "@/src/components/screenHeader";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
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
const SYNOPSIS_BASE_TEXT =
  "Sinopse legalzinha bonitinha fofinha topzera e bla bla bla.";
const SYNOPSIS_EXTRA_TEXT =
  "Lorem ipsum dollor sit ahemat Lorem ipsum dollor sit ahemat Lorem ipsum dollor sit ahemat Lorem ipsum dollor sit ahemat";

function getParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default function BookDetailsScreen() {
  const insets = useSafeAreaInsets();
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
  const imageUri =
    getParam(params.imageUri) ||
    "https://via.placeholder.com/600x900.png?text=Livro";
  const conditionParam = getParam(params.condition);
  const condition = conditionParam === "Novo" ? "Novo" : "Usado";

  const galleryImages = useMemo(
    () => Array.from({ length: 5 }, () => imageUri),
    [imageUri],
  );

  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [synopsisExtraHeight, setSynopsisExtraHeight] = useState(0);
  const listRef = useRef<FlatList<string>>(null);
  const synopsisAnim = useRef(new Animated.Value(0)).current;

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-10)).current;
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const synopsisAnimatedHeight = synopsisAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, synopsisExtraHeight || 0],
  });

  const synopsisAnimatedOpacity = synopsisAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const synopsisBottomSpacerHeight = synopsisAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [synopsisExtraHeight || 0, 0],
  });

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    Animated.timing(synopsisAnim, {
      toValue: isSynopsisExpanded ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isSynopsisExpanded, synopsisAnim]);

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
    setIsFavorited((prev) => {
      const next = !prev;

      if (next) {
        showSavedToast();
      }

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
          <View style={styles.sellerRow}>
            <View style={styles.sellerInfo}>
              <Image
                source={require("../assets/images/seller.png")}
                style={styles.avatar}
                contentFit="cover"
              />
              <View>
                <Text style={styles.sellerName}>Murilo Zague</Text>
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
              <Text style={styles.conditionText}>{condition}</Text>
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
              <Text style={styles.bookTitle}>{title}</Text>
              <Text style={styles.bookAuthor}>{author}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.currency}>R$</Text>
              <Text style={styles.priceWhole}>{priceWhole}</Text>
              <Text style={styles.priceCents}>{priceCents}</Text>
            </View>
          </View>

          <View style={styles.textSection}>
            <Text style={styles.sectionLabel}>Sinopse</Text>

            <Text style={styles.sectionText}>{SYNOPSIS_BASE_TEXT}</Text>

            <Animated.View
              style={[
                styles.synopsisExtraWrapper,
                {
                  height: synopsisAnimatedHeight,
                  opacity: synopsisAnimatedOpacity,
                },
              ]}
            >
              <Text style={styles.sectionText}>{SYNOPSIS_EXTRA_TEXT}</Text>
            </Animated.View>

            <TouchableOpacity
              onPress={handleSynopsisToggle}
              activeOpacity={0.8}
            >
              <Text style={styles.readMoreStandalone}>
                {isSynopsisExpanded ? "Mostrar menos" : "Ler mais..."}
              </Text>
            </TouchableOpacity>

            <View style={styles.synopsisMeasureLayer}>
              <Text
                style={styles.sectionText}
                onLayout={(event) => {
                  const nextHeight = Math.ceil(event.nativeEvent.layout.height);

                  setSynopsisExtraHeight((prev) =>
                    prev === nextHeight ? prev : nextHeight,
                  );
                }}
              >
                {SYNOPSIS_EXTRA_TEXT}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.textSection}>
            <Text style={styles.sectionLabel}>Descrição do produto</Text>
            <Text style={styles.descriptionText}>
              Odiei esse livro, pior livro que li. To vendendo pra algum trouxa
              que quiser comprar ai. Estou aberto a trocar por algum outro. (De
              preferência Percy Jackson). Obrigado!
            </Text>
          </View>

          <Animated.View
            style={{
              height: synopsisBottomSpacerHeight,
              pointerEvents: "none",
            }}
          />
        </ScrollView>

        <BookImageViewerModal
          visible={isImageViewerVisible}
          imageUris={galleryImages}
          imageIndex={viewerImageIndex}
          onImageIndexChange={(index) => setViewerImageIndex(index)}
          onRequestClose={handleCloseImageViewer}
        />

        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <TouchableOpacity
            style={[styles.bottomButton, styles.buyButton]}
            activeOpacity={0.85}
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
  readMore: {
    color: "#f06486",
    fontFamily: "montserratBold",
  },
  readMoreStandalone: {
    color: "#f06486",
    fontFamily: "montserratBold",
    fontSize: 16,
    lineHeight: 22,
  },
  synopsisExtraWrapper: {
    overflow: "hidden",
  },
  synopsisMeasureLayer: {
    position: "absolute",
    opacity: 0,
    left: 18,
    right: 18,
    top: 0,
    pointerEvents: "none",
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
