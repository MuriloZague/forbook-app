import React from "react";
import { Platform, View } from "react-native";

type DismissKeyboardViewProps = {
  children: React.ReactElement;
};

export default function DismissKeyboardView({
  children,
}: DismissKeyboardViewProps) {
  if (Platform.OS === "web") {
    return children;
  }

  // Previously this component dismissed the keyboard on every touch end
  // which caused inputs to immediately lose focus when tapped. Keep a
  // transparent container only — explicit dismissal should be handled by
  // screens where desired.
  return <View style={{ flex: 1 }}>{children}</View>;
}
