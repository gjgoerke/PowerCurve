import { useState, useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";

import { TrainingParams } from "@/types/types";
import LineChart from "./LineChart";
import LineChartBLE from "./LineChartBLE";
import WeightsCard from "./WeightsCard";
import { useBLEContext } from "@/context/BLEContext";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    weightsCardContainer: {
        marginBottom: 16,
    },
    chartContainer: {
        flex: 1
    },
});

interface TrainingProps {
    trainingParams: TrainingParams;
    bluetoothEnabled: boolean;
}

export default function Training ({trainingParams, bluetoothEnabled} : TrainingProps) {
    const [weightPack, setWeightPack] = useState<number[]>([]);
    const [timestampPack, setTimestampPack] = useState<number[]>([]); 

    /*
    * BLE Stuff
    * bluetoothEnabled == true is the normal mode. bluetoothEnabled == false reverts to a test data stream for development.
    */
    if(bluetoothEnabled) {
        const {
            weightPacket,
            timestampPacket,
        } = useBLEContext();
        useEffect(()=> {
            setWeightPack(weightPacket);
            setTimestampPack(timestampPacket);
        }, [timestampPacket]);
    } else {
        useEffect(() => {
            const newPacketRate = 188; // Rate (in milliseconds) at which a new packet of 15 weights and 15 timestamps is created.
            let seconds = 0;
            setInterval(() => {
                const weights = new Array(15).fill(0);
                const timestamps = new Array(15).fill(0);
                for(let i = 0; i < 15; i++) {
                    seconds += newPacketRate / 15000;
                    timestamps[i] = seconds
                    weights[i] = 45 + 3 * Math.sin( 4 * seconds);
                }
                setWeightPack(weights);
                setTimestampPack(timestamps);
            }, newPacketRate);
        }, [])
    }
    
    const [weights, setWeights] = useState<number[]>([]);
    const [timestamps, setTimestamps] = useState<number[]>([]);
    
    useEffect(() => {
        setWeights([...weights, ...weightPack].slice(-150));
        setTimestamps([...timestamps, ...timestampPack].slice(-150));
    }, [timestampPack])

    /*
    *   Sizing of Line Chart and Weights Card
    */
    const { height: screenHeight } = useWindowDimensions();
    const weightsCardRatio = 0.3; // 30% of screen
    const chartRatio = 1 - weightsCardRatio; // 70% of screen

    const weightsCardMargin = 8;
    const weightsCardPadding = 16;
    const weightsCardHeight = weightsCardRatio * screenHeight;

    const lineChartMarginTop = weightsCardHeight;
    const lineChartHeight = screenHeight - lineChartMarginTop;

    return (
        <View style={styles.container}>
            <View style={styles.container}>
                <View style={styles.weightsCardContainer}>
                    <WeightsCard 
                        weights={weights} 
                        height={weightsCardRatio * screenHeight}
                        margin={weightsCardMargin}
                        padding={weightsCardPadding}
                        />
                </View>
                <View style={styles.chartContainer}>
                    <LineChart 
                        trainingParams={trainingParams} 
                        weights={weights} 
                        timestamps={timestamps}
                        height={lineChartHeight}
                        marginTop={lineChartMarginTop}
                    />
                </View>
            </View>
        </View>
    );
}