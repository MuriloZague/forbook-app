import React from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

type OptionItem = string | { key: string; label: string };

interface OptionChipsProps {
  options: OptionItem[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  chipStyle?: StyleProp<ViewStyle>;
  selectedChipStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
}

export default function OptionChips({
  options,
  selectedValue,
  onSelect,
  containerStyle,
  chipStyle,
  selectedChipStyle,
  textStyle,
  selectedTextStyle,
}: OptionChipsProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((option) => {
        const key = typeof option === "string" ? option : option.key;
        const label = typeof option === "string" ? option : option.label;
        const isSelected = selectedValue === key || selectedValue === label;

        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.chip,
              chipStyle,
              isSelected && styles.selectedChip,
              isSelected && selectedChipStyle,
            ]}
            activeOpacity={0.7}
            onPress={() => onSelect(label)}
          >
            <Text
              style={[
                styles.chipText,
                textStyle,
                isSelected && styles.selectedChipText,
                isSelected && selectedTextStyle,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#6C63FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  selectedChip: {
    backgroundColor: "#6C63FF",
  },
  chipText: {
    color: "#6C63FF",
    fontSize: 13,
    fontFamily: "montserratBold",
  },
  selectedChipText: {
    color: "#fff",
  },
});
