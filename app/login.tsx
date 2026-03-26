import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";

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
              onPress={() => router.push("/cadastro")}
            >
              Crie uma!
            </Text>
          </Text>
        </View>

        <View style={styles.formContent}>
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Preencha com seu Email"
              placeholderTextColor="#6C63FF"
              style={styles.input}
            />
          </View>

          <View>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              placeholder="Preencha com sua Senha"
              placeholderTextColor="#6C63FF"
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
          <TouchableOpacity style={styles.btn} activeOpacity={0.7}>
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

  formContent: {
    gap: 26,
  },

  input: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#000",
    fontFamily: "montserratRegular",
  },

  label: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 4,
    fontSize: 14,
    color: "#000",
    zIndex: 1,
    fontFamily: "montserratBold",
  },

  highlightedTextForm: {
    fontFamily: "montserratBold",
    fontSize: 14,
    color: "#6C63FF",
    textDecorationLine: "underline",
    textAlign: "right",
    marginTop: 12,
  },

  btnContainer: {
    alignItems: "center",
  },

  btn: {
    backgroundColor: "#6C63FF",
    width: "65%",
    borderRadius: 12,
    paddingVertical: 12,
  },

  btnText: {
    fontFamily: "montserratBold",
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
});
