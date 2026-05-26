import ScreenHeader from "@/src/components/screenHeader";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyRatings() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Minhas Avaliações" />
      <Text style={{margin: 'auto'}}>Ainda não possui nenhuma avaliação</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
});
