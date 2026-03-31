import Notification from "@/assets/images/Notification.svg";
import User from "@/assets/images/Perfil.svg";
import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenuScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>

          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AR</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>Arthur Risos</Text>
                <Text style={styles.userLocation}>Meu perfil {" >"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>Minhas atividades</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="bag-outline" size={24} color="#6C63FF" />
            <Text style={styles.menuItemText}>Minhas compras</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#6C63FF" />
            <Text style={styles.menuItemText}>Notificações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="heart-outline" size={24} color="#6C63FF" />
            <Text style={styles.menuItemText}>Livros favoritos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="star-outline" size={24} color="#6C63FF" />
            <Text style={styles.menuItemText}>Minhas avaliações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="time-outline" size={24} color="#6C63FF" />
            <Text style={styles.menuItemText}>Histórico de visualizações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#6C63FF" />
            <Text style={styles.menuItemText}>Configurações</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
        
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Termos e condições</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Políticas de privacidade</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Ajuda</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionFinal}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemTextLogout}>Sair</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemTextLogout}>Excluir Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "lexendBold",
    fontSize: 24,
    marginBottom: 16,
    color: "#000",
    textAlign: 'center'
  },
  sectionSubtitle: {
    fontFamily: "lexendRegular",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuItemText: {
    fontFamily: "montserratBold",
    fontSize: 15,
    color: "#333",
    flex: 1,
    paddingTop: 4
  },
  menuItemTextLogout: {
    fontFamily: "montserratBold",
    fontSize: 15,
    color: "#FF6B9D",
    flex: 1,
    paddingTop: 4
  },
  sectionFinal: {
    marginBottom: 26,
  }
});
