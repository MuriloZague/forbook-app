import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import SubmitErrorBanner from "@/src/components/submitErrorBanner";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();

  const emailParam = Array.isArray(params.email)
    ? (params.email[0] ?? "")
    : (params.email ?? "");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasMinLength = useMemo(() => password.length >= 8, [password]);
  const hasUppercase = useMemo(() => /[A-Z]/.test(password), [password]);
  const hasLowercase = useMemo(() => /[a-z]/.test(password), [password]);

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

    if (emailParam) {
      router.replace({
        pathname: "/forgot-password-code",
        params: { email: emailParam },
      });
      return;
    }

    router.replace("/forgot-password-code");
  };

  const handleSubmit = () => {
    setSubmitError("");

    const nextErrors: Record<string, string> = {};

    if (!password) {
      nextErrors.password = "Informe uma senha";
    } else {
      if (!hasMinLength) {
        nextErrors.password = "Senha deve ter ao menos 8 caracteres";
      } else if (!hasUppercase || !hasLowercase) {
        nextErrors.password =
          "Use ao menos uma letra maiuscula e uma minuscula";
      }
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirme sua senha";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "As senhas nao conferem";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError("Verifique os dados e tente novamente.");
      return;
    }

    setErrors({});
    setLoading(true);

    router.replace("/login");

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Criar nova Senha"
        onBackPress={handleBack}
        borderBottomWidth={0}
        titleFontFamily="montserratRegular"
        titleFontSize={20}
        containerStyle={styles.header}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleBlock}>
            <Text style={styles.bigTitle}>Crie uma{"\n"}nova senha</Text>
            <Text style={styles.subtitle}>
              * Sua nova senha deve ser diferente da atual.
            </Text>
          </View>

          <View style={styles.formBlock}>
            <FloatingLabelInput
              label="Nova senha"
              placeholder="Preencha com sua senha"
              placeholderTextColor="#6C63FF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError("password");
              }}
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputText}
            />

            <FloatingLabelInput
              label="Confirmar senha"
              placeholder="Confirme sua senha"
              placeholderTextColor="#6C63FF"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearFieldError("confirmPassword");
              }}
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirmPassword}
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputText}
            />
          </View>

          <View style={styles.rulesBlock}>
            <Text
              style={[styles.ruleText, hasMinLength && styles.ruleTextValid]}
            >
              x 8 ou mais caracteres
            </Text>
            <Text
              style={[styles.ruleText, hasUppercase && styles.ruleTextValid]}
            >
              x Uma letra maiuscula
            </Text>
            <Text
              style={[styles.ruleText, hasLowercase && styles.ruleTextValid]}
            >
              x Uma letra minuscula
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <SubmitErrorBanner message={submitError} />

            <PrimaryButton
              onPress={handleSubmit}
              label="Alterar"
              loading={loading}
              style={styles.primaryButton}
              textStyle={styles.buttonText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 20,
  },
  header: {
    paddingHorizontal: 0,
    paddingBottom: 2,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 24,
    paddingBottom: 24,
  },
  titleBlock: {
    gap: 10,
  },
  bigTitle: {
    fontFamily: "lexendBlack",
    fontSize: 60,
    lineHeight: 58,
    color: "#15171C",
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: "montserratRegular",
    color: "#6C63FF",
    fontSize: 16,
    lineHeight: 22,
  },
  formBlock: {
    marginTop: 40,
    gap: 24,
  },
  inputLabel: {
    color: "#222",
  },
  inputText: {
    color: "#222",
  },
  rulesBlock: {
    marginTop: 18,
    gap: 4,
    paddingHorizontal: 6,
  },
  ruleText: {
    fontFamily: "montserratRegular",
    color: "#1F2125",
    fontSize: 17,
  },
  ruleTextValid: {
    color: "#6C63FF",
    fontFamily: "montserratBold",
  },
  buttonContainer: {
    marginTop: 34,
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
