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

interface AppTopHeaderProps {
  title: string;
  onUserPress?: () => void;
  onNotificationPress?: () => void;
  userContent?: React.ReactNode;
  notificationContent?: React.ReactNode;
  showShadow?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  userContainerStyle?: StyleProp<ViewStyle>;
  notificationContainerStyle?: StyleProp<ViewStyle>;
}

export default function AppTopHeader({
  title,
  onUserPress,
  onNotificationPress,
  userContent,
  notificationContent,
  showShadow = true,
  containerStyle,
  titleStyle,
  userContainerStyle,
  notificationContainerStyle,
}: AppTopHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, containerStyle]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onUserPress}
          style={userContainerStyle}
        >
          {userContent ? (
            userContent
          ) : (
            <Ionicons name="person-outline" size={22} color="#6c63ff" />
          )}
        </TouchableOpacity>

        <Text style={[styles.title, titleStyle]}>{title}</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNotificationPress}
          style={notificationContainerStyle}
        >
          {notificationContent ? (
            notificationContent
          ) : (
            <Ionicons name="notifications-outline" size={28} color="#6c63ff" />
          )}
        </TouchableOpacity>
      </View>

      {showShadow ? <View style={styles.shadow} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#F0F2F5",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 16,
    paddingTop: 12,
  },
  shadow: {
    height: 2,
    backgroundColor: "#0000007a",
    opacity: 0.25,
  },
  title: {
    fontFamily: "lexendBlack",
    fontSize: 30,
    color: "#000",
  },
});
