import PrimaryButton from "@/src/components/primaryButton";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordConfirm() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.imgCheck}>
          <Image
            source={require("../assets/images/checked.png")}
            style={{ width: 180, height: 180 }}
          />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.bigTitle}>Senha{"\n"}alterada!</Text>
          <Text style={styles.description}>
            Sua senha foi alterada com sucesso!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            onPress={() => router.replace("/login")}
            label="Entrar na conta"
            style={styles.primaryButton}
            textStyle={styles.buttonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 82,
    gap: 12,
  },
  titleBlock: {
    gap: 18,
  },
  bigTitle: {
    fontFamily: "lexendBlack",
    fontSize: 60,
    lineHeight: 52,
    color: "#15171C",
    includeFontPadding: false,
    textAlign: "center",
  },
  description: {
    fontFamily: "montserratRegular",
    color: "#202226",
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 38,
    alignItems: "center",
    position: "relative",
  },
  primaryButton: {
    width: "70%",
    paddingVertical: 13,
  },
  buttonText: {
    fontSize: 20,
  },
  imgCheck: {
    alignItems: "center",
  },
});
