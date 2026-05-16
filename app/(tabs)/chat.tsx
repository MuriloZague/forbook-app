import Notification from "@/assets/images/Notification.svg";
import User2 from "@/assets/images/User.svg";
import AppTopHeader from "@/src/components/appTopHeader";
import ChatNotificationItem from "@/src/components/chatNotificationItem";
import { useAuth } from "@/src/hooks/useAuth";
import { ApiError } from "@/src/services/api";
import { userService, type UserProfile } from "@/src/services/user.service";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function loadUser() {
        if (!isAuthenticated) {
          return;
        }

        try {
          setUserError(null);
          const me = await userService.getMe();

          if (!cancelled) {
            setUser(me);
          }
        } catch (error) {
          if (!cancelled) {
            setUserError(
              error instanceof ApiError
                ? error.message
                : "Não foi possível carregar o perfil.",
            );
          }
        }
      }

      loadUser();

      return () => {
        cancelled = true;
      };
    }, [isAuthenticated]),
  );

  return (
    <SafeAreaView>
      <AppTopHeader
        title="Forbook"
        userContent={
          <View style={styles.userLogo}>
            {user?.ProfileImage?.url ? (
              <Image
                source={{ uri: user.ProfileImage.url }}
                style={styles.userImage}
                contentFit="cover"
              />
            ) : (
              <User2 width={22} height={22} />
            )}
          </View>
        }
        notificationContent={<Notification width={24} height={24} />}
        onUserPress={() => router.push("/profile")}
      />
      {userError ? (
        <View style={styles.errorRow}>
          <Text style={styles.userErrorText}>{userError}</Text>
        </View>
      ) : null}
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
    overflow: "hidden",
  },
  userImage: {
    width: "100%",
    height: "100%",
  },
  errorRow: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  userErrorText: {
    fontFamily: "montserratRegular",
    color: "#e74c3c",
    fontSize: 12,
  },
});
