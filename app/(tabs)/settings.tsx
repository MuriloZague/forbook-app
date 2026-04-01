import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  
  // Estados para controlar os botões
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const toggleNotifications = () => setNotificationsEnabled(previousState => !previousState);
  const toggleDarkMode = () => setDarkModeEnabled(previousState => !previousState);

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Cabeçalho */}
      <View style={[styles.headerContainer, { borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.headerTitle} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.headerTitle }]}>Configurações</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Seção: Conta */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Conta</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="person-outline" size={24} color={theme.iconColor} />
            <Text style={[styles.settingItemText, { color: theme.textPrimary }]}>Editar Perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.chevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="lock-closed-outline" size={24} color={theme.iconColor} />
            <Text style={[styles.settingItemText, { color: theme.textPrimary }]}>Alterar Senha</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.chevron} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Seção: Preferências */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preferências</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="notifications-outline" size={24} color={theme.iconColor} />
            <Text style={[styles.settingItemText, { color: theme.textPrimary }]}>Notificações Push</Text>
          </View>
          <Switch
            trackColor={{ false: "#e0e0e0", true: "#a39fff" }}
            thumbColor={notificationsEnabled ? "#6C63FF" : "#f4f3f4"}
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="moon-outline" size={24} color={theme.iconColor} />
            <Text style={[styles.settingItemText, { color: theme.textPrimary }]}>Modo Escuro</Text>
          </View>
          <Switch
            trackColor={{ false: "#e0e0e0", true: "#a39fff" }}
            thumbColor={darkModeEnabled ? "#6C63FF" : "#f4f3f4"}
            onValueChange={toggleDarkMode}
            value={darkModeEnabled}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontFamily: "lexendBold",
    fontSize: 20,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    marginBottom: 8,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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