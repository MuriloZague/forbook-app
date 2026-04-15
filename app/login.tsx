import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import SubmitErrorBanner from "@/src/components/submitErrorBanner";
import { extractErrors } from "@/src/lib/zod-errors";
import { loginBodySchema } from "@/src/schemas/auth.schema";
import { ApiError } from "@/src/services/api";
import { authService } from "@/src/services/auth.service";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const clearFieldError = (field: string) => {
    if (submitError) setSubmitError("");
    if (errors[field])
      setErrors((p) => {
        const n = { ...p };
        delete n[field];
        return n;
      });
  };

  const validateAndSubmit = async () => {
    setSubmitError("");

    const result = loginBodySchema.safeParse({ email, password });

    if (!result.success) {
      setErrors(extractErrors(result.error));
      setSubmitError("Verifique os dados e tente novamente.");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await authService.login({ email, password: result.data.password });
      setSubmitError("");
      
      // Quando tiver tela de confirmação, descomente:
      // router.push(`/confirm-login?email=${encodeURIComponent(email)}`);
      router.push("/(tabs)/home");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422 && error.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(error.errors).map(([k, v]) => [
                k,
                v[0] ?? "Inválido",
              ]),
            ),
          );
          setSubmitError("Verifique os campos obrigatórios.");
        } else {
          setSubmitError(error.message || "Não foi possível fazer login.");
        }
      } else {
        setSubmitError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loginSemSenha = () => {
    const result = loginBodySchema.safeParse({ email, password });

    if (!result.success) {
      setErrors(extractErrors(result.error));
      setSubmitError("Verifique os dados e tente novamente.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (email === "teste@gmail.com" && password === "12345678") {
        setLoading(false);
        router.push("/(tabs)/home");
      }
      setLoading(false);
      setSubmitError("Email ou senha incorretos");
    }, 1000);
  };

  const goToRegister = () => router.push("/register");

  return (
    <SafeAreaProvider style={styles.main}>
      <View style={styles.content}>
        <View style={styles.titleContent}>
          <Text style={styles.bigTitle}>Entre em sua conta</Text>
          <Text style={styles.minorTitle}>
            Não possui uma conta?{" "}
            <Text style={styles.linkText} onPress={goToRegister}>
              Crie uma!
            </Text>
          </Text>
        </View>

        <View style={styles.formContent}>
          <FloatingLabelInput
            label="Email"
            placeholder="Preencha com seu Email"
            placeholderTextColor="#A6A8AA"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              clearFieldError("email");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <View>
            <FloatingLabelInput
              label="Senha"
              placeholder="Preencha com sua Senha"
              placeholderTextColor="#A6A8AA"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearFieldError("password");
              }}
              secureTextEntry
              error={errors.password}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/forgot-password-email")}
            >
              <Text style={styles.highlightedTextForm}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.btnContainer}>
          <SubmitErrorBanner message={submitError} />

          <PrimaryButton
            style={styles.btn}
            onPress={validateAndSubmit}
            loading={loading}
            label="ENTRAR"
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 48,
  },
  titleContent: {
    gap: 16,
  },
  bigTitle: {
    fontFamily: "lexendBlack",
    fontSize: 60,
    includeFontPadding: false,
    lineHeight: 48,
    color: "#000",
  },
  minorTitle: {
    fontFamily: "montserratRegular",
    fontSize: 16,
    color: "#333",
  },
  linkText: {
    fontFamily: "montserratBold",
    color: "#6C63FF",
    textDecorationLine: "underline",
  },
  formContent: {
    gap: 24,
  },
  highlightedTextForm: {
    fontFamily: "montserratBold",
    fontSize: 14,
    color: "#6C63FF",
    textDecorationLine: "underline",
    textAlign: "right",
    marginTop: 12,
    marginRight: 4,
  },
  btnContainer: {
    alignItems: "center",
    position: "relative",
  },
  btn: {
    width: "65%",
    paddingVertical: 14,
  },
});
