import DismissKeyboardView from "@/src/components/dismissKeyboardView";
import OtpInput from "@/src/components/otpInput";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import SubmitErrorBanner from "@/src/components/submitErrorBanner";
import { useAuth } from "@/src/hooks/useAuth";
import { confirmLoginBodySchema } from "@/src/schemas/auth.schema";
import { ApiError } from "@/src/services/api";
import { authService } from "@/src/services/auth.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function maskEmail(email: string): string {
  const [localPart, domainPart] = email.split("@");

  if (!localPart || !domainPart) {
    return email;
  }

  const visibleStart = localPart.slice(0, 3);
  const visibleEnd = localPart.length > 5 ? localPart.slice(-2) : "";

  return `${visibleStart}${"*".repeat(4)}${visibleEnd}@${domainPart}`;
}

export default function ConfirmLoginScreen() {
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const params = useLocalSearchParams<{ email?: string | string[] }>();

  const rawEmail = Array.isArray(params.email)
    ? (params.email[0] ?? "")
    : (params.email ?? "");

  const email = rawEmail.trim();
  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const maskedEmail = useMemo(() => {
    if (!email) {
      return "seu email";
    }

    return maskEmail(email);
  }, [email]);

  const handleBack = () => {
    router.replace("/login");
  };

  const handleConfirm = async () => {
    setSubmitError("");

    const validation = confirmLoginBodySchema.safeParse({
      email,
      code: code.trim(),
    });

    if (!validation.success) {
      setSubmitError("Informe um codigo alfanumerico de 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.confirmLogin(validation.data);
      await loginWithTokens(response.data);
      router.replace("/(tabs)/home");
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message || "Nao foi possivel confirmar o login.");
      } else {
        setSubmitError("Nao foi possivel conectar ao servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DismissKeyboardView>
        <View style={styles.dismissArea}>
          <ScreenHeader
            title="Confirmar login"
            onBackPress={handleBack}
            borderBottomWidth={0}
            titleFontFamily="montserratRegular"
            titleFontSize={20}
            containerStyle={styles.header}
          />

          <View style={styles.content}>
            <View style={styles.titleBlock}>
              <Text style={styles.bigTitle}>Codigo de acesso</Text>
              <Text style={styles.description}>
                Digite o codigo enviado para{" "}
                <Text style={styles.highlightText}>{maskedEmail}</Text>.
              </Text>
            </View>

            <View style={styles.otpBlock}>
              <OtpInput
                value={code}
                onChangeValue={(value) => {
                  setCode(value);
                  if (submitError) setSubmitError("");
                }}
                autoFocus
              />
            </View>

            <View style={styles.buttonContainer}>
              <SubmitErrorBanner message={submitError} />

              <PrimaryButton
                onPress={handleConfirm}
                label="Verificar"
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
    paddingHorizontal: 20,
  },
  header: {
    paddingHorizontal: 0,
    paddingBottom: 2,
  },
  dismissArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 82,
  },
  titleBlock: {
    alignItems: "center",
    gap: 16,
  },
  bigTitle: {
    fontFamily: "lexendBlack",
    fontSize: 52,
    lineHeight: 50,
    color: "#15171C",
    textAlign: "center",
    includeFontPadding: false,
  },
  description: {
    fontFamily: "montserratRegular",
    color: "#202226",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  highlightText: {
    color: "#6C63FF",
    fontFamily: "montserratBold",
  },
  otpBlock: {
    marginTop: 30,
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 32,
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
