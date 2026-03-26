import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
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
        <View>
          <TouchableOpacity>
            <Text>ENTRAR</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>CRIAR CONTA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
    main: {
      backgroundColor: 'F0F2F5',
    },
    content: {

    },
    titleContent: {

    },
    minorTitle: {
      fontFamily: 'lexend'
    },
    bigTitle: {

    }
});
