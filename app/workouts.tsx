import { getAllWorkouts } from "@/utils/databaseUtils";
import { Workout, WorkoutRow } from "@/types/types";

import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { DataTable } from "react-native-paper";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        marginBottom: 20
    },
});


export default function Workouts() {
    const database = useSQLiteContext();
    const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
    
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const loadWorkouts = async () => {
                const workoutData: WorkoutRow[] = await getAllWorkouts(database);
                if (isActive) setWorkouts(workoutData);
                console.log(workoutData);
            };
            loadWorkouts()
            return () =>  { isActive = false };
        }, [database])
    );

    return(
    <View style={styles.container}>
        <DataTable>
            <DataTable.Header>
                <DataTable.Title sortDirection="descending">Date</DataTable.Title>
                <DataTable.Title>Grip</DataTable.Title>
                <DataTable.Title>Hand</DataTable.Title>
                <DataTable.Title numeric>Time to Failure</DataTable.Title>
            </DataTable.Header>
            {
                workouts.map((item, index) => {
                    return (
                        <DataTable.Row key={index}>
                            <DataTable.Cell>{item.timestamp}</DataTable.Cell>
                            <DataTable.Cell>{item.trainingParams.grip}</DataTable.Cell>
                            <DataTable.Cell>{item.trainingParams.hand}</DataTable.Cell>
                            <DataTable.Cell numeric>{item.trainingResults[0].timeToFailure}s</DataTable.Cell>
                        </DataTable.Row>
                    )
                })
            }
        </DataTable>
    </View>);
}