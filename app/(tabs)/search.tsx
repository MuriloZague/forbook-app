import QrCode from "@/assets/images/code.svg";
import Notification from "@/assets/images/Notification.svg";
import User from "@/assets/images/Perfil.svg";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Sign from '@/assets/images/sign.svg';
import Config from '@/assets/images/config.svg';
import Order from '@/assets/images/order.svg'

export default function SearchScreen() {
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
            />
          </View>
          <View>
            <TouchableOpacity activeOpacity={0.7}>
              <QrCode />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.categoryContainer}>
          <TouchableOpacity style={styles.categoryBtn}>
            <Sign />
            <Text style={styles.categoryText}>Ofertas</Text>
          </TouchableOpacity>

          <View style={styles.tabSeparator}></View>

          <TouchableOpacity style={styles.categoryBtn}>
            <Config />
            <Text style={styles.categoryText}>Filtros</Text>
          </TouchableOpacity>

          <View style={styles.tabSeparator}></View>

          <TouchableOpacity style={styles.categoryBtn}>
            <Order />
            <Text style={styles.categoryText}>Ordenar</Text>
          </TouchableOpacity>
        </View>
         <View style={styles.categoryWrapperH}></View>
      </View>

      <View style={styles.resultsMain}>
        <Text style={styles.textResults}>$cardCount resultados encontrados</Text>
      </View>
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
  categoryWrapperH: {
    height: 1,
    backgroundColor: "#c4c8ce",
    marginHorizontal: 18,
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    justifyContent: "space-around",
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultsMain: {
    margin: 20,
  },
  textResults: {
    fontFamily: 'montserratRegular',
    fontSize: 14,
    color: '#a6a8aa'
  }
});
