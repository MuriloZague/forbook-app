import StepIndicator from "@/src/components/stepIndicator";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
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

const { width } = Dimensions.get("window");

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

export default function LoginScreen() {
  const [step, setStep] = useState(1);

  const translateX = useSharedValue(0);
  const shakeStep1 = useSharedValue(0);
  const shakeStep2 = useSharedValue(0);

  const PAGE_WIDTH = Dimensions.get("window").width - 40;

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

  // Validation errors
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Step 1 validation
  const isStep1Valid = useMemo(
    () =>
      nome.trim() !== "" &&
      email.trim() !== "" &&
      cpf.trim() !== "" &&
      telefone.trim() !== "" &&
      nascimento.trim() !== "" &&
      senha.trim() !== "" &&
      confirmarSenha.trim() !== "",
    [nome, email, cpf, telefone, nascimento, senha, confirmarSenha],
  );

  // Step 2 validation
  const isStep2Valid = useMemo(
    () =>
      cep.trim() !== "" &&
      endereco.trim() !== "" &&
      numero.trim() !== "" &&
      bairro.trim() !== "" &&
      cidade.trim() !== "" &&
      estado.trim() !== "",
    [cep, endereco, numero, bairro, cidade, estado],
  );

  const scrollViewRef = React.useRef<ScrollView>(null);

  // Validações de requisitos de senha - descartar pois vou usar o ZOD
  const temMinimo8Caracteres = senha.length >= 8;
  const temLetraMaiuscula = /[A-Z]/.test(senha);
  const temLetraMinuscula = /[a-z]/.test(senha);

  const handlePasswordFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 350,
        animated: true,
      });
    }, 100);
  };

  const handleNext = useCallback(() => {
    if (!isStep1Valid) {
      const newErrors: Record<string, boolean> = {};
      if (!nome.trim()) newErrors.nome = true;
      if (!email.trim()) newErrors.email = true;
      if (!cpf.trim()) newErrors.cpf = true;
      if (!telefone.trim()) newErrors.telefone = true;
      if (!nascimento.trim()) newErrors.nascimento = true;
      if (!senha.trim()) newErrors.senha = true;
      if (!confirmarSenha.trim()) newErrors.confirmarSenha = true;
      setErrors(newErrors);
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
    translateX.value = withTiming(-(width - 40), { duration: 300 });
    setStep(2);
  }, [
    isStep1Valid,
    nome,
    email,
    cpf,
    telefone,
    nascimento,
    senha,
    confirmarSenha,
  ]);

  const handleBack = useCallback(() => {
    if (!isStep2Valid) {
      const newErrors: Record<string, boolean> = {};
      if (!cep.trim()) newErrors.cep = true;
      if (!endereco.trim()) newErrors.endereco = true;
      if (!numero.trim()) newErrors.numero = true;
      if (!bairro.trim()) newErrors.bairro = true;
      if (!cidade.trim()) newErrors.cidade = true;
      if (!estado.trim()) newErrors.estado = true;
      setErrors(newErrors);
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
    translateX.value = withTiming(0, { duration: 300 });
    setStep(1);
  }, [isStep2Valid, cep, endereco, numero, bairro, cidade, estado]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shakeStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeStep1.value }],
  }));

  const shakeStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeStep2.value }],
  }));

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

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
                        style={[styles.input, errors.nome && styles.inputError]}
                        value={nome}
                        onChangeText={(t) => {
                          setNome(t);
                          clearError("nome");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Preencha com seu Nome"
                      />
                      {/*  {errors.nome && <Text style={styles.errorText}>Preencha o campo</Text>}*/}
                    </View>
                    <View>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors.email && styles.inputError,
                        ]}
                        value={email}
                        onChangeText={(t) => {
                          setEmail(t);
                          clearError("email");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Preencha com seu Email"
                      />
                      {/*  {errors.nome && <Text style={styles.errorText}>Preencha o campo</Text>}*/}
                    </View>
                    <View>
                      <Text style={styles.label}>CPF</Text>
                      <TextInput
                        style={[styles.input, errors.cpf && styles.inputError]}
                        value={cpf}
                        onChangeText={(t) => {
                          setCpf(t);
                          clearError("cpf");
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#6C63FF"
                        placeholder="000.000.000-00"
                      />
                      {/*  {errors.nome && <Text style={styles.errorText}>Preencha o campo</Text>}*/}
                    </View>
                    <View style={styles.row}>
                      <View style={styles.inputTelefone}>
                        <Text style={styles.label}>Telefone</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.telefone && styles.inputError,
                          ]}
                          value={telefone}
                          onChangeText={(t) => {
                            setTelefone(t);
                            clearError("telefone");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6C63FF"
                          placeholder="+55 (00) 00000-0000"
                        />
                        {/*  {errors.nome && <Text style={styles.errorText}>Preencha o campo</Text>}*/}
                      </View>

                      <View style={styles.inputNascimento}>
                        <Text style={styles.label}>Nascimento</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.nascimento && styles.inputError,
                          ]}
                          value={nascimento}
                          onChangeText={(t) => {
                            setNascimento(t);
                            clearError("nascimento");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6C63FF"
                          placeholder="dd/mm/aaaa"
                        />
                        {/*  {errors.nome && <Text style={styles.errorText}>Preencha o campo</Text>}*/}
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <View>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.senha && styles.inputError,
                          ]}
                          secureTextEntry
                          value={senha}
                          onChangeText={(t) => {
                            setSenha(t);
                            clearError("senha");
                          }}
                          onPress={handlePasswordFocus}
                          placeholderTextColor="#6C63FF"
                          placeholder="Preencha com sua Senha"
                        />
                        {/*  {errors.nome && <Text style={styles.errorText}>Preencha o campo</Text>}*/}
                      </View>
                      <View>
                        <TextInput
                          style={[
                            styles.input,
                            errors.confirmarSenha && styles.inputError,
                          ]}
                          secureTextEntry
                          value={confirmarSenha}
                          onChangeText={(t) => {
                            setConfirmarSenha(t);
                            clearError("confirmarSenha");
                          }}
                          onPress={handlePasswordFocus}
                          placeholderTextColor="#6C63FF"
                          placeholder="Confirme sua Senha"
                        />
                        {/*  {errors.nome && <Text style={styles.errorText}>Preencha o campo</Text>}*/}
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
                  style={[styles.shakeWrapper, step === 1 ? {} : shakeStyle2, { opacity: step === 2 ? 1 : 0 }]}
                  pointerEvents={step === 2 ? "auto" : "none"}
                >
                  <View style={styles.formPage}>
                    <View>
                      <Text style={styles.label}>CEP</Text>
                      <TextInput
                        style={[styles.input, errors.cep && styles.inputError]}
                        value={cep}
                        onChangeText={(t) => {
                          setCep(t);
                          clearError("cep");
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#6C63FF"
                        placeholder="00000-000"
                      />
                      
                    </View>

                    <View>
                      <Text style={styles.label}>Endereço</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors.endereco && styles.inputError,
                        ]}
                        value={endereco}
                        onChangeText={(t) => {
                          setEndereco(t);
                          clearError("endereco");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Preencha com seu Endereço"
                      />
                      
                    </View>

                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Nº</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.numero && styles.inputError,
                          ]}
                          value={numero}
                          onChangeText={(t) => {
                            setNumero(t);
                            clearError("numero");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6C63FF"
                          placeholder="Nº"
                        />
                        
                      </View>

                      <View style={{ flex: 4 }}>
                        <Text style={styles.label}>Complemento</Text>
                        <TextInput
                          style={styles.input}
                          value={complemento}
                          onChangeText={(t) => {
                            setComplemento(t);
                            clearError("complemento");
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
                          errors.bairro && styles.inputError,
                        ]}
                        value={bairro}
                        onChangeText={(t) => {
                          setBairro(t);
                          clearError("bairro");
                        }}
                        placeholderTextColor="#6C63FF"
                        placeholder="Preencha com seu Bairro"
                      />
                      
                    </View>

                    <View style={styles.row}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.label}>Cidade</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.cidade && styles.inputError,
                          ]}
                          value={cidade}
                          onChangeText={(t) => {
                            setCidade(t);
                            clearError("cidade");
                          }}
                          placeholderTextColor="#6C63FF"
                          placeholder="Preencha com sua Cidade"
                        />
                        
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Estado</Text>
                        <View
                          style={[
                            styles.pickerWrapper,
                            errors.estado && styles.inputError,
                          ]}
                        >
                          <Picker
                            selectedValue={estado}
                            onValueChange={(val) => {
                              setEstado(val);
                              clearError("estado");
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
                       
                      </View>
                    </View>
                  </View>
                </Animated.View>
              </Animated.View>
            </View>

            <Animated.View style={[styles.btnContainer, step === 1 ? shakeStyle1 : shakeStyle2]}>
              {step === 1 ? (
                <>
                  <TouchableOpacity style={styles.btn} onPress={handleNext}>
                    <View style={styles.btnContent}>
                      <Text style={styles.btnText}>Continuar</Text>
                      <Ionicons name="arrow-forward" size={22} color="white" />
                    </View>
                  </TouchableOpacity>
                  
                </>
              ) : (
                <TouchableOpacity style={styles.btn} onPress={handleBack}>
                  <Text style={styles.btnText}>CRIAR CONTA</Text>
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
    marginHorizontal: 20,
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
    width: width - 40,
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
    width: (width - 40) * 2,
  },

  formPage: {
    width: width - 40,
    gap: 16,
  },
  shakeWrapper: {
    width: width - 40,
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
    fontSize: 14,
    fontFamily: "montserratBold",
    marginTop: 16,
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
