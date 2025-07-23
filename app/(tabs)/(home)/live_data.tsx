import React, {useEffect, useState} from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

import LineChart from "@/components/LineChart";
import { useBLEContext } from "@/context/BLEContext";
import LineChartBLE from "@/components/LineChartBLE";

export default function LiveData() {
  const {
    requestPermissions,
    scanForDevices,
    allDevices,
    connectToDevice,
    connectedDevice,
    weightPacket,
    timestampPacket,
    tareConnectedDevice,
  } = useBLEContext();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button onPress={scanForDevices}>Connect to Tindeq</Button>
      {allDevices.map((device) => (
        <Button  key={device.name} onPress={() => connectToDevice(device)}>{device.name}</Button>
      ))}
      {connectedDevice? 
        <>
            <Text>{weightPacket[14]}</Text> 
            <Button onPress={tareConnectedDevice}>Tare</Button>
        </>
      : <></>}

    </View>
  );
}
