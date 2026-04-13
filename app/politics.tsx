import ScreenHeader from "@/src/components/screenHeader";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Politics() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Políticas de Privacidade" />
      <Text>politics</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
});
