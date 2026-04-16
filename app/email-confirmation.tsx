import EmailConfirmationIllustration from "@/assets/images/img-confirmarEmail.svg";
import PrimaryButton from "@/src/components/primaryButton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const maskEmail = (value: string): string => {
  const email = value.trim();

  if (!email || !email.includes("@")) {
    return email;
  }

  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visiblePrefix = localPart.slice(0, 3);
  const hiddenCount = Math.max(6, localPart.length - visiblePrefix.length);

  return `${visiblePrefix}${"*".repeat(hiddenCount)}@${domain}`;
};

export default function EmailConfirmationScreen() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();

  const email = useMemo(
    () =>
      Array.isArray(emailParam) ? (emailParam[0] ?? "") : (emailParam ?? ""),
    [emailParam],
  );

  const maskedEmail = useMemo(() => {
    if (!email) {
      return "seu email cadastrado";
    }

    return maskEmail(email);
  }, [email]);

  const handleBackPress = () => {
    router.replace("/login");
  };

  const handleVerifyPress = () => undefined;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#15171C" />
        </TouchableOpacity>

        <View style={styles.imageBlock}>
          <EmailConfirmationIllustration width={325} height={238} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.bigTitle}>Confirme{"\n"}seu Email</Text>

          <Text style={styles.description}>
            Enviamos um{" "}
            <Text style={styles.highlightText}>link de confirmação</Text> para o
            {"\n"}
            email <Text style={styles.highlightText}>{maskedEmail}!</Text>
            {"\n"}
            Verifique sua caixa de email.
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.helperTextBlock}>
          <Text style={styles.helperText}>
            Você já efetuou a verificação do seu email?
          </Text>
          <Text style={styles.helperHighlight}>Clique no botão abaixo:</Text>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            onPress={handleVerifyPress}
            label="Verificar"
            style={styles.verifyButton}
            textStyle={styles.verifyButtonText}
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
    paddingHorizontal: 14,
  },
  content: {
    flex: 1,
    paddingTop: 6,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
  },
  imageBlock: {
    marginTop: 24,
    alignItems: "center",
  },
  textBlock: {
    marginTop: 18,
    gap: 14,
  },
  bigTitle: {
    fontFamily: "lexendBlack",
    fontSize: 60,
    lineHeight: 57,
    color: "#15171C",
    includeFontPadding: false,
    textAlign: "center",
  },
  description: {
    fontFamily: "montserratRegular",
    color: "#202226",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
  },
  highlightText: {
    color: "#6C63FF",
    fontFamily: "montserratBold",
  },
  separator: {
    marginTop: 30,
    height: 1,
    width: "100%",
    backgroundColor: "#D3D7DE",
  },
  helperTextBlock: {
    marginTop: 14,
    alignItems: "center",
    gap: 1,
  },
  helperText: {
    fontFamily: "montserratRegular",
    color: "#202226",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  helperHighlight: {
    fontFamily: "montserratBold",
    color: "#6C63FF",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 38,
    alignItems: "center",
    position: "relative",
  },
  verifyButton: {
    width: "84%",
    paddingVertical: 14,
  },
  verifyButtonText: {
    fontFamily: "montserratBold",
    fontSize: 20,
  },
});
