import Notification from "@/assets/images/Notification.svg";
import User2 from "@/assets/images/User.svg";
import AppTopHeader from "@/src/components/appTopHeader";
import BookCard from "@/src/components/bookCard";
import HorizontalOptionBar from "@/src/components/horizontalOptionBar";
import { useAuth } from "@/src/hooks/useAuth";
import { getFavorites, saveFavorites } from "@/src/lib/favorites-storage";
import { ApiError } from "@/src/services/api";
import { userService, type UserProfile } from "@/src/services/user.service";
import {
  userBookService,
  type UserBook,
  type UserBookCondition,
} from "@/src/services/userBook.service";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Condition = "Novo" | "Usado";
type Category = "ofertas" | "populares" | "interesse" | "other";

interface Book {
  id: string;
  title: string;
  author: string;
  priceWhole: string;
  priceCents: string;
  imageUri: string;
  condition: Condition;
}

const MOCK_DATA: Record<Category, Book[]> = {
  ofertas: [
    {
      id: "1",
      title: "Livro - O Hobbit",
      author: "J.R.R. Tolkien",
      priceWhole: "20",
      priceCents: "99",
      imageUri:
        "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQANbpQmZl0LzXHsfncNVg8SoH6b7bd21GO6KMeghJkXKciPYdm",
      condition: "Usado",
    },
    {
      id: "2",
      title: "Steel Ball Run. Volume 19",
      author: "Hirohiko Araki",
      priceWhole: "55",
      priceCents: "00",
      imageUri: "https://rezised-images.knhbt.cz/880x880/16606983.webp",
      condition: "Novo",
    },
    {
      id: "3",
      title: "Harry Potter e a Pedra Filosofal",
      author: "J.K. Rowling",
      priceWhole: "32",
      priceCents: "50",
      imageUri: "https://covers.openlibrary.org/b/id/10110415-L.jpg",
      condition: "Usado",
    },
    {
      id: "4",
      title: "1984 - George Orwell",
      author: "George Orwell",
      priceWhole: "18",
      priceCents: "90",
      imageUri: "https://covers.openlibrary.org/b/id/8575708-L.jpg",
      condition: "Usado",
    },
  ],
  populares: [
    {
      id: "p1",
      title: "Jojo's Bizarre Adventure Parte 7 Steel Ball Run 02",
      author: "Hirohiko Araki",
      priceWhole: "54",
      priceCents: "99",
      imageUri:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf22C1RLxd5oDi2YNn-y8owQX6JhtQbhbRVA&s",
      condition: "Novo",
    },
    {
      id: "p2",
      title: "Frieren: Beyond Journey's End volume 2",
      author: "Kanehito Yamada",
      priceWhole: "28",
      priceCents: "90",
      imageUri:
        "https://tcgcollectors.com.au/wp-content/uploads/2024/08/frieran-manga-volume-2-front.jpg",
      condition: "Usado",
    },
    {
      id: "p3",
      title: "Sapiens",
      author: "Yuval Noah Harari",
      priceWhole: "39",
      priceCents: "99",
      imageUri: "https://covers.openlibrary.org/b/id/8592068-L.jpg",
      condition: "Usado",
    },
    {
      id: "p4",
      title: "A Revolução dos Bichos",
      author: "George Orwell",
      priceWhole: "15",
      priceCents: "00",
      imageUri: "https://covers.openlibrary.org/b/id/8406786-L.jpg",
      condition: "Novo",
    },
  ],
  interesse: [
    {
      id: "i1",
      title: "Duna",
      author: "Frank Herbert",
      priceWhole: "52",
      priceCents: "00",
      imageUri: "https://covers.openlibrary.org/b/id/10975897-L.jpg",
      condition: "Novo",
    },
    {
      id: "i2",
      title: "Fundação",
      author: "Isaac Asimov",
      priceWhole: "34",
      priceCents: "50",
      imageUri: "https://covers.openlibrary.org/b/id/8228691-L.jpg",
      condition: "Usado",
    },
    {
      id: "i3",
      title: "Neuromancer",
      author: "William Gibson",
      priceWhole: "26",
      priceCents: "00",
      imageUri: "https://covers.openlibrary.org/b/id/9255566-L.jpg",
      condition: "Usado",
    },
  ],
  other: [
    {
      id: "p1",
      title: "Jojo's Bizarre Adventure Parte 7 Steel Ball Run 02",
      author: "Hirohiko Araki",
      priceWhole: "54",
      priceCents: "99",
      imageUri:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf22C1RLxd5oDi2YNn-y8owQX6JhtQbhbRVA&s",
      condition: "Novo",
    },
  ],
};

const FALLBACK_IMAGE_URI = "https://via.placeholder.com/600x900.png?text=Livro";

