import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

interface ScreenHeaderProps {
  title: string;
  onBackPress?: () => void;
  iconName?: IconName;
  iconSize?: number;
  iconColor?: string;
  titleColor?: string;
  titleFontFamily?: string;
  titleFontSize?: number;
  borderBottomColor?: string;
  borderBottomWidth?: number;
  rightContent?: React.ReactNode;
  rightPlaceholderWidth?: number;
  containerStyle?: StyleProp<ViewStyle>;
  backButtonStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export default function ScreenHeader({
  title,
  onBackPress,
  iconName = "arrow-back",
  iconSize = 24,
  iconColor = "#000",
  titleColor = "#000",
  titleFontFamily = "lexendBold",
  titleFontSize = 20,
  borderBottomColor = "#e0e0e0",
  borderBottomWidth = 1,
  rightContent,
  rightPlaceholderWidth = 24,
  containerStyle,
  backButtonStyle,
  titleStyle,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor, borderBottomWidth },
        containerStyle,
      ]}
    >
      <TouchableOpacity
        onPress={handleBackPress}
        style={[styles.backButton, backButtonStyle]}
      >
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
      </TouchableOpacity>

      <Text
        style={[
          styles.title,
          {
            color: titleColor,
            fontFamily: titleFontFamily,
            fontSize: titleFontSize,
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>

      {rightContent ? (
        rightContent
      ) : (
        <View style={{ width: rightPlaceholderWidth }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontFamily: "lexendBold",
    fontSize: 20,
  },
});
