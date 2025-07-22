import LineChart from "@/components/LineChart";
import LineChartBLE from "@/components/LineChartBLE";
import { TrainingParams } from "@/types/types";
import React, {useState, useEffect} from "react";
import { View, StyleSheet, Text } from "react-native";

export default function TrainingTest() {

    const trainingParams: TrainingParams = {
        grip: "20mm edge",
        hand: "left",
        durationMinutes: 1,
        durationSeconds: 0,
        restMinutes: 0,
        restSeconds: 20,
        numberOfSets: 10,
        trainingLoad: 50,
        trainingLoadTolerance: 5,
        timeTolerance: 5,
    };

    const [weightPacket, setWeightPacket] = useState<number[]>([]);
    const [timestampPacket, setTimestampPacket] = useState<number[]>([]); 
    
    const [weights, setWeights] = useState<number[]>([]);
    const [timestamps, setTimestamps] = useState<number[]>([]);

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
            setWeightPacket(weights);
            setTimestampPacket(timestamps);
        }, newPacketRate);

    }, [])

    useEffect(() => {
        setWeights([...weights, ...weightPacket].slice(-150));
        setTimestamps([...timestamps, ...timestampPacket].slice(-150));
      }, [timestampPacket])

    return(
        <View>
            <LineChart trainingParams={trainingParams} weights={weights} timestamps={timestamps}/>
        </View>
    );
}