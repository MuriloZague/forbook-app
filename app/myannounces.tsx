import ScreenHeader from "@/src/components/screenHeader";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyAnnounces() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Meus Anúncios" />
      <Text>meus anuncios</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
});
