import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

import Training from "@/components/Training";
import { TrainingParams } from "@/types/types";
import { SafeAreaView } from "react-native-safe-area-context";


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
        simulationStream: params.simulationStream === 'true',
    };

    console.log(trainingParams)

    return(
        <SafeAreaView>
            <Training trainingParams={trainingParams}/>
        </SafeAreaView>
    );
}