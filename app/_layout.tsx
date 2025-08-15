import { Stack } from "expo-router";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { BLEProvider } from "@/context/BLEContext";

const theme = {
  ...DefaultTheme,
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <BLEProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </BLEProvider>
    </PaperProvider>
  );
}
