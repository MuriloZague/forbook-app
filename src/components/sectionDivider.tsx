import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface SectionDividerProps {
  style?: StyleProp<ViewStyle>;
}

export default function SectionDivider({ style }: SectionDividerProps) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
});
