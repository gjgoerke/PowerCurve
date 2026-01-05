import { TrainingParams } from "@/types/types";
import { useEffect } from "react";

export default function useSimulationStream (
    setWeightPack: (value: React.SetStateAction<number[]>) => void,
    setTimestampPack: (value: React.SetStateAction<number[]>) => void,
    trainingParams: TrainingParams
) {
    const trainSecs = trainingParams.durationSeconds + 60 * trainingParams.durationMinutes;
    const restSecs = trainingParams.restSeconds + 60 * trainingParams.restMinutes;
    useEffect(() => {
        const newPacketRate = 188; // Rate (in milliseconds) at which a new packet of 15 weights and 15 timestamps is created
        let seconds = 0;
        let currentInterval = setInterval(() => {
            const weights = new Array(15).fill(0);
            const timestamps = new Array(15).fill(0);
            
                for(let i = 0; i < 15; i++) {
                    seconds += newPacketRate / 15000;
                    timestamps[i] = seconds
                    if(seconds % (trainSecs + restSecs) < trainSecs){ 
                        weights[i] = trainingParams.trainingLoad + 0.8 * trainingParams.trainingLoadTolerance * Math.sin( 4 * seconds) + 0.3 * Math.random();
                    }
                }
            setWeightPack(weights);
            setTimestampPack(timestamps);
        }, newPacketRate);
    }, []);
}