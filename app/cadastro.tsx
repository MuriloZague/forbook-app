import StepIndicator from "@/src/components/stepIndicator";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
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

  const PAGE_WIDTH = Dimensions.get("window").width - 40;

  const handleNext = useCallback(() => {
    translateX.value = withTiming(-(width - 40), { duration: 300 });
    setStep(2);
  }, []);

  const handleBack = useCallback(() => {
    translateX.value = withTiming(0, { duration: 300 });
    setStep(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const [estado, setEstado] = useState("");

  return (
    <SafeAreaProvider style={styles.main}>
      <SafeAreaView style={styles.content}>
        <View style={styles.titleContent}>
          <Text style={styles.bigTitle}>Crie sua conta</Text>

          <Text style={styles.minorTitle}>
            Já possui uma conta?{" "}
            <Text style={styles.linkText} onPress={() => router.push("/login")}>
              Entre agora!
            </Text>
          </Text>
        </View>

        <StepIndicator step={step} total={2} />

        <View style={styles.sliderContainer}>
          <Animated.View style={[styles.slider, animatedStyle]}>
            <View style={styles.formPage}>
              <View>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#6C63FF"
                  placeholder="Preencha com seu Nome"
                />
              </View>
              <View>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#6C63FF"
                  placeholder="Preencha com seu Email"
                />
              </View>
              <View>
                <Text style={styles.label}>CPF</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholderTextColor="#6C63FF"
                  placeholder="000.000.000-00"
                />
              </View>
              <View style={styles.row}>
                <View style={styles.inputTelefone}>
                  <Text style={styles.label}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#6C63FF"
                    placeholder="+55 (00) 00000-0000"
                  />
                </View>

                <View style={styles.inputNascimento}>
                  <Text style={styles.label}>Nascimento</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#6C63FF"
                    placeholder="dd/mm/aaaa"
                  />
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <View>
                  <Text style={styles.label}>Senha</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    placeholderTextColor="#6C63FF"
                    placeholder="Preencha com sua Senha"
                  />
                </View>
                <View>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    placeholderTextColor="#6C63FF"
                    placeholder="Confirme sua Senha"
                  />
                </View>
                <View>
                  <Text style={styles.requisitesText}>
                    X 8 ou mais caracteres
                  </Text>
                  <Text style={styles.requisitesText}>
                    X Uma letra maiúscula
                  </Text>
                  <Text style={styles.requisitesText}>
                    X Uma letra minúscula
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.formPage}>
              <View>
                <Text style={styles.label}>CEP</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholderTextColor="#6C63FF"
                  placeholder="00000-000"
                />
              </View>

              <View>
                <Text style={styles.label}>Endereço</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#6C63FF"
                  placeholder="Preencha com seu Endereço"
                />
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nº</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#6C63FF"
                    placeholder="Nº"
                  />
                </View>

                <View style={{ flex: 4 }}>
                  <Text style={styles.label}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6C63FF"
                    placeholder="Preencha com seu Complemento"
                  />
                </View>
              </View>

              <View>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#6C63FF"
                  placeholder="Preencha com seu Bairro"
                />
              </View>

              <View style={styles.row}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>Cidade</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6C63FF"
                    placeholder="Preencha com sua Cidade"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Estado</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={estado}
                      onValueChange={(val) => setEstado(val)}
                      style={styles.picker}
                      dropdownIconColor="#6C63FF" // 👈 cor da setinha
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
        </View>

        <View style={styles.btnContainer}>
          {step === 1 ? (
            <TouchableOpacity style={styles.btn} onPress={handleNext}>
              <View style={styles.btnContent}>
                <Text style={styles.btnText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={22} color="white" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btn} onPress={handleBack}>
              <Text style={styles.btnText}>Cadastrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 20,
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
  input: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: "montserratRegular",
    color: "black",
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
    width: "52%",
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
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
