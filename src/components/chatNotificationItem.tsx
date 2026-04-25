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
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.contentRow}>
        <Image source={avatarSource} style={styles.avatar} />

        <View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.message}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 20,
    justifyContent: "space-between",
    borderBottomColor: "#a6a8aaa2",
    borderBottomWidth: 1,
    paddingBottom: 20,
  },
  contentRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
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
