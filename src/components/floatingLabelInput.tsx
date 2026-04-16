import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface FloatingLabelInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  rightElement?: React.ReactNode;
  labelBackgroundColor?: string;
}

export default function FloatingLabelInput({
  label,
  error,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  rightElement,
  labelBackgroundColor = "#F0F2F5",
  ...inputProps
}: FloatingLabelInputProps) {
  const hasRightElement = !!rightElement;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            { backgroundColor: labelBackgroundColor },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          hasRightElement && styles.inputContainerWithAdornment,
          error && styles.inputError,
          inputContainerStyle,
        ]}
      >
        <TextInput
          {...inputProps}
          style={[
            styles.input,
            hasRightElement && styles.inputWithAdornment,
            inputStyle,
          ]}
        />

        {hasRightElement ? (
          <View style={styles.rightElement}>{rightElement}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  label: {
    position: "absolute",
    top: -10,
    left: 12,
    paddingHorizontal: 4,
    fontSize: 14,
    zIndex: 1,
    fontFamily: "montserratBold",
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  inputContainerWithAdornment: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: "#000",
    fontFamily: "montserratRegular",
  },
  inputWithAdornment: {
    flex: 1,
  },
  rightElement: {
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: "#ff6584",
  },
  errorText: {
    color: "#ff6584",
    fontSize: 10,
    fontFamily: "montserratBold",
    marginTop: 2,
    marginLeft: 2,
  },
});
