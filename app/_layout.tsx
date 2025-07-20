import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { BLEProvider } from "@/context/BLEContext";

export default function RootLayout() {
  return (
    <PaperProvider>
      <BLEProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </BLEProvider>
    </PaperProvider>
  );
}
