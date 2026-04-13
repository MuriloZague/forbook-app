import ScreenHeader from "@/src/components/screenHeader";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Help() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Ajuda" />
      <Text>help</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
});
