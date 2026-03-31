import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import "react-native-reanimated";

import { fonts } from "@/assets/fonts/fonts";
import { TransitionProvider, useTransition } from "@/src/context/transition-context";
import BookmarkTransitionOverlay from "@/src/components/bookmarktransitionoverlay";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppContent() {
  const { progress, overlayRef } = useTransition();

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="announce"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "none",
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