import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  TextInput,
  Image
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Rect, Line, Path, Circle, G } from "react-native-svg";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  return (
    <SafeAreaProvider style={styles.main}>
      <View style={styles.content}>
        <View style={styles.titleContent}>
          <Text style={styles.bigTitle}>Entre em sua conta</Text>
          <Text style={styles.minorTitle}>Não possui uma conta? {""}
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={{ textDecorationLine: 'underline', fontWeight: '700', color: '#6C63FF' }}>Crie uma!</Text>
              </TouchableOpacity>
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
            />
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.highlightedTextForm}>Esqueci minha senha</Text>
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
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 22
  },
  content: {
    margin: 'auto',
    gap: 72,
  },
  titleContent: {
    gap: 22,
  },
  minorTitle: {
    fontFamily: 'montserrat',
    fontSize: 16,
    lineHeight: 5,
    fontWeight: 'regular'
  },
  bigTitle: {
    fontFamily: 'lexend',
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 46,
  },
  formContent: {
    gap: 26
  },
  input: {
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#000',
    fontFamily: 'montserrat'
  },
  label: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 2,
    fontSize: 16,
    color: '#000',
    zIndex: 1,
    fontFamily: 'montserrat',
  },
  highlightedTextForm: {
    fontFamily: 'montserrat',
    fontSize: 15,
    color: '#6C63FF',
    textDecorationLine: 'underline',
    fontWeight: '600',
    textAlign: 'right',
    marginRight: 2,
    marginTop: 12,
  },
  btnContainer: {
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#6C63FF',
    width: "65%",
    borderRadius: 12,
    paddingVertical: 12,
  },
  btnText: {
    fontFamily: 'montserrat',
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
