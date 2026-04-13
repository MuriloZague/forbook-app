import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={styles.headerContainer}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>
          Meu perfil
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <Text>Meu perfil</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5'
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
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
