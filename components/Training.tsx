import { useState, useEffect, useMemo, useRef, useReducer } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Text as PaperText, useTheme} from "react-native-paper";

import { TrainingParams } from "@/types/types";
import LineChart from "./LineChart";
import WeightsCard from "./WeightsCard";
import { useBLEContext } from "@/context/BLEContext";
import { computeSetDuration } from "@/utils/trainingUtils";

interface TrainingProps {
    trainingParams: TrainingParams;
    bluetoothEnabled: boolean;
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
}

type TrainingAction = 
  | { type: 'ABOVE_THRESHOLD' }
  | { type: 'BELOW_THRESHOLD' }
  | { type: 'TIMER_TICK' }
  | { type: 'UPDATE_MAX_WEIGHT'; newMax: number }
  | { type: 'UPDATE_WEIGHT_PACKET'; weightPacket: number[] };

const trainingReducer = (state: TrainingState, action: TrainingAction) => {

    // Plan on getting rid of the seperation of minutes and seconds!
    const trainingDurationInSeconds = state.trainingParams.durationMinutes * 60 + state.trainingParams.durationSeconds;
    const restDurationInSeconds  = state.trainingParams.restMinutes * 60 + state.trainingParams.restSeconds;

    switch (action.type) {
        case "TIMER_TICK": {
            console.log('tick ', state.timer);
            state.timer -= 1;
            if (state.timer === 0 && state.phase === 'resting') {
                state.phase = 'training';
                state.timer = trainingDurationInSeconds;
            }
            return state;
        }
        case 'ABOVE_THRESHOLD': {
            if (state.phase === 'workoutNotBegun') {
                console.log('begin training!')
                state.currentSet += 1;
                state.phase = 'training';
                state.timer = trainingDurationInSeconds;
                return state;
            }
        }
        case "BELOW_THRESHOLD": {
            const endSet = 
                (state.phase === 'training') &&
                (trainingDurationInSeconds - state.timer) > 5 &&
                Math.max(...state.weightPacket) < 0.5 * state.trainingParams.trainingLoad;
            if(endSet && state.currentSet === state.trainingParams.numberOfSets) {
                console.log('end workout');
                state.phase = 'workoutComplete';
                // endWorkout?
            } else if (endSet){
                console.log('endSet', trainingDurationInSeconds - state.timer)
                state.currentSet += 1;
                state.phase = 'resting';
                state.timer = restDurationInSeconds;
            }
            return state;
        }
        
        case "UPDATE_MAX_WEIGHT": {
            state.maxWeight = action.newMax;
            return state;
        }
        case "UPDATE_WEIGHT_PACKET": {
            state.weightPacket = action.weightPacket;
            return state;
        }
        default:
            return state;
    }
}

export default function Training ({trainingParams, bluetoothEnabled} : TrainingProps) {
    const [weightPack, setWeightPack] = useState<number[]>([]);
    const [timestampPack, setTimestampPack] = useState<number[]>([]); 
    const [lastWeight, setLastWeight] = useState<number>(0);
    const [lastTime, setLastTime] = useState<number>(0);


    /*
    * BLE Stuff
    * bluetoothEnabled == true is the normal mode. 
    * bluetoothEnabled == false reverts to a test data stream for development.
    */
    if(bluetoothEnabled) {
        const {
            weightPacket,
            timestampPacket,
        } = useBLEContext();
        useEffect(()=> {
            setWeightPack(weightPacket);
            setTimestampPack(timestampPacket);
        }, [timestampPacket]);
    } else {
        useEffect(() => {
            const newPacketRate = 188; // Rate (in milliseconds) at which a new packet of 15 weights and 15 timestamps is created
            let seconds = 0;
            setInterval(() => {
                const weights = new Array(15).fill(0);
                const timestamps = new Array(15).fill(0);
                for(let i = 0; i < 15; i++) {
                    seconds += newPacketRate / 15000;
                    timestamps[i] = seconds
                    weights[i] = 45 + 3 * Math.sin( 4 * seconds);
                }
                setWeightPack(weights);
                setTimestampPack(timestamps);
            }, newPacketRate);
        }, [])
    }

    useEffect(() => {
        setLastWeight(weightPack[weightPack.length]);
        setLastTime(timestampPack[weightPack.length]);
    }, [weightPack, timestampPack])

    /*
    *   Training Stuff
    */

    const initialState: TrainingState = {
        currentSet: 0,
        timer: -1,
        maxWeight: 0,
        phase: 'workoutNotBegun',
        weightPacket: new Array(15).fill(0),
        timestampPacket: new Array(15).fill(0),
        trainingParams: trainingParams,
        intervalID: -1,
    };
    const [state, dispatch] = useReducer(trainingReducer, initialState);
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
            dispatch({ type: 'ABOVE_THRESHOLD' });
        } 
        if(weightPackMax > 0 && weightPackMax < 0.5 * trainingParams.trainingLoad){
            console.log(weightPackMax, ' < ', 0.5 * trainingParams.trainingLoad)
            dispatch({type: 'BELOW_THRESHOLD'});
        } 
    }, [weightPack, trainingParams]);

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
            <View style={styles.container}>
                <View style={styles.weightsCardContainer}>
                    <WeightsCard 
                        weightPacket={weightPack}
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
        </View>
    );
}