function mapConditionLabel(condition: UserBookCondition): Condition {
  if (condition === "NEW") {
    return "Novo";
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

function mapUserBookToCard(userBook: UserBook): Book {
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

const SECTION_TITLE: Record<Category, string> = {
  ofertas: "Melhores ofertas",
  populares: "Mais populares",
  interesse: "Para você",
  other: "Nada ainda",
};

function useBooks(category: Category, isAuthenticated: boolean) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const reload = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      try {
        setLoading(true);
        setError(null);

        if (!isAuthenticated) {
          if (!cancelled) {
            setBooks(MOCK_DATA[category]);
          }
          return;
        }

        const [publicBooks, myBooks] = await Promise.all([
          userBookService.listUserBooks(),
          userBookService.listMyUserBooks(),
        ]);

        const mergedBooks = mergeUserBooks(publicBooks, myBooks);
        const mappedBooks = mergedBooks.map(mapUserBookToCard);

        if (!cancelled) {
          setBooks(mappedBooks);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar os livros.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBooks();
    return () => {
      cancelled = true;
    };
  }, [category, isAuthenticated, refreshIndex]);

  return { books, loading, error, reload };
}

const TABS: { key: Category; label: string }[] = [
  { key: "ofertas", label: "Ofertas" },
  { key: "populares", label: "Populares" },
  { key: "interesse", label: "Baseado no seu interesse" },
  { key: "other", label: "Outros" },
];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<Category>("ofertas");
  const { isAuthenticated } = useAuth();
  const { books, loading, error, reload } = useBooks(
    activeCategory,
    isAuthenticated,
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      reload();

      let cancelled = false;

      async function loadFavs() {
        try {
          const ids = await getFavorites();
          if (!cancelled) setFavorites(new Set(ids));
        } catch {
          // ignore
        }
      }

      loadFavs();

      if (Platform.OS !== "android") {
        return () => {
          cancelled = true;
        };
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          BackHandler.exitApp();
          return true;
        },
      );

      return () => {
        cancelled = true;
        subscription.remove();
      };
    }, [reload]),
  );

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
        } catch (err) {
          if (!cancelled) {
            setUserError(
              err instanceof ApiError
                ? err.message
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

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      // persist
      (async () => {
        try {
          await saveFavorites(Array.from(next));
        } catch {
          // ignore
        }
      })();

      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
      <View style={styles.wellcomeContent}>
        <Text style={styles.wellcomeText}>
          Bem vindo,{" "}
          <Text style={{ fontFamily: "montserratBold", color: "#6c63ff" }}>
            {user?.name ? `${user.name.split(" ")[0]}!` : ""}
          </Text>
        </Text>
        {userError ? (
          <Text style={styles.userErrorText}>{userError}</Text>
        ) : null}
      </View>
      <View style={styles.categoryContainer}>
        <HorizontalOptionBar
          items={TABS}
          activeKey={activeCategory}
          onSelect={(key) => setActiveCategory(key as Category)}
          scrollable
          showSeparators
          contentContainerStyle={styles.categoryBar}
          optionStyle={styles.tabButton}
          labelStyle={styles.textCategory}
          activeLabelStyle={styles.textCategoryActive}
          separatorStyle={styles.tabSeparator}
        />
        <View style={styles.categoryWrapper}></View>
      </View>
      <Text style={styles.titleMain}>{SECTION_TITLE[activeCategory]}</Text>

      {loading ? (
        <ActivityIndicator
          color="#6c63ff"
          size="large"
          style={{ marginTop: 52 }}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : books.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum anuncio anunciado.</Text>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <BookCard
              title={item.title}
              priceWhole={item.priceWhole}
              priceCents={item.priceCents}
              imageUri={item.imageUri}
              condition={item.condition}
              columns={3}
              onPress={() =>
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
  categoryWrapper: {
    height: 1,
    backgroundColor: "#c4c8ce",
  },
  wellcomeContent: {
    paddingTop: 24,
    paddingHorizontal: 28,
    paddingBottom: 12,
  },
  wellcomeText: {
    fontFamily: "montserratRegular",
    fontSize: 22,
  },
  userErrorText: {
    fontFamily: "montserratRegular",
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 6,
  },
  categoryBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  tabSeparator: {
    width: 1,
    height: 18,
    backgroundColor: "#c4c8ce",
    alignSelf: "center",
  },

  textCategory: {
    fontFamily: "montserratBold",
    fontSize: 14,
    color: "#a6a8aa",
    textAlign: "center",
  },
  categoryContainer: {
    marginHorizontal: 20,
  },
  textCategoryActive: {
    color: "#6c63ff",
  },
  titleMain: {
    fontFamily: "lexendBlack",
    fontSize: 32,
    marginLeft: 19,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    justifyContent: "flex-start",
    paddingHorizontal: 6,
  },
  listContent: {
    paddingBottom: 32,
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
