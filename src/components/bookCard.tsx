import { Image } from "expo-image";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";

type Condition = "Usado" | "Novo";

interface BookCardProps {
  title: string;
  priceWhole: string;
  priceCents: string;
  imageUri: string;
  condition?: Condition;
  isFavorited?: boolean;
  onFavoritePress?: () => void;
  onPress?: () => void;
}

export default function BookCard({
  title,
  priceWhole,
  priceCents,
  imageUri,
  condition = "Usado",
  isFavorited = false,
  onFavoritePress,
  onPress,
}: BookCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.accentBar} />

      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
        />

        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={onFavoritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.heartIcon, isFavorited && styles.heartFilled]}>
            {isFavorited ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{condition}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.titleText} numberOfLines={2}>
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

const CARD_WIDTH = Dimensions.get("window").width / 2.8 - 28; // 2 colunas + margem (parece gambiarra mais gambiarra sao os amigos que fazemos pelo caminho) (2 - 28 para 2 colunas)

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    // sombra iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // sombra Android
    elevation: 4,
    margin: 8,
  },

  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#6c63ff",
    zIndex: 10,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: 0.78,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  favoriteBtn: {
    position: "absolute",
    top: 10,
    left: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  heartIcon: {
    fontSize: 22,
    color: "#ff6b8a",
    lineHeight: 20,
  },
  heartFilled: {
    color: "#ff3d6b",
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
    fontSize: 14,
    fontFamily: "montserratBold",
    color: "#818181",
  },

  info: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
  titleText: {
    fontFamily: "montserratBold",
    fontSize: 13,
    color: "#2d2d2d",
    marginBottom: 6,
    height: 32
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