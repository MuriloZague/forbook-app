import Notification from "@/assets/images/Notification.svg";
import User2 from "@/assets/images/User.svg";
import AppTopHeader from "@/src/components/appTopHeader";
import BookCard from "@/src/components/bookCard";
import HorizontalOptionBar from "@/src/components/horizontalOptionBar";
import { useFocusEffect } from "@react-navigation/native";
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

type Condition = "Usado" | "Novo";
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

const SECTION_TITLE: Record<Category, string> = {
  ofertas: "Melhores ofertas",
  populares: "Mais populares",
  interesse: "Para você",
  other: "Nada ainda",
};

function useBooks(category: Category) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadBooks() {
      try {
        setLoading(true);
        setBooks([]);
        await new Promise((res) => setTimeout(res, 600));
        if (!cancelled) setBooks(MOCK_DATA[category]);
      } catch {
        if (!cancelled) setError("Não foi possível carregar os livros.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadBooks();
    return () => {
      cancelled = true;
    };
  }, [category]);

  return { books, loading, error };
}

const TABS: { key: Category; label: string }[] = [
  { key: "ofertas", label: "Ofertas" },
  { key: "populares", label: "Populares" },
  { key: "interesse", label: "Baseado no seu interesse" },
  { key: "other", label: "Outros" },
];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<Category>("ofertas");
  const { books, loading, error } = useBooks(activeCategory);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") {
        return undefined;
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          BackHandler.exitApp();
          return true;
        },
      );

      return () => {
        subscription.remove();
      };
    }, []),
  );

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppTopHeader
        title="Forbook"
        userContent={
          <View style={styles.userLogo}>
            <User2 width={22} height={22} />
          </View>
        }
        notificationContent={<Notification width={24} height={24} />}
        onUserPress={() => router.push("/profile")}
      />
      <View style={styles.wellcomeContent}>
        <Text style={styles.wellcomeText}>
          Bem vindo,{" "}
          <Text style={{ fontFamily: "montserratBold", color: "#6c63ff" }}>
            Arthur!
          </Text>
        </Text>
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
              isFavorited={favorites.has(item.id)}
              onFavoritePress={() => toggleFavorite(item.id)}
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
});
