import { useState, useEffect, useMemo, useRef, useReducer } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Text as PaperText, useTheme} from "react-native-paper";
import { router } from "expo-router";

import { TrainingParams } from "@/types/types";
import LineChart from "./LineChart";
import WeightsCard from "./WeightsCard";
import { useBLEContext } from "@/context/BLEContext";
import { computeSetDuration } from "@/utils/trainingUtils";
import useSimulationStream from "@/hooks/useSimulationStream";

interface TrainingProps {
    trainingParams: TrainingParams;
}

interface TrainingState {
    currentSet: number;
    timer: number;
    maxWeight: number;
    phase: 'workoutNotBegun' | 'training' | 'resting' | 'workoutComplete';
    weightPacket: number[];
    timestampPacket: number[];
    trainingParams: TrainingParams;
    intervalID: number;
    setAverages: number[];
    currentSetNumMeasurements: number;
    currentSetSumOfWeights: number;
}

type TrainingAction = 
  | { type: 'ABOVE_BEGIN_THRESHOLD' }
  | { type: 'BELOW_FAILURE_THRESHOLD' }
  | { type: 'TIMER_TICK' }
  | { type: 'UPDATE_MAX_WEIGHT'; newMax: number }
  | { type: 'UPDATE_WEIGHT_PACKET'; weightPacket: number[] };

const trainingReducer = (state: TrainingState, action: TrainingAction) => {

    // Plan on getting rid of the seperation of minutes and seconds!
    const trainingDurationInSeconds = state.trainingParams.durationMinutes * 60 + state.trainingParams.durationSeconds;
    const restDurationInSeconds  = state.trainingParams.restMinutes * 60 + state.trainingParams.restSeconds;

    switch (action.type) {
        case "TIMER_TICK": {
            const newTimer = state.timer - 1;
            if (newTimer === 0 && state.phase === 'resting') {
                return {
                    ...state,
                    timer: trainingDurationInSeconds,
                    phase: 'training' as const,
                    currentSetNumMeasurements: 0,
                    currentSetSumOfWeights: 0
                };
            }
            return {
                ...state,
                timer: newTimer
            };
        }
        case 'ABOVE_BEGIN_THRESHOLD': {
            if (state.phase === 'workoutNotBegun') {
                console.log('begin training!')
                return {
                    ...state,
                    currentSet: state.currentSet + 1,
                    phase: 'training' as const,
                    timer: trainingDurationInSeconds
                };
            }
            return state;
        }
        case "BELOW_FAILURE_THRESHOLD": {
            const endSet = 
                (state.phase === 'training') &&
                (trainingDurationInSeconds - state.timer) > 5 &&
                Math.max(...state.weightPacket) < 0.5 * state.trainingParams.trainingLoad;
            
            if(endSet && state.currentSet >= state.trainingParams.numberOfSets) {
                console.log('workout complete! currentSet:', state.currentSet, 'numberOfSets:', state.trainingParams.numberOfSets);
                return {
                    ...state,
                    phase: 'workoutComplete' as const
                };
            } else if (endSet){
                console.log('endSet', trainingDurationInSeconds - state.timer, ' seconds');
                return {
                    ...state,
                    currentSet: state.currentSet + 1,
                    phase: 'resting' as const,
                    timer: restDurationInSeconds
                };
            }
            return state;
        }
        
        case "UPDATE_MAX_WEIGHT": {
            return {
                ...state,
                maxWeight: action.newMax
            };
        }
        case "UPDATE_WEIGHT_PACKET": {
            const newCurrentSetSumOfWeights = state.currentSetSumOfWeights + action.weightPacket.reduce((previousValue: number, currentValue: number) => (previousValue + currentValue), 0);
            const newCurrentSetNumMeasurements = state.currentSetNumMeasurements + action.weightPacket.length;
            
            const newSetAverages = [...state.setAverages];
            if (state.currentSet > 0) { // Only update if we're in a set
                newSetAverages[state.currentSet - 1] = newCurrentSetSumOfWeights / newCurrentSetNumMeasurements;
            }
            
            return {
                ...state,
                weightPacket: action.weightPacket,
                currentSetSumOfWeights: newCurrentSetSumOfWeights,
                currentSetNumMeasurements: newCurrentSetNumMeasurements,
                setAverages: newSetAverages
            };
        }
        default:
            return state;
    }
}

