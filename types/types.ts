export interface TrainingParams {
    grip: string;
    hand: string;
    durationMinutes: number;
    durationSeconds: number;
    restMinutes: number;
    restSeconds: number;
    numberOfSets: number;
    trainingLoad: number;
    trainingLoadTolerance: number;
    timeTolerance: number;
    simulationStream: boolean;
}

export interface WorkoutResults {
    averageWeights: number[];
    timesToFailure: number[];
}

export interface ResultItem {
    set: number;
    averageWeight: number;
    timeToFailure: number;
}

export type Workout = {
    grip: string
    params: TrainingParams | null;
    results: ResultItem[];
    comment: string;
}

/*
*   Models
*/

export type Grip = {
    id: number;
    name: string;
}