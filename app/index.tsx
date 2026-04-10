import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function TelaInicial() {
  return (
    <SafeAreaProvider style={styles.main}>
      <View style={styles.content}>
        <View>
          <Text style={styles.minorTitle}>BEM VINDO AO</Text>
          <Text style={styles.bigTitle}>FORBOOK</Text>
        </View>
        <View style={styles.btnContent}>
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.6}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.btnText}>ENTRAR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.6}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.btnText}>CRIAR CONTA</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.imgLogo}>
        <Image
          source={require("../assets/images/Logo.png")}
          style={{ width: 84, height: 52 }}
        />
        <Text style={{marginTop: 8, fontFamily: 'lexendRegular'}}>v0.2.0</Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 8,
  },
  minorTitle: {
    fontFamily: "lexendBold",
    fontSize: 24,
    lineHeight: 18,
  },
  bigTitle: {
    fontFamily: "lexendBlack",
    fontSize: 58,
    includeFontPadding: false,
  },
  btnContent: {
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  btn: {
    backgroundColor: "#6C63FF",
    width: "56%",
    borderRadius: 12,
    paddingVertical: 8,
  },
  btnText: {
    fontFamily: "montserratBold",
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
  imgLogo: {
    position: "absolute",
    bottom: 38,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
