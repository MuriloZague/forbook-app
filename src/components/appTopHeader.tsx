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

      {showShadow ? (
        <View pointerEvents="none" style={styles.bottomShadow} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "visible",
    backgroundColor: "#F0F2F5",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 16,
    paddingTop: 12,
    backgroundColor: "#F0F2F5",
    zIndex: 2,
  },
  bottomShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 1,
    backgroundColor: "#F0F2F5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  title: {
    fontFamily: "lexendBlack",
    fontSize: 30,
    color: "#000",
  },
});
