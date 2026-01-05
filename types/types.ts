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

/*
*   Models
*/

export type Workout = {
    grip: string
    params: TrainingParams | null;
    results: ResultItem[];
    comment: string;
}

export type WorkoutRow = {
    id: number;
    grip: number;
    trainingParams: TrainingParams;
    trainingResults: ResultItem[];
    comment: string;
    timestamp: string;
}

export type Grip = {
    id: number;
    name: string;
}