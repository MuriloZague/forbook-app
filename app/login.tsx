import { extractErrors } from "@/src/lib/zod-errors";
import { loginBodySchema } from "@/src/schemas/auth.schema";
import { ApiError } from "@/src/services/api";
import { authService } from "@/src/services/auth.service";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
      Alert.alert(
        "Código enviado",
        "Verifique seu e-mail e insira o código de confirmação.",
        undefined,
        { cancelable: false },
      );
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
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Preencha com seu Email"
              placeholderTextColor="#A6A8AA"
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearFieldError("email");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              placeholder="Preencha com sua Senha"
              placeholderTextColor="#A6A8AA"
              style={[styles.input, errors.password && styles.inputError]}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearFieldError("password");
              }}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.highlightedTextForm}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.btnContainer}>
          {!!submitError && (
            <View style={styles.submitErrorOverlay} pointerEvents="none">
              <Text style={styles.submitErrorText}>{submitError}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.7}
            onPress={validateAndSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.btnText}>ENTRAR</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 22,
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
    gap: 26,
  },
  inputContainer: {
    position: "relative",
  },
  label: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 4,
    fontSize: 14,
    zIndex: 1,
    fontFamily: "montserratBold",
  },
  input: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: "#000",
    fontFamily: "montserratRegular",
    backgroundColor: "transparent",
  },
  inputError: {
    borderColor: "#ff6584",
  },
  errorText: {
    color: "#ff6584",
    fontSize: 10,
    fontFamily: "montserratBold",
    marginTop: 2,
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
  submitErrorOverlay: {
    position: "absolute",
    bottom: "100%",
    marginBottom: 6,
    width: "100%",
    alignItems: "center",
  },
  submitErrorText: {
    color: "#ff6584",
    fontSize: 13,
    fontFamily: "montserratBold",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  btn: {
    backgroundColor: "#6C63FF",
    width: "65%",
    borderRadius: 12,
    paddingVertical: 14,
  },
  btnText: {
    fontFamily: "montserratBold",
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
});
