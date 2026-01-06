import React from "react";
import { Stack } from "expo-router";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { createDbIfNeeded } from "@/utils/databaseUtils";
import { BLEProvider } from "@/context/BLEContext";

const theme = {
  ...DefaultTheme,
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SQLiteProvider databaseName="powercurve.db" onInit={createDbIfNeeded}>
          <BLEProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
              </Stack>
          </BLEProvider>
        </SQLiteProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
