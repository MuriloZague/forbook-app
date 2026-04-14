import React, { useMemo, useRef, useState } from "react";
import {
    KeyboardTypeOptions,
    StyleProp,
    StyleSheet,
    TextInput,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

type OtpInputProps = {
  value: string;
  onChangeValue: (value: string) => void;
  length?: number;
  containerStyle?: StyleProp<ViewStyle>;
  cellStyle?: StyleProp<TextStyle>;
  activeCellStyle?: StyleProp<TextStyle>;
  cellTextStyle?: StyleProp<TextStyle>;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
};

const sanitizeCode = (value: string) => value.replace(/[^a-zA-Z0-9]/g, "");

export default function OtpInput({
  value,
  onChangeValue,
  length = 6,
  containerStyle,
  cellStyle,
  activeCellStyle,
  cellTextStyle,
  keyboardType = "default",
  autoFocus = false,
}: OtpInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    autoFocus ? 0 : null,
  );

  const normalizedValue = useMemo(
    () => sanitizeCode(value).slice(0, length),
    [length, value],
  );

  const chars = useMemo(
    () => Array.from({ length }, (_, index) => normalizedValue[index] ?? ""),
    [length, normalizedValue],
  );

  const updateCode = (nextChars: string[]) => {
    onChangeValue(nextChars.join("").slice(0, length));
  };

  const handleChangeText = (index: number, text: string) => {
    const filtered = sanitizeCode(text);
    const nextChars = [...chars];

    if (!filtered) {
      nextChars[index] = "";
      updateCode(nextChars);
      return;
    }

    const fillChars = filtered.split("").slice(0, length - index);

    fillChars.forEach((char, offset) => {
      nextChars[index + offset] = char;
    });

    updateCode(nextChars);

    const nextIndex = Math.min(index + fillChars.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key !== "Backspace") return;

    const nextChars = [...chars];

    if (nextChars[index]) {
      nextChars[index] = "";
      updateCode(nextChars);
      return;
    }

    if (index > 0) {
      nextChars[index - 1] = "";
      updateCode(nextChars);
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {chars.map((char, index) => {
        const isActive = focusedIndex === index;

        return (
          <TextInput
            key={`otp-cell-${index}`}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.cell,
              isActive && styles.cellActive,
              cellStyle,
              isActive && activeCellStyle,
              cellTextStyle,
            ]}
            value={char}
            onChangeText={(text) => handleChangeText(index, text)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(index, nativeEvent.key)
            }
            onFocus={() => setFocusedIndex(index)}
            onBlur={() =>
              setFocusedIndex((prev) => (prev === index ? null : prev))
            }
            keyboardType={keyboardType}
            autoCorrect={false}
            autoCapitalize="characters"
            maxLength={length}
            textAlign="center"
            textContentType={index === 0 ? "oneTimeCode" : "none"}
            importantForAutofill="yes"
            returnKeyType="done"
            selectTextOnFocus
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cell: {
    width: 46,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6C63FF",
    color: "#6C63FF",
    fontFamily: "montserratBold",
    fontSize: 38,
    includeFontPadding: false,
    textAlignVertical: "center",
    padding: 0,
    backgroundColor: "transparent",
  },
  cellActive: {
    borderWidth: 3,
  },
});
