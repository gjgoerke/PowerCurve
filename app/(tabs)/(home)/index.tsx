import React, {useEffect, useState} from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

import { useBLEContext } from "@/context/BLEContext";
import LineChart from "@/components/LineChart";
import { router } from "expo-router";

export default function Index() {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    weightPacket,
    timestampPacket,
    tareConnectedDevice,
  } = useBLEContext();
  const [weights, setWeights] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<number[]>([]);


  useEffect(() => {
    setWeights([...weights, ...weightPacket].slice(-150));
    setTimestamps([...timestamps, ...timestampPacket].slice(-150));
  }, [timestampPacket])
  
  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const onLiveDataPress = () => {
    router.navigate('/(tabs)/(home)/live_data');
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{flexDirection: 'row', margin: 10}}>
        <Button onPress={onLiveDataPress} mode="contained">Live Data</Button>
      </View>
      <Button onPress={scanForDevices} mode="contained">Scan for Devices</Button>
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
