import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import User from "@/assets/images/Perfil.svg";
import Notification from "@/assets/images/Notification.svg";
import BookCard from "@/src/components/bookCard";
import { ScrollView } from "react-native";

type Condition = "Usado" | "Novo";
type Category = "ofertas" | "populares" | "interesse" | "other";

interface Book {
  id: string;
  title: string;
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
      priceWhole: "20",
      priceCents: "99",
      imageUri:
        "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQANbpQmZl0LzXHsfncNVg8SoH6b7bd21GO6KMeghJkXKciPYdm",
      condition: "Usado",
    },
    {
      id: "2",
      title: "Steel Ball Run. Volume 19",
      priceWhole: "55",
      priceCents: "00",
      imageUri: "https://rezised-images.knhbt.cz/880x880/16606983.webp",
      condition: "Novo",
    },
    {
      id: "3",
      title: "Harry Potter e a Pedra Filosofal",
      priceWhole: "32",
      priceCents: "50",
      imageUri: "https://covers.openlibrary.org/b/id/10110415-L.jpg",
      condition: "Usado",
    },
    {
      id: "4",
      title: "1984 - George Orwell",
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
      priceWhole: "54",
      priceCents: "99",
      imageUri:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf22C1RLxd5oDi2YNn-y8owQX6JhtQbhbRVA&s",
      condition: "Novo",
    },
    {
      id: "p2",
      title: "Frieren: Beyond Journey's End volume 2",
      priceWhole: "28",
      priceCents: "90",
      imageUri:
        "https://tcgcollectors.com.au/wp-content/uploads/2024/08/frieran-manga-volume-2-front.jpg",
      condition: "Usado",
    },
    {
      id: "p3",
      title: "Sapiens",
      priceWhole: "39",
      priceCents: "99",
      imageUri: "https://covers.openlibrary.org/b/id/8592068-L.jpg",
      condition: "Usado",
    },
    {
      id: "p4",
      title: "A Revolução dos Bichos",
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
      priceWhole: "52",
      priceCents: "00",
      imageUri: "https://covers.openlibrary.org/b/id/10975897-L.jpg",
      condition: "Novo",
    },
    {
      id: "i2",
      title: "Fundação",
      priceWhole: "34",
      priceCents: "50",
      imageUri: "https://covers.openlibrary.org/b/id/8228691-L.jpg",
      condition: "Usado",
    },
    {
      id: "i3",
      title: "Neuromancer",
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
      priceWhole: "54",
      priceCents: "99",
      imageUri:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf22C1RLxd5oDi2YNn-y8owQX6JhtQbhbRVA&s",
      condition: "Novo",
    }
  ]
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

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          <TouchableOpacity>
            <User width={40} height={40} />
          </TouchableOpacity>
          <Text style={styles.title}>Forbook</Text>
          <TouchableOpacity>
            <Notification width={28} height={28} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerShadow} />
      </View>
      <View style={styles.wellcomeContent}>
        <Text style={styles.wellcomeText}>
          Bem Vindo,{" "}
          <Text style={{ fontFamily: "montserratBold", color: "#6c63ff" }}>
            $usuario!
          </Text>
        </Text>
      </View>
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryBar}
        >
          {TABS.map((tab, index) => {
            const isActive = activeCategory === tab.key;
            return (
              <View key={tab.key} style={styles.tabWrapper}>
                {index > 0 && <View style={styles.tabSeparator} />}
                <TouchableOpacity
                  onPress={() => setActiveCategory(tab.key)}
                  style={styles.tabButton}
                >
                  <Text
                    style={[
                      styles.textCategory,
                      isActive && styles.textCategoryActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
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
          numColumns={2}
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
              onPress={() => console.log("Abrir livro:", item.id)}
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
    backgroundColor: "#fff",
  },
  headerWrapper: {
    backgroundColor: "#fff",
  },
  categoryWrapper: {
    height: 2,
    backgroundColor: "#c4c8ce",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 16,
    paddingTop: 12,
  },
  headerShadow: {
    height: 2,
    backgroundColor: "#0000007a",
    opacity: 0.25,
  },
  title: {
    fontFamily: "lexendBlack",
    fontSize: 30,
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

  tabWrapper: {
    flexDirection: "row",
    alignItems: "center",
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
    paddingHorizontal: 8,
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
