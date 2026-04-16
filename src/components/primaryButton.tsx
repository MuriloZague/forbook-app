import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface PrimaryButtonProps {
  onPress: () => void;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  activeOpacity?: number;
  indicatorColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export default function PrimaryButton({
  onPress,
  label,
  loading = false,
  disabled = false,
  activeOpacity = 0.7,
  indicatorColor = "#fff",
  style,
  textStyle,
  children,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled, style]}
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} size="small" />
      ) : children ? (
        children
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: "montserratBold",
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
  },
});
