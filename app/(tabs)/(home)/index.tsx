import React, {useEffect, useState} from "react";
import { Text, View, StyleSheet } from "react-native";
import { Button, Card, Text as PaperText } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";


import { useBLEContext } from "@/context/BLEContext";
import LineChart from "@/components/LineChart";
import { router } from "expo-router";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		justifyContent: 'center',
	},
	gridContainer: {
		flex: 1,
		justifyContent: 'space-around',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 16,
	},
	card: {
		height: '100%',
	},
  cardContent: {
    alignContent: 'center',
    justifyContent: 'center'
  }
});

export default function Index() {
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
	const [weights, setWeights] = useState<number[]>([]);
	const [timestamps, setTimestamps] = useState<number[]>([]);


	useEffect(() => {
		setWeights([...weights, ...weightPacket].slice(-150));
		setTimestamps([...timestamps, ...timestampPacket].slice(-150));
	}, [timestampPacket])

	const onLiveDataPress = () => {
		router.navigate('/(tabs)/(home)/live_data');
	}

	return (
		<View style={styles.container}>
			<View style={styles.gridContainer}>
				<View style={styles.row}>
					<Card style={styles.card} onPress={onLiveDataPress} mode="contained">
						<Card.Title title="Live Data"/>
            <Card.Content style={styles.cardContent}>
            <Ionicons name="pulse-outline" size={92}></Ionicons>
            </Card.Content>
					</Card>
					<Card style={styles.card} mode="contained">
						<Card.Title title="Train"/>
            <Card.Content>
              <Ionicons name="barbell-outline" size={92}></Ionicons>
            </Card.Content>
					</Card>
				</View>
				<View style={styles.row}>
					<Card style={styles.card} mode="contained">
						<Card.Title title="Grips"/>
            <Card.Content>
            <Ionicons name="hand-right-outline" size={92}></Ionicons>
            </Card.Content>
					</Card>
					<Card style={styles.card} mode="contained">
						<Card.Title title="Power Curve"/>
            <Card.Content>
            <Ionicons name="stats-chart-outline" size={92}></Ionicons>
            </Card.Content>
					</Card>
				</View>
			</View>
			{/* <Button onPress={scanForDevices} mode="contained">Scan for Devices</Button>
			{allDevices.map((device) => (
				<Button  key={device.name} onPress={() => connectToDevice(device)}>{device.name}</Button>
			))}
			{connectedDevice? 
				<>
					<Text>{weightPacket[14]}</Text> 
					<Button onPress={tareConnectedDevice}>Tare</Button>
				</>
			: <></>} */}

		</View>
	);
}
