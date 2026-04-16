import EditIcon from "@/assets/images/edit.svg";
import ScreenHeader from "@/src/components/screenHeader";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const PROFILE_CONTENT = {
  name: "Arthur Risso Pereira Rodovalho",
  memberSince: "Membro desde 08/04/2026",
  rating: "5.0 - 9 avaliações",
  birthDate: "04/01/2006",
  address: "Rua Idelfonso Belatti, 106 - Santa Filomena\nFernandópolis",
  email: "arthur.rprodovalho@gmail.com",
  phone: "(17) 98842-7342",
  password: "forbook2026",
};

interface ProfileInfoItemProps {
  label: string;
  value: string;
}

function ProfileInfoItem({ label, value }: ProfileInfoItemProps) {
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );
}

export default function Profile() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const passwordValue = isPasswordVisible
    ? PROFILE_CONTENT.password
    : "•".repeat(12);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Meu perfil" borderBottomWidth={0} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.coverCard}>
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#6662FF" />
                <Stop offset="100%" stopColor="#2F2C9B" />
              </LinearGradient>
            </Defs>

            <Rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#profileGradient)"
            />
          </Svg>
        </View>

        <View style={styles.profileSummary}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarImageContainer}>
              <Image
                source={require("../assets/images/profile.png")}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.avatarEditBadge}
              onPress={() => router.push("/edit-profile")}
            >
              <Ionicons name="pencil" size={10} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSummaryText}>
            <Text style={styles.userName}>{PROFILE_CONTENT.name}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.memberSince}>
                {PROFILE_CONTENT.memberSince}
              </Text>

              <View style={styles.ratingWrap}>
                <Ionicons name="star" size={11} color="#ff6584" />
                <Text style={styles.ratingText}>{PROFILE_CONTENT.rating}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.headerSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Informações do seu perfil</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.editButton}
              onPress={() => router.push("/edit-profile")}
            >
              <EditIcon width={18} height={18} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionDescription}>
            Você pode alterar suas informações quando quiser!
          </Text>
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.dataSectionTitle}>Dados pessoais</Text>

          <ProfileInfoItem label="Nome" value={PROFILE_CONTENT.name} />
          <ProfileInfoItem
            label="Data de Nascimento"
            value={PROFILE_CONTENT.birthDate}
          />
          <ProfileInfoItem label="Endereço" value={PROFILE_CONTENT.address} />

          <View style={styles.divider} />

          <Text style={styles.dataSectionTitle}>Dados da conta</Text>

          <ProfileInfoItem label="Email" value={PROFILE_CONTENT.email} />
          <ProfileInfoItem label="Telefone" value={PROFILE_CONTENT.phone} />

          <View style={styles.itemContainer}>
            <Text style={styles.itemLabel}>Senha</Text>

            <View style={styles.passwordRow}>
              <Text style={styles.itemValue}>{passwordValue}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={togglePasswordVisibility}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6C63FF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.changePasswordButton}
            onPress={() =>
              router.push({
                pathname: "/forgot-password-code",
                params: { email: PROFILE_CONTENT.email },
              })
            }
          >
            <Text style={styles.changePasswordText}>Alterar senha</Text>
          </TouchableOpacity>
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  coverCard: {
    marginTop: 4,
    height: 112,
    borderRadius: 15,
    overflow: "hidden",
  },
  profileSummary: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: -30,
  },
  avatarWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: "#F0F2F5",
    backgroundColor: "#d5d5d5",
    overflow: "visible",
  },
  avatarImageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 39,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarEditBadge: {
    position: "absolute",
    right: -3,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C63FF",
    borderWidth: 1.5,
    borderColor: "#F0F2F5",
  },
  profileSummaryText: {
    flex: 1,
    marginLeft: 8,
    paddingBottom: 4,
  },
  userName: {
    fontFamily: "montserratBold",
    fontSize: 17,
    color: "#000000",
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberSince: {
    flexShrink: 1,
    fontFamily: "montserratRegular",
    fontSize: 11,
    color: "#606060",
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontFamily: "montserratBold",
    fontSize: 11,
    color: "#4a4a4a",
  },
  headerSection: {
    marginTop: 18,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: "montserratBold",
    fontSize: 20,
    color: "#1f1f1f",
    lineHeight: 20,
  },
  editButton: {
    padding: 2,
  },
  sectionDescription: {
    marginTop: 4,
    fontFamily: "montserratRegular",
    fontSize: 12,
    color: "#555",
  },
  dataSection: {
    marginTop: 14,
  },
  dataSectionTitle: {
    fontFamily: "montserratBold",
    fontSize: 16,
    color: "#1f1f1f",
    marginTop: 8,
  },
  itemContainer: {
    marginTop: 8,
  },
  itemLabel: {
    fontFamily: "montserratRegular",
    fontSize: 14,
    color: "#8d8e90",
    marginBottom: 2,
  },
  itemValue: {
    fontFamily: "montserratRegular",
    fontSize: 17,
    lineHeight: 26,
    color: "#000000",
  },
  divider: {
    height: 1,
    backgroundColor: "#d4d6db",
    marginTop: 14,
    marginBottom: 6,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  changePasswordText: {
    fontFamily: "montserratBold",
    fontSize: 16,
    color: "#6C63FF",
  },
});
