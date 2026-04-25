import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ChatNotificationItemProps {
  avatarSource: ImageSourcePropType;
  userName: string;
  message: string;
  timeLabel: string;
  unreadCount: number;
  onPress?: () => void;
}

export default function ChatNotificationItem({
  avatarSource,
  userName,
  message,
  timeLabel,
  unreadCount,
  onPress,
}: ChatNotificationItemProps) {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.container}
        onPress={onPress}
      >
        <View style={styles.contentRow}>
          <Image source={avatarSource} style={styles.avatar} />

          <View style={styles.textBlock}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.message} numberOfLines={1} ellipsizeMode="tail">
              {message} <Text style={styles.timeLabel}>- {timeLabel}</Text>
            </Text>
            <Text style={styles.unreadLabel}>
              ({unreadCount}) mensagens nao lidas
            </Text>
          </View>
        </View>

        <View style={styles.chevronWrapper}>
          <Ionicons name="chevron-forward" size={22} color="black" />
        </View>
      </TouchableOpacity>
      <View style={styles.line} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 12,
    justifyContent: "space-between",
    backgroundColor: "#e5e6e7",
    borderRadius: 26,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  line: {
    backgroundColor: "#a6a8aaa2",
    height: 1.4,
    marginVertical: 12,
    marginHorizontal: 32,
  },
  contentRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 70,
    height: 70,
    borderColor: "#6c63ff",
    borderWidth: 3,
    borderRadius: 999,
  },
  userName: {
    fontFamily: "montserratBold",
    fontSize: 18,
    marginBottom: 4,
  },
  message: {
    fontFamily: "montserratBold",
    fontSize: 14,
    marginBottom: 2,
    color: "#777777",
  },
  timeLabel: {
    fontFamily: "montserratRegular",
  },
  unreadLabel: {
    fontFamily: "montserratBold",
    fontSize: 12,
    color: "#ff6584",
  },
  chevronWrapper: {
    alignSelf: "center",
  },
});
