import OtpInput from "@/src/components/otpInput";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import SubmitErrorBanner from "@/src/components/submitErrorBanner";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const verificationCodeSchema = z
  .string("Codigo invalido")
  .length(6, "Codigo deve ter 6 caracteres")
  .regex(/^[a-zA-Z0-9]{6}$/, "Codigo deve ser alfanumerico");

const maskEmail = (email: string) => {
  const [localPart, domainPart] = email.split("@");

  if (!localPart || !domainPart) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? ""}***@${domainPart}`;
  }

  const start = localPart.slice(0, 3);
  const end = localPart.slice(-2);
  return `${start}***${end}@${domainPart}`;
};

export default function ForgotPasswordCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();

  const rawEmail = Array.isArray(params.email)
    ? (params.email[0] ?? "")
    : (params.email ?? "");

  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const maskedEmail = useMemo(() => {
    if (!rawEmail) return "seu e-mail";
    return maskEmail(rawEmail);
  }, [rawEmail]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const intervalId = setInterval(() => {
      setSecondsLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (rawEmail) {
      router.replace({
        pathname: "/forgot-password-email",
        params: { email: rawEmail },
      });
      return;
    }

    router.replace("/forgot-password-email");
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;

    setSecondsLeft(60);
    setSubmitError("");
  };

  const handleVerifyCode = () => {
    setSubmitError("");

    const normalizedCode = code.trim();
    const result = verificationCodeSchema.safeParse(normalizedCode);

    if (!result.success) {
      setSubmitError("Informe um codigo alfanumerico de 6 caracteres.");
      return;
    }

    setLoading(true);

    router.replace({
      pathname: "/forgot-password-password",
      params: {
        email: rawEmail,
        code: result.data,
      },
    });

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.dismissArea}>
          <ScreenHeader
            title="Verificar Codigo"
            onBackPress={handleBack}
            borderBottomWidth={0}
            titleFontFamily="montserratRegular"
            titleFontSize={20}
            containerStyle={styles.header}
          />

          <View style={styles.content}>
            <View style={styles.titleBlock}>
              <Text style={styles.bigTitle}>Código{"\n"}Enviado!</Text>
              <Text style={styles.description}>
                Codigo enviado para{" "}
                <Text style={styles.maskEmail}>{maskedEmail}</Text>!
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

            <View style={styles.resendContainer}>
              {secondsLeft > 0 ? (
                <Text style={styles.resendText}>
                  Reenviar codigo em{" "}
                  <Text style={styles.resendCountdown}>{secondsLeft}s</Text>
                </Text>
              ) : (
                <TouchableOpacity activeOpacity={0.7} onPress={handleResend}>
                  <Text style={styles.resendActionText}>Reenviar codigo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <SubmitErrorBanner message={submitError} />

              <PrimaryButton
                onPress={handleVerifyCode}
                label="Verificar"
                loading={loading}
                style={styles.primaryButton}
                textStyle={styles.buttonText}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    fontSize: 60,
    lineHeight: 56,
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
  maskEmail: {
    color: "#6C63FF",
  },
  otpBlock: {
    marginTop: 30,
    alignItems: "center",
  },
  resendContainer: {
    marginTop: 26,
    alignItems: "center",
  },
  resendText: {
    fontFamily: "montserratRegular",
    fontSize: 16,
    color: "#202226",
  },
  resendCountdown: {
    color: "#6C63FF",
    fontFamily: "montserratRegular",
  },
  resendActionText: {
    color: "#6C63FF",
    fontFamily: "montserratBold",
    fontSize: 16,
    textDecorationLine: "underline",
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
