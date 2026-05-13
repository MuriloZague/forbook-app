import QrCode from "@/assets/images/code.svg";
import Config from "@/assets/images/config.svg";
import Notification from "@/assets/images/Notification.svg";
import Order from "@/assets/images/order.svg";
import Sign from "@/assets/images/sign.svg";
import User2 from "@/assets/images/User.svg";
import AppTopHeader from "@/src/components/appTopHeader";
import DismissKeyboardView from "@/src/components/dismissKeyboardView";
import HorizontalOptionBar from "@/src/components/horizontalOptionBar";
import { useAuth } from "@/src/hooks/useAuth";
import { ApiError } from "@/src/services/api";
import { userService, type UserProfile } from "@/src/services/user.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const filterOptions = [
    { key: "offers", label: "Ofertas", icon: <Sign /> },
    { key: "filters", label: "Filtros", icon: <Config /> },
    { key: "sort", label: "Ordenar", icon: <Order /> },
  ];

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
            <Text style={styles.textResults}>
              $cardCount resultados encontrados
            </Text>
            {userError ? (
              <Text style={styles.userErrorText}>{userError}</Text>
            ) : null}
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
  },
  textResults: {
    fontFamily: "montserratRegular",
    fontSize: 14,
    color: "#a6a8aa",
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
