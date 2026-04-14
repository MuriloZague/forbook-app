import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import StepIndicator from "@/src/components/stepIndicator";
import SubmitErrorBanner from "@/src/components/submitErrorBanner";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import { extractErrors } from "@/src/lib/zod-errors";
import { userCreateBodySchema } from "@/src/schemas/user.schema";
import { ApiError } from "@/src/services/api";
import { userService } from "@/src/services/user.service";

const { width } = Dimensions.get("window");
const HORIZONTAL_MARGIN = 12;
const FORM_WIDTH = width - HORIZONTAL_MARGIN * 2;

const ESTADOS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  if (digits.length > 6)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  return digits;
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) {
    return `( ${digits}`;
  }
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length > 5) {
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }
  return `(${ddd}) ${rest}`;
};

const formatDate = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

const formatCep = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
};

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

  const clearFieldError = (field: string) => {
    if (errors[field])
      setErrors((p) => {
        const n = { ...p };
        delete n[field];
        return n;
      });
  };

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

  // Password requirements (kept as visual indicators)
  const temMinimo8Caracteres = senha.length >= 8;
  const temLetraMaiuscula = /[A-Z]/.test(senha);
  const temLetraMinuscula = /[a-z]/.test(senha);

  const handleNext = useCallback(() => {
    // Zod validates step 1 fields
    const data = {
      email,
      password: senha,
      name: nome,
      cpf: cpf.replace(/\D/g, ""),
      phoneNumber: telefone.replace(/\D/g, ""),
      birthDate: nascimento.replace(/\D/g, ""),
      address: {
        street: "",
        number: "",
        complement: null,
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
    };
    const result = userCreateBodySchema.safeParse(data);

    const filtered: Record<string, string> = {};

    if (!result.success) {
      const zodErr = extractErrors(result.error);
      const step1Mapping: Record<string, string> = {
        email: "email",
        password: "senha",
        name: "nome",
        cpf: "cpf",
        phoneNumber: "telefone",
        birthDate: "nascimento",
      };
      for (const [zodField, localField] of Object.entries(step1Mapping)) {
        if (zodErr[zodField]) filtered[localField] = zodErr[zodField];
      }
    }

    if (!nome.trim()) filtered.nome = "Preencha o campo";
    if (!email.trim()) filtered.email = "Preencha o campo";
    if (!senha.trim()) filtered.senha = "Preencha o campo";
    if (!confirmarSenha.trim()) filtered.confirmPassword = "Preencha o campo";
    if (senha !== confirmarSenha && senha.trim() && confirmarSenha.trim())
      filtered.confirmPassword = "As senhas não coincidem";

    if (!temMinimo8Caracteres && senha.trim())
      filtered.senha = "Mínimo de 8 caracteres";
    if (!temLetraMaiuscula && senha.trim())
      filtered.senha = "Precisa de uma letra maiúscula";
    if (!temLetraMinuscula && senha.trim() && !filtered.senha)
      filtered.senha = "Precisa de uma letra minúscula";

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
    translateX.value = withTiming(-FORM_WIDTH, { duration: 300 });
    setStep(2);
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
    shakeStep1,
    translateX,
  ]);

  const handleConfirmar = useCallback(async () => {
    setSubmitError("");

    const payload = {
      email: email.trim(),
      password: senha,
      name: nome.trim(),
      cpf: cpf.replace(/\D/g, ""),
      phoneNumber: telefone.replace(/\D/g, ""),
      birthDate: (() => {
        const digits = nascimento.replace(/\D/g, "");
        const d = digits.slice(0, 2);
        const m = digits.slice(2, 4);
        const y = digits.slice(4, 8);
        return `${y}-${m}-${d}`;
      })(),

      address: {
        street: endereco.trim(),
        number: numero.trim(),
        complement: complemento.trim() || null,
        neighborhood: bairro.trim(),
        city: cidade.trim(),
        state: estado,
        zipCode: cep.trim(),
      },
    };

    console.log("Payload:", JSON.stringify(payload, null, 2));

    const result = userCreateBodySchema.safeParse(payload);

    if (!result.success) {
      console.log(
        "Erros Zod:",
        JSON.stringify(result.error.flatten(), null, 2),
      );
      const errs = extractErrors(result.error);
      console.log("Zod errors:", JSON.stringify(errs));

      const filtered: Record<string, string> = {};

      // Map zod field names to local UI field names
      const mapping: Record<string, string> = {
        street: "endereco",
        number: "numero",
        neighborhood: "bairro",
        city: "cidade",
        state: "estado",
        zipCode: "cep",
        email: "email",
        password: "senha",
        name: "nome",
        cpf: "cpf",
        phoneNumber: "telefone",
        birthDate: "nascimento",
      };

      for (const [zodField, msg] of Object.entries(errs)) {
        const localField = mapping[zodField] ?? zodField;
        filtered[localField] = msg as string;
      }

      if (senha !== confirmarSenha)
        filtered.confirmPassword = "As senhas não coincidem";

      setErrors(filtered);
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
      await userService.create(result.data);
      setSubmitError("");
      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "OK", onPress: () => router.push("/login") },
      ]);
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

  // Map zod field names to local field names for display
  const mapping: Record<string, string> = {
    email: "email",
    password: "senha",
    name: "nome",
    cpf: "cpf",
    phoneNumber: "telefone",
    birthDate: "nascimento",
    confirmPassword: "confirmPassword",
    street: "endereco",
    number: "numero",
    neighborhood: "bairro",
    city: "cidade",
    state: "estado",
    zipCode: "cep",
  };

  const displayErrors = Object.fromEntries(
    Object.entries(errors).map(([key, msg]) => [mapping[key] ?? key, msg]),
  ) as Record<string, string>;

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
                  <View style={styles.formPage}>
                    <FloatingLabelInput
                      label="Nome Completo"
                      value={nome}
                      maxLength={100}
                      onChangeText={(t) => {
                        setNome(t);
                        clearFieldError("nome");
                      }}
                      placeholderTextColor="#6C63FF"
                      placeholder="Preencha com seu Nome"
                      labelStyle={styles.label}
                      inputStyle={styles.inputText}
                      error={displayErrors.nome}
                      errorStyle={styles.errorText}
                    />
                    <FloatingLabelInput
                      label="Email"
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        clearFieldError("email");
                      }}
                      placeholderTextColor="#6C63FF"
                      placeholder="Preencha com seu Email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      labelStyle={styles.label}
                      inputStyle={styles.inputText}
                      error={displayErrors.email}
                      errorStyle={styles.errorText}
                    />
                    <FloatingLabelInput
                      label="CPF"
                      value={cpf}
                      onChangeText={(t) => {
                        setCpf(formatCpf(t));
                        clearFieldError("cpf");
                      }}
                      keyboardType="numeric"
                      maxLength={14}
                      placeholderTextColor="#6C63FF"
                      placeholder="000.000.000-00"
                      labelStyle={styles.label}
                      inputStyle={styles.inputText}
                      error={displayErrors.cpf}
                      errorStyle={styles.errorText}
                    />
                    <View style={styles.row}>
                      <View style={styles.inputTelefone}>
                        <FloatingLabelInput
                          label="Telefone"
                          value={telefone}
                          maxLength={15}
                          onChangeText={(t) => {
                            setTelefone(formatPhone(t));
                            clearFieldError("telefone");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6C63FF"
                          placeholder="(00) 00000-0000"
                          labelStyle={styles.label}
                          inputStyle={styles.inputText}
                          error={displayErrors.telefone}
                          errorStyle={styles.errorText}
                        />
                      </View>
                      <View style={styles.inputNascimento}>
                        <FloatingLabelInput
                          label="Nascimento"
                          value={nascimento}
                          maxLength={10}
                          onChangeText={(t) => {
                            setNascimento(formatDate(t));
                            clearFieldError("nascimento");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6C63FF"
                          placeholder="dd/mm/aaaa"
                          labelStyle={styles.label}
                          inputStyle={styles.inputText}
                          error={displayErrors.nascimento}
                          errorStyle={styles.errorText}
                        />
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <FloatingLabelInput
                        label="Senha"
                        maxLength={100}
                        secureTextEntry
                        value={senha}
                        onChangeText={(t) => {
                          setSenha(t);
                          clearFieldError("senha");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Preencha com sua Senha"
                        onFocus={handlePasswordFocus}
                        labelStyle={styles.label}
                        inputStyle={styles.inputText}
                        error={displayErrors.senha}
                        errorStyle={styles.errorText}
                      />
                      <FloatingLabelInput
                        secureTextEntry
                        value={confirmarSenha}
                        maxLength={100}
                        onChangeText={(t) => {
                          setConfirmarSenha(t);
                          clearFieldError("confirmPassword");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Confirme sua Senha"
                        inputStyle={styles.inputText}
                        error={displayErrors.confirmPassword}
                        errorStyle={styles.errorText}
                      />
                      <View>
                        <View style={styles.requisiteRow}>
                          <Ionicons
                            name={
                              temMinimo8Caracteres
                                ? "checkmark-circle"
                                : "close-circle"
                            }
                            size={16}
                            color={temMinimo8Caracteres ? "#4CAF50" : "#ff6584"}
                          />
                          <Text style={styles.requisitesText}>
                            8 ou mais caracteres
                          </Text>
                        </View>
                        <View style={styles.requisiteRow}>
                          <Ionicons
                            name={
                              temLetraMaiuscula
                                ? "checkmark-circle"
                                : "close-circle"
                            }
                            size={16}
                            color={temLetraMaiuscula ? "#4CAF50" : "#ff6584"}
                          />
                          <Text style={styles.requisitesText}>
                            Uma letra maiúscula
                          </Text>
                        </View>
                        <View style={styles.requisiteRow}>
                          <Ionicons
                            name={
                              temLetraMinuscula
                                ? "checkmark-circle"
                                : "close-circle"
                            }
                            size={16}
                            color={temLetraMinuscula ? "#4CAF50" : "#ff6584"}
                          />
                          <Text style={styles.requisitesText}>
                            Uma letra minúscula
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.shakeWrapper,
                    step === 1 ? {} : shakeStyle2,
                    { opacity: step === 2 ? 1 : 0 },
                  ]}
                  pointerEvents={step === 2 ? "auto" : "none"}
                >
                  <View style={styles.formPage}>
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <FloatingLabelInput
                          label="CEP"
                          value={cep}
                          onChangeText={(t) => {
                            const formattedCep = formatCep(t);
                            const digits = formattedCep.replace(/\D/g, "");

                            setCep(formattedCep);
                            clearFieldError("cep");

                            if (digits.length < 8) {
                              lastCepFetchedRef.current = "";
                              setEndereco("");
                              setBairro("");
                              setCidade("");
                              setEstado("");
                              return;
                            }

                            if (digits !== lastCepFetchedRef.current) {
                              void handleCepLookup(formattedCep);
                            }
                          }}
                          keyboardType="numeric"
                          maxLength={9}
                          placeholderTextColor="#6C63FF"
                          placeholder="00000-000"
                          labelStyle={styles.label}
                          inputStyle={styles.inputText}
                          error={displayErrors.cep}
                          errorStyle={styles.errorText}
                        />
                        {cepLoading && (
                          <ActivityIndicator
                            style={styles.cepLoadingIndicator}
                            color="#6C63FF"
                            size="small"
                          />
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <PrimaryButton
                          style={styles.cepHelpButton}
                          activeOpacity={0.7}
                          onPress={handleCepHelpPress}
                        >
                          <Text style={styles.cepHelpButtonText}>
                            NÃO SABE O CEP?
                          </Text>
                        </PrimaryButton>
                      </View>
                    </View>

                    <FloatingLabelInput
                      label="Endereço"
                      value={endereco}
                      editable={false}
                      placeholderTextColor="#6C63FF"
                      placeholder="Preencha com seu Endereço"
                      labelStyle={styles.label}
                      inputStyle={[styles.inputText, styles.readOnlyInput]}
                      error={displayErrors.endereco}
                      errorStyle={styles.errorText}
                    />

                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <FloatingLabelInput
                          label="Nº"
                          value={numero}
                          onChangeText={(t) => {
                            setNumero(t);
                            clearFieldError("numero");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6C63FF"
                          placeholder="Nº"
                          labelStyle={styles.label}
                          inputStyle={styles.inputText}
                          error={displayErrors.numero}
                          errorStyle={styles.errorText}
                        />
                      </View>

                      <View style={{ flex: 4 }}>
                        <FloatingLabelInput
                          label="Complemento"
                          value={complemento}
                          onChangeText={(t) => {
                            setComplemento(t);
                            clearFieldError("complemento");
                          }}
                          placeholderTextColor="#6C63FF"
                          placeholder="Preencha com seu Complemento"
                          labelStyle={styles.label}
                          inputStyle={styles.inputText}
                        />
                      </View>
                    </View>

                    <FloatingLabelInput
                      label="Bairro"
                      value={bairro}
                      editable={false}
                      placeholderTextColor="#6C63FF"
                      placeholder="Preencha com seu Bairro"
                      labelStyle={styles.label}
                      inputStyle={[styles.inputText, styles.readOnlyInput]}
                      error={displayErrors.bairro}
                      errorStyle={styles.errorText}
                    />

                    <View style={styles.row}>
                      <View style={{ flex: 2 }}>
                        <FloatingLabelInput
                          label="Cidade"
                          value={cidade}
                          editable={false}
                          placeholderTextColor="#6C63FF"
                          placeholder="Preencha com sua Cidade"
                          labelStyle={styles.label}
                          inputStyle={[styles.inputText, styles.readOnlyInput]}
                          error={displayErrors.cidade}
                          errorStyle={styles.errorText}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Estado</Text>
                        <View
                          style={[
                            styles.pickerWrapper,
                            displayErrors.estado && styles.inputError,
                          ]}
                        >
                          <Picker
                            selectedValue={estado}
                            onValueChange={(val) => {
                              setEstado(val);
                              clearFieldError("estado");
                            }}
                            style={styles.picker}
                            dropdownIconColor="#6C63FF"
                          >
                            <Picker.Item label="Selecione" value="" />
                            {ESTADOS.map((uf) => (
                              <Picker.Item key={uf} label={uf} value={uf} />
                            ))}
                          </Picker>
                        </View>
                        {displayErrors.estado && (
                          <Text style={styles.errorText}>
                            {displayErrors.estado}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Animated.View>
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
    paddingTop: 22,
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
    lineHeight: 54,
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
    marginTop: 12,
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
