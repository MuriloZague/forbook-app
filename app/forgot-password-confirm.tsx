import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import SubmitErrorBanner from "@/src/components/submitErrorBanner";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const emailSchema = z.object({
  email: z.email("Email invalido"),
});

export default function ForgotPasswordConfirm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: string) => {
    if (submitError) setSubmitError("");
    if (errors[field]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[field];
        return next;
      });
    }
  };

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
            loading={loading}
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
  header: {
    paddingHorizontal: 0,
    paddingBottom: 2,
  },
  topArea: {
    paddingTop: 8,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 4,
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
  highlightText: {
    color: "#6C63FF",
    fontFamily: "montserratRegular",
  },
  formBlock: {
    marginTop: 44,
  },
  inputLabel: {
    color: "#222",
  },
  inputText: {
    color: "#222",
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
