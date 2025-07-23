import { StyleSheet } from "react-native";
import { View } from "react-native";

import { TrainingParams } from "@/types/types";
import LineChart from "./LineChart";
import LineChartBLE from "./LineChartBLE";
import WeightsCard from "./WeightsCard";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    weightsCardContainer: {
        marginBottom: 16,
    },
    chartContainer: {
    },
});

interface TrainingProps {
    trainingParams: TrainingParams;
    weights?: number[];
    timestamps?: number[];
}

export default function Training ({trainingParams, weights, timestamps} : TrainingProps) {

    return (
        <View style={styles.container}>
            {weights && timestamps ? 
                <>
                    
                    <View style={styles.chartContainer}>
                        <LineChart trainingParams={trainingParams} weights={weights} timestamps={timestamps}/>
                    </View>
                    <View style={styles.weightsCardContainer}>
                        <WeightsCard weights={weights}/>
                    </View>
                </>
                :
                <>
                    <LineChartBLE trainingParams={trainingParams}/>
                </>

            }
        </View>
    );
}