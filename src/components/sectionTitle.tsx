import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";

interface SectionTitleProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export default function SectionTitle({ children, style }: SectionTitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "lexendRegular",
    fontSize: 16,
    color: "#a6a8aa",
  },
});
