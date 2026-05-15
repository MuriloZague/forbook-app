import React, { useRef } from "react";
import { Keyboard, Platform, View, PanResponder } from "react-native";

type DismissKeyboardViewProps = {
  children: React.ReactElement;
};

export default function DismissKeyboardView({
  children,
}: DismissKeyboardViewProps) {
  if (Platform.OS === "web") {
    return children;
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,
      onShouldBlockNativeResponder: () => false,
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      onTouchEnd={() => {
        Keyboard.dismiss();
      }}
      style={{ flex: 1 }}
    >
      {children}
    </View>
  );
}
