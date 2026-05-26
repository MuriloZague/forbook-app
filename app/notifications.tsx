import ScreenHeader from "@/src/components/screenHeader";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyNotifications() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Notificações" />
      <Text style={{margin: 'auto'}}>Ainda não possui nenhuma notificação</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
});
