import Training from "@/components/Training";
import { TrainingParams } from "@/types/types";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function Train() {
    const params = useLocalSearchParams();
    
    const trainingParams: TrainingParams = {
        grip: params.grip as string,
        hand: params.hand as string,
        durationMinutes: parseInt(params.durationMinutes as string),
        durationSeconds: parseInt(params.durationSeconds as string),
        restMinutes: parseInt(params.restMinutes as string),
        restSeconds: parseInt(params.restSeconds as string),
        numberOfSets: parseInt(params.numberOfSets as string),
        trainingLoad: parseInt(params.trainingLoad as string),
        trainingLoadTolerance: parseInt(params.trainingLoadTolerance as string),
        timeTolerance: parseInt(params.timeTolerance as string),
    };

    console.log(trainingParams)

    return(
        <View>
            <Training trainingParams={trainingParams} bluetoothEnabled={true} />
        </View>
    );
}