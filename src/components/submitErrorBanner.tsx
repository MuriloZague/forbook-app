import React from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

interface SubmitErrorBannerProps {
  message?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function SubmitErrorBanner({
  message,
  containerStyle,
  textStyle,
}: SubmitErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]} pointerEvents="none">
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: "100%",
    marginBottom: 6,
    width: "100%",
    alignItems: "center",
  },
  text: {
    color: "#ff6584",
    fontSize: 13,
    fontFamily: "montserratBold",
    textAlign: "center",
    paddingHorizontal: 8,
  },
});
