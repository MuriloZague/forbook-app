import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Image
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Rect, Line, Path, Circle, G } from "react-native-svg";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");


export default function TelaInicial() {
  return (
    <SafeAreaProvider style={styles.main}>
      <View style={styles.content}>
        <View style={styles.titleContent}>
          <Text style={styles.minorTitle}>BEM VINDO AO</Text>
          <Text style={styles.bigTitle}>FORBOOK</Text>
        </View>
        <View style={styles.btnContent}>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>ENTRAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>CRIAR CONTA</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.imgLogo}>
        <Image source={require('../assets/images/logo-forbook.svg')} 
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
    main: {
      backgroundColor: 'F0F2F5',
    },
    content: {
      margin: 'auto',
      gap: 16
    },
    titleContent: {

    },
    minorTitle: {
      fontFamily: 'lexend',
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 5,
    },
    bigTitle: {
      fontFamily: 'lexend',
      fontSize: 58,
      fontWeight: '900'
    },
    btnContent: {
      alignItems: 'center',
      gap: 12
    },
    btn: {
      backgroundColor: '#6C63FF',
      width: "85%",
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
    imgLogo: {
      position: 'absolute',
      bottom: 32,
      left: 0,
      right: 0,
      alignItems: 'center',
    }
});
