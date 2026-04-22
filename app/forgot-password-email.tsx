import DismissKeyboardView from "@/src/components/dismissKeyboardView";
import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import SubmitErrorBanner from "@/src/components/submitErrorBanner";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const emailSchema = z.object({
  email: z.email("Email invalido"),
});

export default function ForgotPasswordEmailScreen() {
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/login");
  };

  const handleContinue = () => {
    setSubmitError("");

    const result = emailSchema.safeParse({ email: email.trim() });

    if (!result.success) {
      setErrors({ email: "Email invalido" });
      setSubmitError("Informe um email valido para continuar.");
      return;
    }

    setErrors({});
    setLoading(true);

    router.push({
      pathname: "/forgot-password-code",
      params: { email: result.data.email },
    });

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DismissKeyboardView>
        <View style={styles.dismissArea}>
          <ScreenHeader
            title="Informe o E-mail"
            onBackPress={handleBack}
            borderBottomWidth={0}
            titleFontFamily="montserratRegular"
            titleFontSize={20}
            containerStyle={styles.header}
          />

          <View style={styles.content}>
            <View style={styles.titleBlock}>
              <Text style={styles.bigTitle}>Informe{"\n"}seu E-mail</Text>

              <Text style={styles.description}>
                Para{" "}
                <Text style={styles.highlightText}>redefinir sua senha</Text>,
                informe o e-mail{"\n"}cadastrado na sua conta.
              </Text>
            </View>

            <View style={styles.formBlock}>
              <FloatingLabelInput
                label="Email"
                placeholder="Preencha com seu Email"
                placeholderTextColor="#6C63FF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearFieldError("email");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputText}
              />
            </View>

            <View style={styles.buttonContainer}>
              <SubmitErrorBanner message={submitError} />

              <PrimaryButton
                onPress={handleContinue}
                label="CONTINUAR"
                loading={loading}
                style={styles.primaryButton}
                textStyle={styles.buttonText}
              />
            </View>
          </View>
        </View>
      </DismissKeyboardView>
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
  dismissArea: {
    flex: 1,
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
  },
  description: {
    fontFamily: "montserratRegular",
    color: "#202226",
    fontSize: 16,
    lineHeight: 24,
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
});
