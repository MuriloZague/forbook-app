import Notification from "@/assets/images/Notification.svg";
import User2 from "@/assets/images/User.svg";
import AppTopHeader from "@/src/components/appTopHeader";
import { StyleSheet, Text, View } from "react-native";

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
        notificationContent={<Notification width={28} height={28} />}
        onUserPress={() => router.push("/profile")}
      />
      <Text>CHAT PAGE</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userLogo: {
    borderWidth: 2,
    borderColor: "#6c63ff",
    borderRadius: 20, // opcional - para arredondar as bordas
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
