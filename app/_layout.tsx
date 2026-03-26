import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import { fonts } from "@/assets/fonts/fonts";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    lexend: fonts.lexend,
    lexendBlack: fonts.lexendBlack,
    lexendBold: fonts.lexendBold,
    lexendExtraBold: fonts.lexendExtraBold,
    lexendRegular: fonts.lexendRegular,
    montserrat: fonts.montserrat,
    montserratBlack: fonts.lexendBlack,
    montserratBold: fonts.montserratBold,
    montserratExtraBold: fonts.montserratExtraBold,
    montserratRegular: fonts.montserratRegular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="login" options={{ headerShown: false }} />

        <Stack.Screen name="cadastro" options={{ headerShown: false }} />

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
            headerShown: true,
          }}
        />
      </Stack>

      <StatusBar style="auto" />
    </>
  );
}
