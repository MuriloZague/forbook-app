import { Ionicons } from "@expo/vector-icons";
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

type IconName = keyof typeof Ionicons.glyphMap;

interface ListItemRowProps {
  label: string;
  onPress?: () => void;
  iconName?: IconName;
  iconSize?: number;
  iconColor?: string;
  trailing?: React.ReactNode;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
  leftContentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export default function ListItemRow({
  label,
  onPress,
  iconName,
  iconSize = 24,
  iconColor = "#6C63FF",
  trailing,
  activeOpacity = 0.7,
  style,
  leftContentStyle,
  labelStyle,
}: ListItemRowProps) {
  const content = (
    <>
      <View style={[styles.leftContent, leftContentStyle]}>
        {iconName ? (
          <Ionicons name={iconName} size={iconSize} color={iconColor} />
        ) : null}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </View>
      {trailing}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        activeOpacity={activeOpacity}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    marginBottom: 8,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  label: {
    fontFamily: "montserratBold",
    fontSize: 16,
    color: "#333",
    paddingTop: 2,
    flex: 1,
  },
});
