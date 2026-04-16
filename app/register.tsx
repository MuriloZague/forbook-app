import PrimaryButton from "@/src/components/primaryButton";
import RegisterStepOne from "@/src/components/registerStepOne";
import RegisterStepTwo from "@/src/components/registerStepTwo";
import StepIndicator from "@/src/components/stepIndicator";
import SubmitErrorBanner from "@/src/components/submitErrorBanner";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import {
  buildRegisterPayload,
  mapRegisterErrorsToDisplay,
  usePasswordRequirements,
  validateRegisterPayload,
  validateRegisterStepOne,
} from "@/src/hooks/useRegisterValidation";
import {
  formatCep,
  formatCpf,
  formatDate,
  formatPhone,
} from "@/src/lib/input-masks";
import { ApiError } from "@/src/services/api";

const { width } = Dimensions.get("window");
const HORIZONTAL_MARGIN = 12;
const FORM_WIDTH = width - HORIZONTAL_MARGIN * 2;

type CorreiosCepResponse = {
  erro: boolean | string;
  mensagem: string;
  total?: number;
  dados?: {
    uf: string;
    localidade: string;
    logradouroDNEC: string;
    bairro: string;
    cep: string;
  }[];
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

type CepAddressData = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export default function LoginScreen() {
  const [step, setStep] = useState(1);
  const [isStepTwoMounted, setIsStepTwoMounted] = useState(false);

  const translateX = useSharedValue(0);
  const shakeStep1 = useSharedValue(0);
  const shakeStep2 = useSharedValue(0);

  // Step 1 fields
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Step 2 fields
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const scrollViewRef = React.useRef<ScrollView>(null);
  const lastCepFetchedRef = useRef("");
  const cepRequestRef = useRef(0);
  const cepLookupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearFieldError = useCallback((field: string) => {
    setErrors((previous) => {
      if (!previous[field]) return previous;

      const next = { ...previous };
      delete next[field];
      return next;
    });
  }, []);

  const handlePasswordFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 350,
        animated: true,
      });
    }, 100);
  };

  const handleCepHelpPress = async () => {
    const url = "https://buscacepinter.correios.com.br/app/endereco/index.php";

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o navegador.");
    }
  };

  const handleCepLookup = useCallback(async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, "");
    if (digits.length !== 8) return;

    const requestId = ++cepRequestRef.current;
    setCepLoading(true);

    try {
      const lookupViaCorreios = async (): Promise<CepAddressData | null> => {
        const params = new URLSearchParams({
          cep: digits,
          capt: "1",
          inicio: "1",
          final: "50",
        });

        const response = await fetch(
          "https://buscacepinter.correios.com.br/app/cep/carrega-cep.php",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: params.toString(),
          },
        );

        const result = (await response.json()) as CorreiosCepResponse;
        const hasError = result.erro === true || result.erro === "true";
        const firstAddress = result.dados?.[0];

        if (!response.ok || hasError || !firstAddress) return null;

        return {
          street: firstAddress.logradouroDNEC ?? "",
          neighborhood: firstAddress.bairro ?? "",
          city: firstAddress.localidade ?? "",
          state: firstAddress.uf ?? "",
        };
      };

      const lookupViaViaCep = async (): Promise<CepAddressData | null> => {
        const response = await fetch(
          `https://viacep.com.br/ws/${digits}/json/`,
        );
        const result = (await response.json()) as ViaCepResponse;

        if (!response.ok || result.erro) return null;

        return {
          street: result.logradouro ?? "",
          neighborhood: result.bairro ?? "",
          city: result.localidade ?? "",
          state: result.uf ?? "",
        };
      };

      let addressData: CepAddressData | null = null;

      if (Platform.OS === "web") {
        // Correios blocks browser cross-origin requests; web uses a CORS-friendly CEP source.
        addressData = await lookupViaViaCep();
      } else {
        try {
          addressData = await lookupViaCorreios();
        } catch {
          addressData = await lookupViaViaCep();
        }
      }

      if (requestId !== cepRequestRef.current) return;

      if (!addressData) {
        setEndereco("");
        setBairro("");
        setCidade("");
        setEstado("");
        setErrors((prev) => ({
          ...prev,
          cep: "CEP não encontrado.",
        }));
        return;
      }

      setEndereco(addressData.street);
      setBairro(addressData.neighborhood);
      setCidade(addressData.city);
      setEstado(addressData.state);
      lastCepFetchedRef.current = digits;

      setErrors((prev) => {
        const next = { ...prev };
        delete next.cep;
        delete next.endereco;
        delete next.bairro;
        delete next.cidade;
        delete next.estado;
        return next;
      });
    } catch {
      if (requestId !== cepRequestRef.current) return;

      setEndereco("");
      setBairro("");
      setCidade("");
      setEstado("");
      setErrors((prev) => ({
        ...prev,
        cep: "Não foi possível consultar o CEP agora.",
      }));
    } finally {
      if (requestId === cepRequestRef.current) {
        setCepLoading(false);
      }
    }
  }, []);

  const scheduleCepLookup = useCallback(
    (formattedCep: string) => {
      if (cepLookupTimeoutRef.current) {
        clearTimeout(cepLookupTimeoutRef.current);
      }

      cepLookupTimeoutRef.current = setTimeout(() => {
        void handleCepLookup(formattedCep);
      }, 350);
    },
    [handleCepLookup],
  );

  React.useEffect(() => {
    return () => {
      if (cepLookupTimeoutRef.current) {
        clearTimeout(cepLookupTimeoutRef.current);
      }
    };
  }, []);

  const { temMinimo8Caracteres, temLetraMaiuscula, temLetraMinuscula } =
    usePasswordRequirements(senha);

  const handleNext = useCallback(() => {
    const filtered = validateRegisterStepOne(
      {
        email,
        password: senha,
        confirmPassword: confirmarSenha,
        name: nome,
        cpf,
        phoneNumber: telefone,
        birthDate: nascimento,
      },
      {
        temMinimo8Caracteres,
        temLetraMaiuscula,
        temLetraMinuscula,
      },
    );

    if (Object.keys(filtered).length > 0) {
      setErrors(filtered);
      cancelAnimation(shakeStep1);
      shakeStep1.value = withSequence(
        withTiming(0, { duration: 30 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 100 }),
        withTiming(-6, { duration: 100 }),
        withTiming(6, { duration: 100 }),
        withTiming(-4, { duration: 100 }),
        withTiming(4, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      );
      return;
    }
    setErrors({});

    const goToStepTwo = () => {
      translateX.value = withTiming(-FORM_WIDTH, { duration: 300 });
      setStep(2);
    };

    if (!isStepTwoMounted) {
      setIsStepTwoMounted(true);
      requestAnimationFrame(goToStepTwo);
      return;
    }

    goToStepTwo();
  }, [
    email,
    senha,
    nome,
    cpf,
    telefone,
    nascimento,
    confirmarSenha,
    temMinimo8Caracteres,
    temLetraMaiuscula,
    temLetraMinuscula,
    isStepTwoMounted,
    shakeStep1,
    translateX,
  ]);

  const handleConfirmar = useCallback(async () => {
    setSubmitError("");

    const payload = buildRegisterPayload(
      {
        email,
        password: senha,
        confirmPassword: confirmarSenha,
        name: nome,
        cpf,
        phoneNumber: telefone,
        birthDate: nascimento,
      },
      {
        street: endereco,
        number: numero,
        complement: complemento,
        neighborhood: bairro,
        city: cidade,
        state: estado,
        zipCode: cep,
      },
    );

    console.log("Payload:", JSON.stringify(payload, null, 2));

    const validationResult = validateRegisterPayload(payload, confirmarSenha);

    if (!validationResult.success) {
      setErrors(validationResult.errors);
      setSubmitError("Verifique os dados e tente novamente.");

      cancelAnimation(shakeStep2);
      shakeStep2.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(-4, { duration: 100 }),
        withTiming(4, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      );
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      //DESCOMENTAR PARA CRIAR USUARIO NO APP - COMENTADO APENAS PARA TESTES
      //await userService.create(validationResult.data);
      setSubmitError("");

      router.replace({
        pathname: "/email-confirmation",
        params: { email: validationResult.data.email },
      });
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
          setSubmitError(error.message || "Não foi possível criar a conta.");
        }
      } else {
        setSubmitError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    email,
    senha,
    nome,
    cpf,
    telefone,
    nascimento,
    endereco,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep,
    confirmarSenha,
    shakeStep2,
  ]);

  const handleBack = useCallback(() => {
    setErrors({});
    setSubmitError("");
    translateX.value = withTiming(0, { duration: 300 });
    setStep(1);
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shakeStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeStep1.value }],
  }));

  const shakeStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeStep2.value }],
  }));

  const handleNomeChange = useCallback(
    (value: string) => {
      setNome(value);
      clearFieldError("nome");
    },
    [clearFieldError],
  );

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      clearFieldError("email");
    },
    [clearFieldError],
  );

  const handleCpfChange = useCallback(
    (value: string) => {
      setCpf(formatCpf(value));
      clearFieldError("cpf");
    },
    [clearFieldError],
  );

  const handleTelefoneChange = useCallback(
    (value: string) => {
      setTelefone(formatPhone(value));
      clearFieldError("telefone");
    },
    [clearFieldError],
  );

  const handleNascimentoChange = useCallback(
    (value: string) => {
      setNascimento(formatDate(value));
      clearFieldError("nascimento");
    },
    [clearFieldError],
  );

  const handleSenhaChange = useCallback(
    (value: string) => {
      setSenha(value);
      clearFieldError("senha");
    },
    [clearFieldError],
  );

  const handleConfirmarSenhaChange = useCallback(
    (value: string) => {
      setConfirmarSenha(value);
      clearFieldError("confirmPassword");
    },
    [clearFieldError],
  );

  const handleCepChange = useCallback(
    (value: string) => {
      const formattedCep = formatCep(value);
      const digits = formattedCep.replace(/\D/g, "");

      setCep(formattedCep);
      clearFieldError("cep");

      if (digits.length < 8) {
        if (cepLookupTimeoutRef.current) {
          clearTimeout(cepLookupTimeoutRef.current);
        }
        lastCepFetchedRef.current = "";
        setEndereco("");
        setBairro("");
        setCidade("");
        setEstado("");
        return;
      }

      if (digits !== lastCepFetchedRef.current) {
        scheduleCepLookup(formattedCep);
      }
    },
    [clearFieldError, scheduleCepLookup],
  );

  const handleNumeroChange = useCallback(
    (value: string) => {
      setNumero(value);
      clearFieldError("numero");
    },
    [clearFieldError],
  );

  const handleComplementoChange = useCallback(
    (value: string) => {
      setComplemento(value);
      clearFieldError("complemento");
    },
    [clearFieldError],
  );

  const handleEstadoChange = useCallback(
    (value: string) => {
      setEstado(value);
      clearFieldError("estado");
    },
    [clearFieldError],
  );

  const displayErrors = useMemo(
    () => mapRegisterErrorsToDisplay(errors),
    [errors],
  );

  return (
    <SafeAreaProvider style={styles.main}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        enabled
      >
        <SafeAreaView style={styles.content}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.titleContent}>
              <Text style={styles.bigTitle}>Crie sua conta</Text>
              {step === 1 ? (
                <Text style={styles.minorTitle}>
                  Já possui uma conta?{" "}
                  <Text
                    style={styles.linkText}
                    onPress={() => router.push("/login")}
                  >
                    Entre agora!
                  </Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={() => handleBack()}>
                  <View style={styles.backButton}>
                    <Ionicons name="arrow-back" size={18} color="#6C63FF" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <StepIndicator step={step} total={2} />

            <View style={styles.sliderContainer}>
              <Animated.View style={[styles.slider, animatedStyle]}>
                <Animated.View style={[styles.shakeWrapper, shakeStyle1]}>
                  <RegisterStepOne
                    nome={nome}
                    email={email}
                    cpf={cpf}
                    telefone={telefone}
                    nascimento={nascimento}
                    senha={senha}
                    confirmarSenha={confirmarSenha}
                    errorNome={displayErrors.nome}
                    errorEmail={displayErrors.email}
                    errorCpf={displayErrors.cpf}
                    errorTelefone={displayErrors.telefone}
                    errorNascimento={displayErrors.nascimento}
                    errorSenha={displayErrors.senha}
                    errorConfirmPassword={displayErrors.confirmPassword}
                    temMinimo8Caracteres={temMinimo8Caracteres}
                    temLetraMaiuscula={temLetraMaiuscula}
                    temLetraMinuscula={temLetraMinuscula}
                    onNomeChange={handleNomeChange}
                    onEmailChange={handleEmailChange}
                    onCpfChange={handleCpfChange}
                    onTelefoneChange={handleTelefoneChange}
                    onNascimentoChange={handleNascimentoChange}
                    onSenhaChange={handleSenhaChange}
                    onConfirmarSenhaChange={handleConfirmarSenhaChange}
                    onPasswordFocus={handlePasswordFocus}
                  />
                </Animated.View>

                {isStepTwoMounted ? (
                  <Animated.View
                    style={[
                      styles.shakeWrapper,
                      step === 1 ? {} : shakeStyle2,
                      { opacity: step === 2 ? 1 : 0 },
                    ]}
                    pointerEvents={step === 2 ? "auto" : "none"}
                  >
                    <RegisterStepTwo
                      cep={cep}
                      endereco={endereco}
                      numero={numero}
                      complemento={complemento}
                      bairro={bairro}
                      cidade={cidade}
                      estado={estado}
                      cepLoading={cepLoading}
                      errorCep={displayErrors.cep}
                      errorEndereco={displayErrors.endereco}
                      errorNumero={displayErrors.numero}
                      errorBairro={displayErrors.bairro}
                      errorCidade={displayErrors.cidade}
                      errorEstado={displayErrors.estado}
                      onCepChange={handleCepChange}
                      onNumeroChange={handleNumeroChange}
                      onComplementoChange={handleComplementoChange}
                      onEstadoChange={handleEstadoChange}
                      onCepHelpPress={handleCepHelpPress}
                    />
                  </Animated.View>
                ) : (
                  <View style={styles.shakeWrapper} />
                )}
              </Animated.View>
            </View>

            <Animated.View
              style={[
                styles.btnContainer,
                step === 1 ? shakeStyle1 : shakeStyle2,
              ]}
            >
              {step === 2 ? <SubmitErrorBanner message={submitError} /> : null}

              {step === 1 ? (
                <PrimaryButton style={styles.btn} onPress={handleNext}>
                  <View style={styles.btnContent}>
                    <Text style={styles.btnText}>Continuar</Text>
                    <Ionicons name="arrow-forward" size={22} color="white" />
                  </View>
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  style={styles.btn}
                  activeOpacity={0.7}
                  onPress={handleConfirmar}
                  loading={loading}
                  label="CRIAR CONTA"
                />
              )}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    marginHorizontal: HORIZONTAL_MARGIN,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 5,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 8,
    paddingTop: 32,
  },
  sliderContainer: {
    width: FORM_WIDTH,
    overflow: "hidden",
    paddingTop: 12,
  },
  titleContent: {
    gap: 16,
    marginBottom: 24,
  },
  bigTitle: {
    fontFamily: "lexendBlack",
    fontSize: 60,
    lineHeight: 57,
  },
  minorTitle: {
    fontFamily: "montserratRegular",
    fontSize: 16,
  },
  linkText: {
    fontFamily: "montserratBold",
    color: "#6C63FF",
    textDecorationLine: "underline",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backButtonText: {
    fontFamily: "montserratBold",
    fontSize: 16,
    color: "#6C63FF",
  },
  slider: {
    flexDirection: "row",
    width: FORM_WIDTH * 2,
  },
  formPage: {
    width: FORM_WIDTH,
    gap: 16,
  },
  shakeWrapper: {
    width: FORM_WIDTH,
  },
  inputText: {
    fontSize: 14,
    fontFamily: "montserratRegular",
    color: "black",
  },
  inputError: {
    borderColor: "#ff6584",
  },
  readOnlyInput: {
    backgroundColor: "#E8EAF2",
    color: "#5B5B5B",
    borderRadius: 12,
  },
  cepLoadingIndicator: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  errorText: {
    color: "#ff6584",
    fontSize: 10,
    fontFamily: "montserratBold",
    marginTop: 1,
    marginLeft: 2,
  },
  label: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 4,
    fontSize: 14,
    zIndex: 1,
    fontFamily: "montserratBold",
  },
  btnContainer: {
    alignItems: "center",
    position: "relative",
  },
  btn: {
    width: "56%",
    paddingVertical: 12,
  },
  btnText: {
    fontFamily: "montserratBold",
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  inputTelefone: {
    flex: 2,
  },
  inputNascimento: {
    flex: 1,
  },
  cepHelpButton: {
    padding: 12,
    paddingVertical: 16,
  },
  cepHelpButtonText: {
    color: "#fff",
    fontFamily: "montserratBold",
    fontSize: 14,
    textAlign: "center",
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    height: 50,
  },
  picker: {
    height: 50,
    color: "#6C63FF",
    marginTop: -4,
  },
  requisitesText: {
    fontFamily: "montserratRegular",
    marginLeft: 8,
    color: "black",
  },
  requisiteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
