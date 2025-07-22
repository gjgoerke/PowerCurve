import LineChart from "@/components/LineChart";
import LineChartBLE from "@/components/LineChartBLE";
import { TrainingParams } from "@/types/types";
import { useLocalSearchParams } from "expo-router";
import React, {useState, useCallback} from "react";
import { View, StyleSheet, Text } from "react-native";

export default function Train() {
    const params = useLocalSearchParams();
    
    const trainingParams: TrainingParams = {
        grip: params.grip as string,
        hand: params.hand as string,
        durationMinutes: Number(params.durationMinutes),
        durationSeconds: Number(params.durationSeconds),
        restMinutes: Number(params.restMinutes),
        restSeconds: Number(params.restSeconds),
        numberOfSets: Number(params.numberOfSets),
        trainingLoad: Number(params.trainingLoad),
        trainingLoadTolerance: Number(params.trainingLoadTolerance),
        timeTolerance: Number(params.timeTolerance),
    };

    return(
        <View>
            <LineChartBLE trainingParams={trainingParams}/>
        </View>
    );
}