export default function Training ({trainingParams} : TrainingProps) {
    const [weightPack, setWeightPack] = useState<number[]>([]);
    const [timestampPack, setTimestampPack] = useState<number[]>([]); 

    if(!trainingParams.simulationStream) {
        const {
            weightPacket,
            timestampPacket,
        } = useBLEContext();
        useEffect(()=> {
            setWeightPack(weightPacket);
            setTimestampPack(timestampPacket);
        }, [timestampPacket]);
    } else {
        useSimulationStream(setWeightPack, setTimestampPack, trainingParams);
    }

    /*
    *   Training Stuff
    */

    const createInitialState = useMemo(() => ({
        currentSet: 0,
        timer: -1,
        maxWeight: 0,
        phase: 'workoutNotBegun' as const,
        weightPacket: new Array(15).fill(0),
        timestampPacket: new Array(15).fill(0),
        trainingParams: trainingParams,
        intervalID: -1,
        setAverages: new Array(trainingParams.numberOfSets).fill(0),
        currentSetNumMeasurements: 0,
        currentSetSumOfWeights: 0,
    }), [trainingParams]);

    const [state, dispatch] = useReducer(trainingReducer, createInitialState);
    const intervalID = useRef<number | null>(null);

    // Start the timer interval once
    useEffect(() => {
        intervalID.current = setInterval(() => {
            dispatch({type: 'TIMER_TICK'});
        }, 1000);

        // Cleanup on unmount
        return () => {
            if (intervalID.current) {
                clearInterval(intervalID.current);
            }
        };
    }, []);

    useEffect(() => {
        const weightPackMax = Math.max(...weightPack);
        
        // Update the state's weight packet
        dispatch({type: 'UPDATE_WEIGHT_PACKET', weightPacket: weightPack});
        
        if(weightPackMax > state.maxWeight) dispatch({type: 'UPDATE_MAX_WEIGHT', newMax: weightPackMax});
        if(weightPackMax > trainingParams.trainingLoad - trainingParams.trainingLoadTolerance){
            dispatch({ type: 'ABOVE_BEGIN_THRESHOLD' });
        } 
        if(weightPackMax > 0 && weightPackMax < 0.5 * trainingParams.trainingLoad){
            dispatch({type: 'BELOW_FAILURE_THRESHOLD'});
        } 
    }, [weightPack, trainingParams]);

    useEffect(() => {
        console.log('Phase changed to:', state.phase, 'Current set:', state.currentSet);
        if(state.phase === 'workoutComplete') {
            console.log('workout complete: average weights: ', state.setAverages)
            router.replace('/end_training');
        }
    }, [state.phase])

    /*
    *   Sizing of Line Chart and Weights Card
    */
    const { height: screenHeight, width: screenWidth } = useWindowDimensions();
    const weightsCardRatio = 0.3; // 30% of screen
    const chartRatio = 1 - weightsCardRatio; // 70% of screen

    const weightsCardMargin = 8;
    const weightsCardPadding = 16;
    const weightsCardHeight = weightsCardRatio * screenHeight;

    const lineChartMarginTop = weightsCardHeight - 100;
    const lineChartHeight = 0.7 * screenHeight - 45;

    /*
    *   StyleSheets
    */
    const theme = useTheme();
    const styles = useMemo(() => StyleSheet.create({
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
        timerContainer: {
            position: 'absolute',
            top: screenHeight * 0.5,
            left: screenWidth * 0.5 - 25,
            justifyContent: 'center',
            alignItems: 'center',
        },
        timerDescriptorText: {
            color: theme.colors.secondary,
            fontSize: 14
        },
        timerNumberText: {
            color: theme.colors.primary,
            fontSize: 100,
            fontWeight: 700
        },
    }), [theme]);

    return (
        <View style={styles.container}>
            <View style={styles.weightsCardContainer}>
                <WeightsCard 
                    lastWeight={state.weightPacket[state.weightPacket.length - 1]}
                    currentSet={state.currentSet}
                    numSets={trainingParams.numberOfSets}
                    currentSetAvgWeight={state.setAverages[state.currentSet - 1]}
                    currentPhase={state.phase}
                    height={weightsCardRatio * screenHeight}
                    margin={weightsCardMargin}
                    padding={weightsCardPadding}
                />
            </View>
            <View style={styles.chartContainer}>
                <LineChart 
                    trainingParams={trainingParams} 
                    weightPacket={weightPack} 
                    timestampPacket={timestampPack}
                    height={lineChartHeight}
                    marginTop={lineChartMarginTop}
                />
            </View>
            {
                state.currentSet > 0 && 
                <View style={styles.timerContainer}>
                    <PaperText>{state.phase === 'training' && "Pull!"}{state.phase === 'resting' && 'Rest'}</PaperText>
                    <PaperText style={styles.timerNumberText}>{state.timer}</PaperText>
                </View>
            }
        </View>
    );
}