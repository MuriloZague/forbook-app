import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";

import { useTransition } from "@/src/context/transition-context";

export default function Modal() {
  const { overlayRef } = useTransition();

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();

      overlayRef.current?.playEnter(() => {
        navigation.dispatch(e.data.action);
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      overlayRef.current?.playExit();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anunciar</Text>

      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeText}>Fechar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "lexendBlack",
    color: "#6c63ff",
    marginBottom: 32,
  },
  closeButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#6c63ff",
    borderRadius: 12,
  },
  closeText: {
    color: "#fff",
    fontFamily: "montserratBold",
    fontSize: 15,
  },
});
