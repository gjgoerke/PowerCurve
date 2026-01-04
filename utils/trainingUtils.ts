import { TrainingParams } from "@/types/types";

const a = 0.2;
const c = 0.2;
const f = 0.6;

const defaultTail = 0.15;
const defaultRep4 = 0.25;
const defaultRep2 = 0.4;

export function computeSetDuration(trainingParams: TrainingParams, setNumber: number) {
    
    return trainingParams.durationMinutes * 60 + trainingParams.durationSeconds - setNumber + 1;
}

export function computeEstimatedFailureTimes (firstSetTime: number, tail: number, rep4: number, rep2: number) {
    // Computes the failure times based on rep1 performance and endurance (tail), power-endurance (rep 4),
    //  and power (rep2) variables.
    const b =  calculateTailRelatedValue(tail);
    const d = calculateRep4RelatedValue(rep4, tail);
    const g = calculateRep2RelatedValue(rep2, rep4, tail);
    let values = [];
    for (let i = 0; i <= 20; i++) {
        values.push((a * Math.exp(-b * i) + c * Math.exp(-d * i) + f * Math.exp(-g * i)) * firstSetTime);
    }
    return values;
}

function calculateTailRelatedValue(tail: number) {
    // Calculate the "Tail" related value
    return -((Math.log(tail/a)) / 19);
}

function calculateRep4RelatedValue(rep4: number, tail: number) {
    const x = 3;
    let b = calculateTailRelatedValue(tail);
  
    let d = -((1 / x) * Math.log(1/c * (rep4 - a * Math.exp(-b * x))));
    let d_min = a * Math.exp(-b * x);
    
    return d;
}

function calculateRep2RelatedValue(rep2: number, rep4: number, tail :number) {
    const x = 1;
    const d = calculateRep4RelatedValue(rep4, tail)
    const b = calculateTailRelatedValue(tail);
    
    // Calculate the "Rep 2" related value
    return -(1 / x) * Math.log((1 / f)*(rep2 - (a * Math.exp(-b * x)) - (c * Math.exp(-d * x))));
  };