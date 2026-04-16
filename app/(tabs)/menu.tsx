import ListItemRow from "@/src/components/listItemRow";
import SectionDivider from "@/src/components/sectionDivider";
import SectionTitle from "@/src/components/sectionTitle";
import { useRouter } from "expo-router"; // Importação adicionada
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenuScreen() {
  const router = useRouter(); // Inicialização do router

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Image
                  source={require("../../assets/images/profile.png")}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>Arthur Risos</Text>
                <TouchableOpacity onPress={() => router.push("/profile")}>
                  <Text style={styles.userLocation}>Meu perfil {" >"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <SectionDivider style={styles.divider} />

        <View style={styles.section}>
          <SectionTitle style={styles.sectionSubtitle}>
            Minhas atividades
          </SectionTitle>

          <ListItemRow
            label="Meus anúncios"
            iconName="storefront-outline"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/myannounces")}
          />

          <ListItemRow
            label="Minhas compras"
            iconName="bag-outline"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/mypurchases")}
          />

          <ListItemRow
            label="Notificações"
            iconName="notifications-outline"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/notifications")}
          />

          <ListItemRow
            label="Livros favoritos"
            iconName="heart-outline"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/favorites")}
          />

          <ListItemRow
            label="Minhas avaliações"
            iconName="star-outline"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/myratings")}
          />

          <ListItemRow
            label="Histórico de visualizações"
            iconName="time-outline"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/viewhistory")}
          />

          <ListItemRow
            label="Configurações"
            iconName="settings-outline"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/settings")}
          />
        </View>

        <SectionDivider style={styles.divider} />

        <View style={styles.section}>
          <ListItemRow
            label="Termos e condições"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/terms")}
          />

          <ListItemRow
            label="Políticas de privacidade"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/politics")}
          />

          <ListItemRow
            label="Ajuda"
            style={styles.menuItem}
            labelStyle={styles.menuItemText}
            onPress={() => router.push("/help")}
          />
        </View>

        <SectionDivider style={styles.divider} />

        <View style={styles.sectionFinal}>
          <ListItemRow
            label="Sair"
            style={styles.menuItem}
            labelStyle={styles.menuItemTextLogout}
          />

          <ListItemRow
            label="Excluir Conta"
            style={styles.menuItem}
            labelStyle={styles.menuItemTextLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  headerWrapper: {
    backgroundColor: "#F0F2F5",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 16,
    paddingTop: 16,
  },
  headerShadow: {
    height: 2,
    backgroundColor: "#0000007a",
    opacity: 0.25,
  },
  title: {
    fontFamily: "lexendBlack",
    fontSize: 26,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    marginTop: 18,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: "lexendBold",
    fontSize: 24,
    marginBottom: 16,
    color: "#000",
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#a6a8aa",
  },
  profileCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "lexendBold",
    fontSize: 20,
    color: "#f0f2f5",
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: "lexendBold",
    fontSize: 18,
    color: "#1a1a1a",
    lineHeight: 22,
  },
  userLocation: {
    fontFamily: "montserratBold",
    fontSize: 14,
    color: "#777777",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  settingsIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  menuItem: {
    paddingVertical: 12,
    marginBottom: 0,
  },
  menuItemText: {
    fontFamily: "montserratBold",
    fontSize: 15,
    color: "#333",
    flex: 1,
    paddingTop: 4,
  },
  menuItemTextLogout: {
    fontFamily: "montserratBold",
    fontSize: 15,
    color: "#FF6B9D",
    flex: 1,
    paddingTop: 4,
  },
  sectionFinal: {
    marginBottom: 26,
  },
});
