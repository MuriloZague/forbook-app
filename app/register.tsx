import StepIndicator from "@/src/components/stepIndicator";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  const scrollViewRef = React.useRef<ScrollView>(null);
  const cpfRef = useRef("");
  const telefoneRef = useRef("");
  const nascimentoRef = useRef("");

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
  }, [email, senha, nome, cpf, telefone, nascimento, confirmarSenha]);

  const handleConfirmar = useCallback(async () => {
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
      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "OK", onPress: () => router.push("/login") },
      ]);
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
        } else {
          Alert.alert("Erro", error.message);
        }
      } else {
        Alert.alert("Erro", "Não foi possível conectar ao servidor.");
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
  ]);

  const handleBack = useCallback(() => {
    setErrors({});
    translateX.value = withTiming(0, { duration: 300 });
    setStep(1);
  }, []);

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
              <Text style={styles.minorTitle}>
                Já possui uma conta?{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => router.push("/login")}
                >
                  Entre agora!
                </Text>
              </Text>
            </View>

            <StepIndicator step={step} total={2} />

            <View style={styles.sliderContainer}>
              <Animated.View style={[styles.slider, animatedStyle]}>
                <Animated.View style={[styles.shakeWrapper, shakeStyle1]}>
                  <View style={styles.formPage}>
                    <View>
                      <Text style={styles.label}>Nome Completo</Text>
                      <TextInput
                        style={[
                          styles.input,
                          displayErrors.nome && styles.inputError,
                        ]}
                        value={nome}
                        maxLength={100}
                        onChangeText={(t) => {
                          setNome(t);
                          clearFieldError("nome");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Preencha com seu Nome"
                      />
                      {displayErrors.nome && (
                        <Text style={styles.errorText}>
                          {displayErrors.nome}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={[
                          styles.input,
                          displayErrors.email && styles.inputError,
                        ]}
                        value={email}
                        onChangeText={(t) => {
                          setEmail(t);
                          clearFieldError("email");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Preencha com seu Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      {displayErrors.email && (
                        <Text style={styles.errorText}>
                          {displayErrors.email}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.label}>CPF</Text>
                      <TextInput
                        style={[
                          styles.input,
                          displayErrors.cpf && styles.inputError,
                        ]}
                        value={cpf}
                        onChangeText={(t) => {
                          setCpf(formatCpf(t));
                          clearFieldError("cpf");
                        }}
                        keyboardType="numeric"
                        maxLength={14}
                        placeholderTextColor="#6C63FF"
                        placeholder="000.000.000-00"
                      />
                      {displayErrors.cpf && (
                        <Text style={styles.errorText}>
                          {displayErrors.cpf}
                        </Text>
                      )}
                    </View>
                    <View style={styles.row}>
                      <View style={styles.inputTelefone}>
                        <Text style={styles.label}>Telefone</Text>
                        <TextInput
                          style={[
                            styles.input,
                            displayErrors.telefone && styles.inputError,
                          ]}
                          value={telefone}
                          maxLength={15}
                          onChangeText={(t) => {
                            setTelefone(formatPhone(t));
                            clearFieldError("telefone");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6C63FF"
                          placeholder="(00) 00000-0000"
                        />
                        {displayErrors.telefone && (
                          <Text style={styles.errorText}>
                            {displayErrors.telefone}
                          </Text>
                        )}
                      </View>
                      <View style={styles.inputNascimento}>
                        <Text style={styles.label}>Nascimento</Text>
                        <TextInput
                          style={[
                            styles.input,
                            displayErrors.nascimento && styles.inputError,
                          ]}
                          value={nascimento}
                          maxLength={10}
                          onChangeText={(t) => {
                            setNascimento(formatDate(t));
                            clearFieldError("nascimento");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6C63FF"
                          placeholder="dd/mm/aaaa"
                        />
                        {displayErrors.nascimento && (
                          <Text style={styles.errorText}>
                            {displayErrors.nascimento}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <View>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                          style={[
                            styles.input,
                            displayErrors.senha && styles.inputError,
                          ]}
                          maxLength={100}
                          secureTextEntry
                          value={senha}
                          onChangeText={(t) => {
                            setSenha(t);
                            clearFieldError("senha");
                          }}
                          placeholderTextColor="#6C63FF"
                          placeholder="Preencha com sua Senha"
                          onPress={handlePasswordFocus}
                        />
                        {displayErrors.senha && (
                          <Text style={styles.errorText}>
                            {displayErrors.senha}
                          </Text>
                        )}
                      </View>
                      <View>
                        <TextInput
                          style={[
                            styles.input,
                            displayErrors.confirmPassword && styles.inputError,
                          ]}
                          secureTextEntry
                          value={confirmarSenha}
                          maxLength={100}
                          onChangeText={(t) => {
                            setConfirmarSenha(t);
                            clearFieldError("confirmPassword");
                          }}
                          placeholderTextColor="#6C63FF"
                          placeholder="Confirme sua Senha"
                        />
                        {displayErrors.confirmPassword && (
                          <Text style={styles.errorText}>
                            {displayErrors.confirmPassword}
                          </Text>
                        )}
                      </View>
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
                    <View>
                      <Text style={styles.label}>CEP</Text>
                      <TextInput
                        style={[
                          styles.input,
                          displayErrors.cep && styles.inputError,
                        ]}
                        value={cep}
                        onChangeText={(t) => {
                          setCep(t);
                          clearFieldError("cep");
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#6C63FF"
                        placeholder="00000-000"
                      />
                      {displayErrors.cep && (
                        <Text style={styles.errorText}>
                          {displayErrors.cep}
                        </Text>
                      )}
                    </View>

                    <View>
                      <Text style={styles.label}>Endereço</Text>
                      <TextInput
                        style={[
                          styles.input,
                          displayErrors.endereco && styles.inputError,
                        ]}
                        value={endereco}
                        onChangeText={(t) => {
                          setEndereco(t);
                          clearFieldError("endereco");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Preencha com seu Endereço"
                      />
                      {displayErrors.endereco && (
                        <Text style={styles.errorText}>
                          {displayErrors.endereco}
                        </Text>
                      )}
                    </View>

                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Nº</Text>
                        <TextInput
                          style={[
                            styles.input,
                            displayErrors.numero && styles.inputError,
                          ]}
                          value={numero}
                          onChangeText={(t) => {
                            setNumero(t);
                            clearFieldError("numero");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6C63FF"
                          placeholder="Nº"
                        />
                        {displayErrors.numero && (
                          <Text style={styles.errorText}>
                            {displayErrors.numero}
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 4 }}>
                        <Text style={styles.label}>Complemento</Text>
                        <TextInput
                          style={styles.input}
                          value={complemento}
                          onChangeText={(t) => {
                            setComplemento(t);
                            clearFieldError("complemento");
                          }}
                          placeholderTextColor="#6C63FF"
                          placeholder="Preencha com seu Complemento"
                        />
                      </View>
                    </View>

                    <View>
                      <Text style={styles.label}>Bairro</Text>
                      <TextInput
                        style={[
                          styles.input,
                          displayErrors.bairro && styles.inputError,
                        ]}
                        value={bairro}
                        onChangeText={(t) => {
                          setBairro(t);
                          clearFieldError("bairro");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Preencha com seu Bairro"
                      />
                      {displayErrors.bairro && (
                        <Text style={styles.errorText}>
                          {displayErrors.bairro}
                        </Text>
                      )}
                    </View>

                    <View style={styles.row}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.label}>Cidade</Text>
                        <TextInput
                          style={[
                            styles.input,
                            displayErrors.cidade && styles.inputError,
                          ]}
                          value={cidade}
                          onChangeText={(t) => {
                            setCidade(t);
                            clearFieldError("cidade");
                          }}
                          placeholderTextColor="#6C63FF"
                          placeholder="Preencha com sua Cidade"
                        />
                        {displayErrors.cidade && (
                          <Text style={styles.errorText}>
                            {displayErrors.cidade}
                          </Text>
                        )}
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
              {step === 1 ? (
                <TouchableOpacity style={styles.btn} onPress={handleNext}>
                  <View style={styles.btnContent}>
                    <Text style={styles.btnText}>Continuar</Text>
                    <Ionicons name="arrow-forward" size={22} color="white" />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.btn}
                  activeOpacity={0.7}
                  onPress={handleConfirmar}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.btnText}>CRIAR CONTA</Text>
                  )}
                </TouchableOpacity>
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
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 8,
    paddingTop: 36,
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
  input: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: "montserratRegular",
    color: "black",
  },
  inputError: {
    borderColor: "#ff6584",
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
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 4,
    fontSize: 14,
    zIndex: 1,
    fontFamily: "montserratBold",
  },
  btnContainer: {
    alignItems: "center",
  },
  btn: {
    backgroundColor: "#6C63FF",
    width: "56%",
    borderRadius: 12,
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
