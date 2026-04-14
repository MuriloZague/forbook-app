import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { fonts } from "@/assets/fonts/fonts";
import BookmarkTransitionOverlay from "@/src/components/bookmarktransitionoverlay";
import {
  TransitionProvider,
  useTransition,
} from "@/src/context/transition-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppContent() {
  const { progress, overlayRef } = useTransition();

  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, animation: "ios_from_right" }}
        />
        <Stack.Screen
          name="login"
          options={{ headerShown: false, animation: "ios_from_right" }}
        />
        <Stack.Screen
          name="register"
          options={{ headerShown: false, animation: "ios_from_right" }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="announce"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
        <Stack.Screen
          name="terms"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            animation: "ios_from_right",
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            animation: "ios_from_right",
          }}
        />
        <Stack.Screen
          name="politics"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="help"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="myannounces"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="mypurchases"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="favorites"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="myratings"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="viewhistory"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
      </Stack>

      <BookmarkTransitionOverlay ref={overlayRef} progress={progress} />

      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    lexendBlack: fonts.lexendBlack,
    lexendBold: fonts.lexendBold,
    lexendRegular: fonts.lexendRegular,
    montserratBlack: fonts.lexendBlack,
    montserratBold: fonts.montserratBold,
    montserratRegular: fonts.montserratRegular,
  });

  if (!fontsLoaded) return null;

  return (
    <TransitionProvider>
      <AppContent />
    </TransitionProvider>
  );
}
