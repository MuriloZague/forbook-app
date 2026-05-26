import QrCode from "@/assets/images/code.svg";
import Config from "@/assets/images/config.svg";
import Notification from "@/assets/images/Notification.svg";
import Order from "@/assets/images/order.svg";
import Sign from "@/assets/images/sign.svg";
import User2 from "@/assets/images/User.svg";
import AppTopHeader from "@/src/components/appTopHeader";
import BookCard from "@/src/components/bookCard";
import DismissKeyboardView from "@/src/components/dismissKeyboardView";
import HorizontalOptionBar from "@/src/components/horizontalOptionBar";
import { useAuth } from "@/src/hooks/useAuth";
import { ApiError } from "@/src/services/api";
import { openLibraryService, type OpenLibraryBook } from "@/src/services/openLibrary.service";
import {
  listMyUserBooksWithMeta,
  listUserBooksWithMeta,
  type UserBook,
  type UserBookCondition,
} from "@/src/services/userBook.service";
import { userService, type UserProfile } from "@/src/services/user.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Condition = "Novo" | "Usado" | "Usado (Bom)" | "Com Grifos" | "Danificado";

const FALLBACK_IMAGE_URI = "https://via.placeholder.com/600x900.png?text=Livro";

function mapConditionLabel(condition?: UserBookCondition | string): Condition {
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

function formatPriceParts(value: number): {
  priceWhole: string;
  priceCents: string;
} {
  const safeValue = Number.isFinite(value) ? value : 0;
  const [priceWhole, priceCents] = safeValue.toFixed(2).split(".") as [
    string,
    string,
  ];
  return { priceWhole, priceCents };
}

function mergeUserBooks(publicBooks: UserBook[], myBooks: UserBook[]) {
  const merged = new Map<string, UserBook>();

  for (const userBook of publicBooks) {
    merged.set(userBook.id, userBook);
  }

  for (const userBook of myBooks) {
    merged.set(userBook.id, userBook);
  }

  return Array.from(merged.values());
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

function getSearchTerms(book: OpenLibraryBook): {
  key: string | null;
  isbnTerm: string | null;
  titleTerm: string | null;
} {
  const normalizedIsbn = openLibraryService.normalizeIsbn(book.isbn ?? "");
  const isbnTerm = normalizedIsbn.length === 13 ? normalizedIsbn : null;
  const title = book.title?.trim();
  const titleTerm = title ? title : null;
  const key = isbnTerm
    ? `isbn:${isbnTerm}`
    : titleTerm
      ? `title:${titleTerm.toLowerCase()}`
      : null;

  return { key, isbnTerm, titleTerm };
}

function getCountKey(book: OpenLibraryBook): string | null {
  return getSearchTerms(book).key;
}

export default function SearchScreen() {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<OpenLibraryBook[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [announcementCounts, setAnnouncementCounts] = useState<
    Record<string, number>
  >({});
  const [countError, setCountError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<OpenLibraryBook | null>(
    null,
  );
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<
    UserBook[]
  >([]);
  const [isAnnouncementsVisible, setIsAnnouncementsVisible] = useState(false);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(
    null,
  );
  const [myAnnouncements, setMyAnnouncements] = useState<UserBook[]>([]);
  const [myAnnouncementsError, setMyAnnouncementsError] = useState<string | null>(
    null,
  );
  const filterOptions = [
    { key: "offers", label: "Ofertas", icon: <Sign /> },
    { key: "filters", label: "Filtros", icon: <Config /> },
    { key: "sort", label: "Ordenar", icon: <Order /> },
  ];

  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (!trimmed) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      async function runSearch() {
        setIsSearching(true);
        setSearchError(null);

        try {
          const results = await openLibraryService.searchBooksByQuery(
            trimmed,
            6,
          );

          if (!cancelled) {
            setSearchResults(results);
          }
        } catch (error) {
          if (!cancelled) {
            setSearchError("Nao foi possivel buscar livros.");
          }
        } finally {
          if (!cancelled) {
            setIsSearching(false);
          }
        }
      }

      runSearch();
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    async function loadMyAnnouncements() {
      setMyAnnouncementsError(null);

      if (!isAuthenticated) {
        if (!cancelled) {
          setMyAnnouncements([]);
        }
        return;
      }

      try {
        const limit = 50;
        let page = 1;
        let totalPages = 1;
        const all: UserBook[] = [];

        while (page <= totalPages) {
          const response = await listMyUserBooksWithMeta({ page, limit });
          all.push(...response.data);

          totalPages = response.meta?.totalPages ?? 1;
          page += 1;
        }

        if (!cancelled) {
          setMyAnnouncements(all);
        }
      } catch {
        if (!cancelled) {
          setMyAnnouncementsError("Nao foi possivel carregar seus anuncios.");
          setMyAnnouncements([]);
        }
      }
    }

    loadMyAnnouncements();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const myCounts = useMemo(() => {
    const isbnCounts = new Map<string, number>();
    const titleCounts = new Map<string, number>();

    for (const userBook of myAnnouncements) {
      const isbn = openLibraryService.normalizeIsbn(
        userBook.CatalogBook?.isbn ?? "",
      );
      if (isbn.length === 13) {
        isbnCounts.set(isbn, (isbnCounts.get(isbn) ?? 0) + 1);
      }

      const title = userBook.CatalogBook?.title?.trim();
      if (title) {
        const key = title.toLowerCase();
        titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
      }
    }

    return { isbnCounts, titleCounts };
  }, [myAnnouncements]);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      setCountError(null);

      if (!isAuthenticated || searchResults.length === 0) {
        if (!cancelled) {
          setAnnouncementCounts({});
        }
        return;
      }

      const termEntries = searchResults
        .map((book) => getSearchTerms(book))
        .filter((entry) => entry.key) as Array<{
        key: string;
        isbnTerm: string | null;
        titleTerm: string | null;
      }>;

      const termByKey = new Map(
        termEntries.map(({ key, isbnTerm, titleTerm }) => [
          key,
          { isbnTerm, titleTerm },
        ]),
      );
      const uniqueKeys = Array.from(termByKey.keys());

      if (uniqueKeys.length === 0) {
        if (!cancelled) {
          setAnnouncementCounts({});
        }
        return;
      }

      try {
        let hadFailures = false;

        const counts = await Promise.all(
          uniqueKeys.map(async (key) => {
            const entry = termByKey.get(key);
            if (!entry) {
              return [key, 0] as const;
            }

            const { isbnTerm, titleTerm } = entry;
            const tasks: Array<ReturnType<typeof listUserBooksWithMeta>> = [];

            if (isbnTerm) {
              tasks.push(
                listUserBooksWithMeta({
                  filter: { term: isbnTerm },
                  limit: 1,
                  page: 1,
                }),
              );
            }

            if (titleTerm) {
              tasks.push(
                listUserBooksWithMeta({
                  filter: { term: titleTerm },
                  limit: 1,
                  page: 1,
                }),
              );
            }

            const publicResults = await Promise.allSettled(tasks);
            if (publicResults.length === 0) {
              return [key, 0] as const;
            }

            const publicTotals = publicResults
              .filter(
                (
                  result,
                ): result is PromiseFulfilledResult<
                  Awaited<ReturnType<typeof listUserBooksWithMeta>>
                > => result.status === "fulfilled",
              )
              .map((result) => result.value.meta?.total ?? 0);

            if (publicTotals.length === 0) {
              hadFailures = true;
            }

            const publicTotal =
              publicTotals.length > 0 ? Math.max(...publicTotals) : 0;

            const myIsbnCount = isbnTerm
              ? myCounts.isbnCounts.get(isbnTerm) ?? 0
              : 0;
            const myTitleCount = titleTerm
              ? myCounts.titleCounts.get(titleTerm.toLowerCase()) ?? 0
              : 0;
            const myTotal = Math.max(myIsbnCount, myTitleCount);

            return [key, publicTotal + myTotal] as const;
          }),
        );

        if (!cancelled) {
          setAnnouncementCounts(Object.fromEntries(counts));
          setCountError(
            hadFailures ? "Nao foi possivel carregar os anuncios." : null,
          );
        }
      } catch (error) {
        if (!cancelled) {
          setCountError("Nao foi possivel carregar os anuncios.");
          setAnnouncementCounts({});
        }
      }
    }

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, searchResults]);

  const resultsCountLabel = useMemo(() => {
    if (!searchTerm.trim()) {
      return "Digite o nome do livro para buscar";
    }

    if (isSearching) {
      return "Buscando livros...";
    }

    return `${searchResults.length} resultados encontrados`;
  }, [isSearching, searchResults.length, searchTerm]);

  function getCountText(book: OpenLibraryBook) {
    const key = getCountKey(book);
    if (!key) {
      return "Nenhum livro anunciado";
    }

    if (!isAuthenticated) {
      return "Entre para ver anuncios";
    }

    const count = announcementCounts[key];

    if (count === undefined && countError) {
      return "Nao foi possivel carregar os anúncios";
    }

    if (count === undefined) {
      return "Carregando anúncios...";
    }

    if (count === 0) {
      return "Nenhum livro anunciado";
    }

    if (count === 1) {
      return "1 livro anunciado";
    }

    return `${count} livros anunciados`;
  }

  const selectedCards = useMemo(
    () => selectedAnnouncements.map(mapUserBookToCard),
    [selectedAnnouncements],
  );

  async function handleOpenAnnouncements(book: OpenLibraryBook) {
    setSelectedBook(book);
    setIsAnnouncementsVisible(true);
    setIsAnnouncementsLoading(true);
    setAnnouncementsError(null);
    setSelectedAnnouncements([]);

    if (!isAuthenticated) {
      setAnnouncementsError("Faca login para ver os anuncios.");
      setIsAnnouncementsLoading(false);
      return;
    }

    const { isbnTerm, titleTerm } = getSearchTerms(book);
    if (!isbnTerm && !titleTerm) {
      setAnnouncementsError("Nenhum livro cadastrado.");
      setIsAnnouncementsLoading(false);
      return;
    }

    try {
      const publicResults: UserBook[] = [];
      const publicTasks: Array<ReturnType<typeof listUserBooksWithMeta>> = [];

      if (isbnTerm) {
        publicTasks.push(
          listUserBooksWithMeta({
            filter: { term: isbnTerm },
            limit: 50,
            page: 1,
          }),
        );
      }

      if (titleTerm) {
        publicTasks.push(
          listUserBooksWithMeta({
            filter: { term: titleTerm },
            limit: 50,
            page: 1,
          }),
        );
      }

      const publicSettled = await Promise.allSettled(publicTasks);
      for (const result of publicSettled) {
        if (result.status === "fulfilled") {
          publicResults.push(...result.value.data);
        }
      }

      const myMatched = myAnnouncements.filter((userBook) => {
        const isbn = openLibraryService.normalizeIsbn(
          userBook.CatalogBook?.isbn ?? "",
        );
        const matchesIsbn = isbnTerm ? isbn === isbnTerm : false;
        const title = userBook.CatalogBook?.title?.trim().toLowerCase() ?? "";
        const matchesTitle = titleTerm
          ? title === titleTerm.toLowerCase()
          : false;
        return matchesIsbn || matchesTitle;
      });

      const merged = mergeUserBooks(publicResults, myMatched);
      setSelectedAnnouncements(merged);
    } catch (error) {
      setAnnouncementsError("Nao foi possivel carregar os anuncios.");
    } finally {
      setIsAnnouncementsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function loadUser() {
        if (!isAuthenticated) {
          return;
        }

        try {
          setUserError(null);
          const me = await userService.getMe();

          if (!cancelled) {
            setUser(me);
          }
        } catch (error) {
          if (!cancelled) {
            setUserError(
              error instanceof ApiError
                ? error.message
                : "Não foi possível carregar o perfil.",
            );
          }
        }
      }

      loadUser();

      return () => {
        cancelled = true;
      };
    }, [isAuthenticated]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <DismissKeyboardView>
        <View style={styles.dismissArea}>
          <AppTopHeader
            title="Forbook"
            userContent={
              <View style={styles.userLogo}>
                {user?.ProfileImage?.url ? (
                  <Image
                    source={{ uri: user.ProfileImage.url }}
                    style={styles.userImage}
                    contentFit="cover"
                  />
                ) : (
                  <User2 width={22} height={22} />
                )}
              </View>
            }
        notificationContent={<Notification width={24} height={24} />}
            onUserPress={() => router.push("/profile")}
          />

          <View style={styles.searchMain}>
            <View style={styles.searchContent}>
              <View style={styles.searchInputWrapper}>
                <Ionicons
                  name="search-outline"
                  size={24}
                  color="#6C63FF"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.inputSearch}
                  keyboardType="default"
                  placeholderTextColor="#6C63FF"
                  placeholder="Buscar Livros"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>
              <View>
                <TouchableOpacity activeOpacity={0.7}>
                  <QrCode />
                </TouchableOpacity>
              </View>
            </View>
            <HorizontalOptionBar
              items={filterOptions}
              scrollable={false}
              showSeparators
              containerStyle={styles.categoryContainer}
              contentContainerStyle={styles.categoryRow}
              optionStyle={styles.categoryBtn}
              labelStyle={styles.categoryText}
              separatorStyle={styles.tabSeparator}
            />
            <View style={styles.categoryWrapperH}></View>
          </View>

          <View style={styles.resultsMain}>
            <Text style={styles.textResults}>{resultsCountLabel}</Text>
            {userError ? (
              <Text style={styles.userErrorText}>{userError}</Text>
            ) : null}
            {searchError ? (
              <Text style={styles.userErrorText}>{searchError}</Text>
            ) : null}
            {countError ? (
              <Text style={styles.userErrorText}>{countError}</Text>
            ) : null}

            {isSearching ? (
              <View style={styles.searchLoadingRow}>
                <ActivityIndicator size="small" color="#6C63FF" />
              </View>
            ) : null}

            <FlatList
              data={searchResults}
              keyExtractor={(item, index) =>
                item.isbn ? `${item.isbn}-${index}` : `${item.title}-${index}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultCard}
                  activeOpacity={0.8}
                  onPress={() => handleOpenAnnouncements(item)}
                >
                  <View style={styles.resultCoverWrap}>
                    {item.coverUrl ? (
                      <Image
                        source={{ uri: item.coverUrl }}
                        style={styles.resultCover}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.resultCoverPlaceholder}>
                        <Text style={styles.resultCoverText}>Sem capa</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.author ? (
                      <Text style={styles.resultAuthor} numberOfLines={1}>
                        {item.author}
                      </Text>
                    ) : null}
                    <Text style={styles.resultCount}>
                      {getCountText(item)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.resultsList}
              ListEmptyComponent={
                searchTerm.trim() && !isSearching ? (
                  <Text style={styles.emptyText}>
                    Nenhum livro encontrado.
                  </Text>
                ) : null
              }
            />

            <Modal
              visible={isAnnouncementsVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setIsAnnouncementsVisible(false)}
            >
              <Pressable
                style={styles.announcementsBackdrop}
                onPress={() => setIsAnnouncementsVisible(false)}
              >
                <Pressable
                  style={styles.announcementsModal}
                  onPress={() => {}}
                >
                  <View style={styles.announcementsHeader}>
                    <Text
                      style={styles.announcementsTitle}
                      numberOfLines={2}
                    >
                      {selectedBook?.title ?? "Anuncios"}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsAnnouncementsVisible(false)}
                    >
                      <Ionicons name="close" size={24} color="#6c63ff" />
                    </TouchableOpacity>
                  </View>

                  {isAnnouncementsLoading ? (
                    <ActivityIndicator size="large" color="#6c63ff" />
                  ) : announcementsError ? (
                    <Text style={styles.announcementsMessage}>
                      {announcementsError}
                    </Text>
                  ) : selectedCards.length === 0 ? (
                    <Text style={styles.announcementsMessage}>
                      Nenhum livro cadastrado.
                    </Text>
                  ) : (
                    <FlatList
                      data={selectedCards}
                      keyExtractor={(item) => item.id}
                      numColumns={2}
                      columnWrapperStyle={styles.announcementsRow}
                      contentContainerStyle={styles.announcementsList}
                      renderItem={({ item }) => (
                        <BookCard
                          title={item.title}
                          priceWhole={item.priceWhole}
                          priceCents={item.priceCents}
                          imageUri={item.imageUri}
                          condition={item.condition}
                          columns={2}
                          onPress={() =>
                            (() => {
                              setIsAnnouncementsVisible(false);
                              router.push({
                                pathname: "/book-details",
                                params: {
                                  id: item.id,
                                  title: item.title,
                                  author: item.author,
                                  priceWhole: item.priceWhole,
                                  priceCents: item.priceCents,
                                  imageUri: item.imageUri,
                                  condition: item.condition,
                                },
                              });
                            })()
                          }
                        />
                      )}
                    />
                  )}
                </Pressable>
              </Pressable>
            </Modal>
          </View>
        </View>
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  dismissArea: {
    flex: 1,
  },
  categoryWrapper: {
    height: 2,
    backgroundColor: "#c4c8ce",
  },
  categoryWrapperH: {
    height: 1,
    backgroundColor: "#c4c8ce",
    marginHorizontal: 18,
  },
  searchContent: {
    paddingTop: 24,
    paddingHorizontal: 28,
    paddingBottom: 12,
    flexDirection: "row",
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 15,
    top: 12,
    zIndex: 1,
  },
  inputSearch: {
    borderWidth: 2,
    borderColor: "#6c63ff",
    borderRadius: 12,
    fontSize: 18,
    fontFamily: "montserratBold",
    paddingLeft: 46,
    paddingVertical: 10,
    textAlignVertical: "center",
    color: "#606060",
  },
  searchMain: {
    flexDirection: "column",
  },
  categoryContainer: {
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },

  tabSeparator: {
    width: 1,
    height: 18,
    backgroundColor: "#c4c8ce",
    alignSelf: "center",
  },
  categoryText: {
    fontFamily: "montserratBold",
    fontSize: 14,
    color: "#a6a8aa",
    textAlign: "center",
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 0,
  },
  resultsMain: {
    margin: 20,
    flex: 1,
  },
  textResults: {
    fontFamily: "montserratRegular",
    fontSize: 14,
    color: "#a6a8aa",
  },
  searchLoadingRow: {
    marginTop: 12,
    marginBottom: 4,
  },
  resultsList: {
    paddingTop: 12,
    paddingBottom: 120,
  },
  resultCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e8eb",
  },
  resultCoverWrap: {
    width: 72,
    height: 104,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f2f5",
  },
  resultCover: {
    width: "100%",
    height: "100%",
  },
  resultCoverPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  resultCoverText: {
    fontFamily: "montserratRegular",
    fontSize: 11,
    textAlign: "center",
    color: "#a6a8aa",
  },
  resultInfo: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  resultTitle: {
    fontFamily: "montserratBold",
    fontSize: 15,
    color: "#222",
  },
  resultAuthor: {
    fontFamily: "montserratRegular",
    fontSize: 13,
    color: "#6c6f73",
    marginTop: 4,
  },
  resultCount: {
    fontFamily: "montserratRegular",
    fontSize: 12,
    color: "#6C63FF",
    marginTop: 8,
  },
  announcementsBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  announcementsModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  announcementsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  announcementsTitle: {
    fontFamily: "montserratBold",
    fontSize: 16,
    color: "#333",
    flex: 1,
    paddingRight: 12,
  },
  announcementsMessage: {
    fontFamily: "montserratRegular",
    fontSize: 13,
    color: "#a6a8aa",
    textAlign: "center",
    marginTop: 24,
  },
  announcementsList: {
    paddingBottom: 16,
  },
  announcementsRow: {
    justifyContent: "space-between",
  },
  emptyText: {
    fontFamily: "montserratRegular",
    fontSize: 13,
    color: "#a6a8aa",
    marginTop: 12,
  },
  userErrorText: {
    fontFamily: "montserratRegular",
    fontSize: 12,
    color: "#e74c3c",
    marginTop: 6,
  },
  userLogo: {
    borderWidth: 2,
    borderColor: "#6c63ff",
    borderRadius: 20, // opcional - para arredondar as bordas
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  userImage: {
    width: "100%",
    height: "100%",
  },
});
