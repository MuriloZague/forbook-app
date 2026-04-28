import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import SubmitErrorBanner from "@/src/components/submitErrorBanner";
import { useAuth } from "@/src/hooks/useAuth";
import { extractErrors } from "@/src/lib/zod-errors";
import { loginBodySchema } from "@/src/schemas/auth.schema";
import { ApiError } from "@/src/services/api";
import { authService, isTokenPair } from "@/src/services/auth.service";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DismissKeyboardView from "../src/components/dismissKeyboardView";

export default function LoginScreen() {
  const { loginWithTokens } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const loginSemSenhaEmail = "teste@gmail.com";
  const loginSemSenhaPassword = "12345678";

  useEffect(() => {
    router.prefetch("/register");
    router.prefetch("/confirm-login");
  }, []);

  const clearFieldError = (field: string) => {
    if (submitError) setSubmitError("");
    if (errors[field])
      setErrors((p) => {
        const n = { ...p };
        delete n[field];
        return n;
      });
  };

  const loginSemSenha = async (loginEmail: string, loginPassword: string) => {
    if (
      loginEmail !== loginSemSenhaEmail ||
      loginPassword !== loginSemSenhaPassword
    ) {
      return false;
    }

    setSubmitError("");
    setErrors({});
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await loginWithTokens({
        accessToken: "dev-access-token",
        refreshToken: "dev-refresh-token",
      });
      router.replace("/(tabs)/home");
      return true;
    } catch {
      setSubmitError("Não foi possível fazer login.");
      return true;
    } finally {
      setLoading(false);
    }
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

    if (await loginSemSenha(result.data.email, result.data.password)) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email: result.data.email,
        password: result.data.password,
      });

      if (isTokenPair(response.data)) {
        await loginWithTokens(response.data);
        setSubmitError("");
        router.replace("/(tabs)/home");
        return;
      }

      if (response.data.isReceiveTwoFactorAuthEmail) {
        router.push({
          pathname: "/confirm-login",
          params: { email: result.data.email },
        });
        return;
      }

      setSubmitError("Nao foi possivel concluir o login.");
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

  const goToRegister = () => router.push("/register");

  return (
    <SafeAreaProvider style={styles.main}>
      <DismissKeyboardView>
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
      </DismissKeyboardView>
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
