import React, {useState} from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import useBLE from "@/hooks/useBLE";

import LineChart from "@/components/LineChart";

export default function Index() {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    force,
    disconnectFromDevice,
    tareConnectedDevice,
  } = useBLE();

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LineChart/>
      <Button onPress={scanForDevices}>Connect to Tindeq</Button>
      {allDevices.map((device) => (
        <Button  key={device.name} onPress={() => connectToDevice(device)}>{device.name}</Button>
      ))}
      {connectedDevice? 
        <>
            <Text>{force * 2.20462}</Text> 
            <Button onPress={tareConnectedDevice}>Tare</Button>
        </>
      : <></>}

    </View>
  );
}
