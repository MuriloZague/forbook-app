import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { fonts } from "@/assets/fonts/fonts";
import BookmarkTransitionOverlay from "@/src/components/bookmarktransitionoverlay";
import { AuthProvider } from "@/src/context/auth-context";
import {
    TransitionProvider,
    useTransition,
} from "@/src/context/transition-context";
import { useAuth } from "@/src/hooks/useAuth";

export const unstable_settings = {
  anchor: "(tabs)",
};

const PUBLIC_ROUTES = new Set([
  "index",
  "login",
  "register",
  "email-confirmation",
  "confirm-login",
  "forgot-password-email",
  "forgot-password-code",
  "forgot-password-password",
  "forgot-password-confirm",
]);

function AuthRouteGuard() {
  const { isAuthenticated, isHydrated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const firstSegment = segments[0] ?? "index";
    const isPublicRoute = PUBLIC_ROUTES.has(firstSegment);

    if (isAuthenticated && isPublicRoute) {
      router.replace("/(tabs)/home");
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router, segments]);

  return null;
}

function AppContent() {
  const { progress, overlayRef } = useTransition();
  const { isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      <AuthRouteGuard />

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
          name="email-confirmation"
          options={{ headerShown: false, animation: "ios_from_right" }}
        />
        <Stack.Screen
          name="confirm-login"
          options={{ headerShown: false, animation: "ios_from_right" }}
        />
        <Stack.Screen
          name="forgot-password-email"
          options={{ headerShown: false, animation: "ios_from_right" }}
        />
        <Stack.Screen
          name="forgot-password-code"
          options={{ headerShown: false, animation: "ios_from_right" }}
        />
        <Stack.Screen
          name="forgot-password-password"
          options={{ headerShown: false, animation: "ios_from_right" }}
        />
        <Stack.Screen
          name="forgot-password-confirm"
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
          name="book-details"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
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
          name="edit-profile"
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
    <AuthProvider>
      <TransitionProvider>
        <AppContent />
      </TransitionProvider>
    </AuthProvider>
  );
}
