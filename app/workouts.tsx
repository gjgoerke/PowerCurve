import { getAllWorkouts } from "@/utils/databaseUtils";
import { Workout, WorkoutRow } from "@/types/types";

import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { DataTable, Divider, List } from "react-native-paper";
import { StyleSheet, ScrollView, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";

const styles = StyleSheet.create({
    container: {
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

    const navigateToWorkout = (workout: WorkoutRow) => {
        const params = {
            trainingParams: JSON.stringify(workout.trainingParams),
            results: JSON.stringify({
                weights: workout.trainingResults.map((val) => val.averageWeight),
                times: workout.trainingResults.map((val) => val.timeToFailure)
            }),
            saveWorkoutOption: 'false',
            timestampString: workout.timestamp.toLocaleDateString()
        };
        router.navigate({
            pathname: '/workout',
            params
        });
    }

    return(
        <SafeAreaView>
            <ScrollView style={styles.container}>
                <Header title="Workouts"/>
                {
                    workouts.map((workout, index) => {
                        const title = workout.trainingParams.grip + " " + workout.timestamp.toLocaleDateString();
                        const description = workout.trainingResults[0].timeToFailure + "s" + " averaging " + workout.trainingResults[0].averageWeight.toFixed(1) + "kg";
                        const iconName = workout.trainingParams.hand == "left" ? "hand-left-outline" : "hand-right-outline";
                        return (
                            <View key={index}>
                                <List.Item 
                                    title={title}
                                    description={description}
                                    left={() => 
                                        (
                                            <View style={{alignContent: "center", justifyContent: "center", paddingLeft: 10}}>
                                                <Ionicons name={iconName} size={24}/>
                                            </View>
                                        )
                                    }
                                    right={
                                        () => (
                                            <View style={{alignContent: "center", justifyContent: "center", paddingLeft: 10}}>
                                                <Ionicons name={"ellipsis-vertical"} size={16}/>
                                            </View>
                                        )
                                    }
                                    onPress={() => navigateToWorkout(workout)}
                                    />
                                <Divider/>
                            </View>
                        )
                    })
                }
            </ScrollView>
        </SafeAreaView>
    );

}