import { TrainingParams, ResultItem } from "@/types/types";
import { newWorkout } from "@/utils/databaseUtils";

import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, DataTable, Text as PaperText} from "react-native-paper";
import { useSQLiteContext } from "expo-sqlite";

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        marginBottom: 20
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
});

export default function Workout() {
    const database = useSQLiteContext();
    const params = useLocalSearchParams();
    const [resultsData, setResultsData] = useState<ResultItem[]>([]);
    const [trainingParams, setTrainingParams] = useState<TrainingParams | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [comment, setComment] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);

    const saveWorkout = async () => {
        if (!trainingParams?.grip) return;
            setSaving(true);
        try {
            const workout = {grip: trainingParams.grip, params: trainingParams, results: resultsData, comment};
            await newWorkout(database, workout);
        } catch (err) {
            console.error("Failed to save workout", err);
            setError("Failed to save workout.");
        } finally {
            setSaving(false);
            router.replace('/');
        }
    };
    
    useEffect(() => {
        try {
            const results = JSON.parse(params.results as string);
            const trainingParams = JSON.parse(params.trainingParams as string);
            setTrainingParams(trainingParams);
            
            const weights = results?.weights;
            const times = results?.times;
            
            if (weights && times && weights.length > 0) {
                const data = weights.map((averageWeight: number, index: number) => ({
                    set: index + 1,
                    averageWeight,
                    timeToFailure: times[index] || 0
                }));
                setResultsData(data);
                setError(null);
            } else {
                setError('No workout data available.');
            }
        } catch (error) {
            console.error('Error parsing workout data:', error);
            setError('Error: Could not load workout data.');
        }
    }, [params.results, params.trainingParams]); 

    if (error) {
        return (
            <View style={styles.container}>
                <PaperText>{error}</PaperText>
            </View>
        );
    }

    if (resultsData.length === 0) {
        return (
            <View style={styles.container}>
                <PaperText>Loading workout data...</PaperText>
            </View>
        );
    }

    return(
        <ScrollView style={styles.container}>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title numeric>Set</DataTable.Title>
                    <DataTable.Title numeric>Time to Failure</DataTable.Title>
                    <DataTable.Title numeric>Average Weight</DataTable.Title>
                </DataTable.Header>
                {
                    resultsData.map((item) => (
                        <DataTable.Row key={item.set}>
                            <DataTable.Cell numeric>{item.set}</DataTable.Cell>
                            <DataTable.Cell numeric>{item.timeToFailure.toFixed(1)}s</DataTable.Cell>
                            <DataTable.Cell numeric>{item.averageWeight.toFixed(1)}</DataTable.Cell>
                        </DataTable.Row>
                    ))
                }
            </DataTable>
            { params.saveWorkoutOption == "true" &&
                <View style={styles.buttonContainer}>
                    <Button mode='contained-tonal' onPress={() => {router.replace('/')}}>Don't Save</Button>
                    <Button 
                        mode='contained' 
                        onPress={saveWorkout} 
                        disabled={!trainingParams?.grip || resultsData.length === 0 || saving}
                    >{saving ? "Saving..." : "Save Workout"}</Button>
                </View>
            }
        </ScrollView>
    );
}