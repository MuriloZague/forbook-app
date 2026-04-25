import Notification from "@/assets/images/Notification.svg";
import User2 from "@/assets/images/User.svg";
import AppTopHeader from "@/src/components/appTopHeader";
import ChatNotificationItem from "@/src/components/chatNotificationItem";
import { StyleSheet, View } from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  return (
    <SafeAreaView>
      <AppTopHeader
        title="Forbook"
        userContent={
          <View style={styles.userLogo}>
            <User2 width={22} height={22} />
          </View>
        }
        notificationContent={<Notification width={24} height={24} />}
        onUserPress={() => router.push("/profile")}
      />
      <View style={{marginTop: 20}}>
        <ChatNotificationItem
          avatarSource={require("../../assets/images/chat.png")}
          userName="Rafael Mori"
          message="Oiee, tudo bem??"
          timeLabel="12 min"
          unreadCount={12}
        />

        <ChatNotificationItem
          avatarSource={require("../../assets/images/chat.png")}
          userName="Rafael Mori2"
          message="Ainda está disponível?? eu gostaria de saber porque"
          timeLabel="18 min"
          unreadCount={2}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userLogo: {
    borderWidth: 2,
    borderColor: "#6c63ff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
