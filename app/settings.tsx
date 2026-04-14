import ListItemRow from "@/src/components/listItemRow";
import ScreenHeader from "@/src/components/screenHeader";
import SectionDivider from "@/src/components/sectionDivider";
import SectionTitle from "@/src/components/sectionTitle";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  // Estados para controlar os botões
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const toggleNotifications = () =>
    setNotificationsEnabled((previousState) => !previousState);
  const toggleDarkMode = () =>
    setDarkModeEnabled((previousState) => !previousState);

  // Definindo as cores dinâmicas baseadas no estado do darkModeEnabled
  const theme = {
    background: darkModeEnabled ? "#121212" : "#fff",
    textPrimary: darkModeEnabled ? "#ffffff" : "#333333",
    textSecondary: darkModeEnabled ? "#a6a8aa" : "#a6a8aa", // Mantive o cinza para subtítulos
    headerTitle: darkModeEnabled ? "#ffffff" : "#000000",
    divider: darkModeEnabled ? "#333333" : "#e0e0e0",
    iconColor: "#6C63FF", // Cor roxa principal do seu app
    chevron: darkModeEnabled ? "#666666" : "#a6a8aa",
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScreenHeader
        title="Configurações"
        iconColor={theme.headerTitle}
        titleColor={theme.headerTitle}
        borderBottomColor={theme.divider}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SectionTitle
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          Conta
        </SectionTitle>

        <ListItemRow
          label="EU NAO SEI"
          iconName="person-outline"
          iconColor={theme.iconColor}
          style={styles.settingItem}
          labelStyle={[styles.settingItemText, { color: theme.textPrimary }]}
          trailing={
            <Ionicons name="chevron-forward" size={20} color={theme.chevron} />
          }
        />

        <ListItemRow
          label="O QUE COLOCAR AQUI HAHAHA"
          iconName="lock-closed-outline"
          iconColor={theme.iconColor}
          style={styles.settingItem}
          labelStyle={[styles.settingItemText, { color: theme.textPrimary }]}
          trailing={
            <Ionicons name="chevron-forward" size={20} color={theme.chevron} />
          }
        />

        <SectionDivider
          style={[styles.divider, { backgroundColor: theme.divider }]}
        />

        <SectionTitle
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          Preferências
        </SectionTitle>

        <ListItemRow
          label="Notificações Push"
          iconName="notifications-outline"
          iconColor={theme.iconColor}
          style={styles.settingItem}
          labelStyle={[styles.settingItemText, { color: theme.textPrimary }]}
          trailing={
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#a39fff" }}
              thumbColor={notificationsEnabled ? "#6C63FF" : "#f4f3f4"}
              onValueChange={toggleNotifications}
              value={notificationsEnabled}
            />
          }
        />

        <ListItemRow
          label="Modo Escuro (desconsiderar)"
          iconName="moon-outline"
          iconColor={theme.iconColor}
          style={styles.settingItem}
          labelStyle={[styles.settingItemText, { color: theme.textPrimary }]}
          trailing={
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#a39fff" }}
              thumbColor={darkModeEnabled ? "#6C63FF" : "#f4f3f4"}
              onValueChange={toggleDarkMode}
              value={darkModeEnabled}
            />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: "lexendBold",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  settingItem: {
    marginBottom: 0,
  },
  settingItemText: {
    fontFamily: "montserratBold",
    fontSize: 16,
    paddingTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
});
