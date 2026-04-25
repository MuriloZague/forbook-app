import { Image } from "expo-image";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Condition = "Usado" | "Novo";

interface BookCardProps {
  title: string;
  priceWhole: string;
  priceCents: string;
  imageUri: string;
  condition?: Condition;
  onPress?: () => void;
}

export default function BookCard({
  title,
  priceWhole,
  priceCents,
  imageUri,
  condition = "Usado",
  onPress,
}: BookCardProps) {

  return (
    <TouchableOpacity
      style={styles.card2}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.card}>
        <View style={styles.accentBar} />

        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
          {/**
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={handleFavoritePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorited ? "heart" : "heart-outline"}
              size={16}
              color={isFavorited ? "#ff3d6b" : "#ff6b8a"}
            />
          </TouchableOpacity>
          */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{condition}</Text>
          </View>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.currency}>R$</Text>
          <Text style={styles.priceWhole}>{priceWhole}</Text>
          <Text style={styles.priceCents}>{priceCents}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = Dimensions.get("window").width / 2.85 - 28; // 2 colunas + margem (parece gambiarra mais gambiarra sao os amigos que fazemos pelo caminho) (2 - 28 para 2 colunas)

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 10,
    backgroundColor: "#F0F2F5",
    overflow: "hidden",
    // sombra iOS
    //shadowColor: "#000",
    //shadowOffset: { width: 0, height: 3 },
    //shadowOpacity: 0.1,
    //shadowRadius: 8,
    // sombra Android
    //elevation: 4,
  },

  card2: {
    width: CARD_WIDTH,
    backgroundColor: "#F0F2F5",
    overflow: "hidden",
    margin: 8,
  },

  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#6c63ff",
    zIndex: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: 0.78,
    backgroundColor: "#F0F2F5",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  favoriteBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 24,
    height: 24,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(220,220,220,0.90)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "montserratBold",
    color: "#818181",
  },

  info: {
    paddingTop: 6,
    paddingBottom: 10,
  },
  titleText: {
    fontFamily: "montserratRegular",
    fontSize: 13,
    color: "#000000",
    marginBottom: 6,
    height: 16,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currency: {
    fontFamily: "montserratRegular",
    fontSize: 18,
    color: "#1a1a1a",
    marginBottom: 1,
    marginRight: 2,
  },
  priceWhole: {
    fontFamily: "montserratRegular",
    fontSize: 20,
    color: "#1a1a1a",
    marginBottom: 1,
  },
  priceCents: {
    fontFamily: "montserratRegular",
    fontSize: 12,
    color: "#1a1a1a",
    marginBottom: 10,
  },
});
