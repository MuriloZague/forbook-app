import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function LoginScreen() {
  return (
    <SafeAreaProvider style={styles.main}>
      <View style={styles.content}>
        <View style={styles.titleContent}>
          <Text style={styles.bigTitle}>Entre em sua conta</Text>

          <Text style={styles.minorTitle}>
            Não possui uma conta?{" "}
            <Text
              style={styles.linkText}
              onPress={() => router.push("/register")}
            >
              Crie uma!
            </Text>
          </Text>
        </View>

        <View style={styles.formContent}>
          {/* Container do Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Preencha com seu Email"
              placeholderTextColor="#A6A8AA"
              style={styles.input}
            />
          </View>

          {/* Container da Senha */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              placeholder="Preencha com sua Senha"
              placeholderTextColor="#A6A8AA"
              style={styles.input}
              secureTextEntry
            />

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.highlightedTextForm}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text style={styles.btnText}>ENTRAR</Text>
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

  // Novo container para segurar o input e a label perfeitamente
  inputContainer: {
    position: "relative",
    marginTop: 8, // Dá um respiro para a label não colar no item de cima
  },

  label: {
    position: "absolute",
    top: -10, // Sobe o texto para cortar a borda
    left: 16, // Afasta um pouco da lateral esquerda
    backgroundColor: "#F0F2F5", // TEM que ser exatamente a cor de fundo da tela
    paddingHorizontal: 6, // Cria o espaço em branco ao redor da palavra
    fontSize: 13, // Fonte um pouco menor fica mais elegante
    color: "#6C63FF", // Cor combinando com a borda
    zIndex: 2, // Garante que fique por cima da borda no iOS
    elevation: 2, // Garante que fique por cima da borda no Android
    fontFamily: "montserratBold",
  },

  input: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16, // Aumentei um pouquinho para o texto respirar
    fontSize: 15,
    color: "#000",
    fontFamily: "montserratRegular",
    backgroundColor: "transparent", // Garante que não tampe a label
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
  },

  btn: {
    backgroundColor: "#6C63FF",
    width: "65%",
    borderRadius: 12,
    paddingVertical: 14, // Deixei o botão levemente mais gordinho
  },

  btnText: {
    fontFamily: "montserratBold",
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
});
