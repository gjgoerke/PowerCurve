import { TrainingParams } from "@/types/types";

export function computeSetDuration(trainingParams: TrainingParams, setNumber: number) {
    return trainingParams.durationMinutes * 60 + trainingParams.durationSeconds - setNumber + 1;
}