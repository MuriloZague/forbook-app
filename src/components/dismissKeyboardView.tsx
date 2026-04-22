import React from "react";
import { Keyboard, Platform, TouchableWithoutFeedback } from "react-native";

type DismissKeyboardViewProps = {
  children: React.ReactElement;
};

export default function DismissKeyboardView({
  children,
}: DismissKeyboardViewProps) {
  if (Platform.OS === "web") {
    return children;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {children}
    </TouchableWithoutFeedback>
  );
}
