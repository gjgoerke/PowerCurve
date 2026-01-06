import { Workout, WorkoutRow } from "@/types/types";
import { SQLiteDatabase } from "expo-sqlite";

export const createDbIfNeeded = async (db: SQLiteDatabase) => {
    console.log("Creating db if needed...");
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS grips (
            id INTEGER PRIMARY KEY, 
            name TEXT NOT NULL UNIQUE
        );
        
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY,
            grip INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            comment TEXT,
            trainingParams TEXT NOT NULL,
            trainingResults TEXT NOT NULL,
            FOREIGN KEY (grip) REFERENCES grips(id)
        );
    `); 
};

/*
* Grip CRUD
*/

export const newGrip = async (db: SQLiteDatabase, name: string) => {
    return await db.runAsync(`
        INSERT INTO grips (name) VALUES (?);
    `, [name]);
};

export const allGrips = async (db: SQLiteDatabase) => {
    return await db.getAllAsync('SELECT * FROM grips');
};

/*
* Workout CRUD
*/

export const newWorkout = async(db: SQLiteDatabase, workout: Workout) => {
    try {
        const gripResult = await db.getFirstAsync<{id: number}>('SELECT id FROM grips WHERE name = ?', [workout.grip]);
        if (!gripResult) {
            throw new Error(`Grip "${workout.grip}" not found in database`);
        }
    
        const gripId = gripResult.id;
        
        // Then insert the workout with the grip ID
        return await db.runAsync(`
            INSERT INTO workouts (
                grip,
                comment,
                trainingParams,
                trainingResults
            ) VALUES (?, ?, ?, ?);
            `, [gripId, workout.comment, JSON.stringify(workout.params), JSON.stringify(workout.results)]);
    } catch (error) {
        console.error('Trouble saving workout', error);
        throw error;
    }
}



export const getAllWorkouts = async (db: SQLiteDatabase) => {
    type WorkoutDB = {
        id: number;
        grip: number;
        trainingParams: string;
        trainingResults: string;
        comment: string;
        timestamp: string;
    }
    const workouts: WorkoutDB[] = await db.getAllAsync<WorkoutDB>('SELECT * FROM workouts ORDER BY timestamp DESC');
    const workoutsParsed = workouts.map((workout) => (
        {
            id: workout.id,
            grip: workout.grip,
            trainingParams: JSON.parse(workout.trainingParams),
            trainingResults: JSON.parse(workout.trainingResults),
            comment: workout.comment,
            timestamp: new Date(workout.timestamp)
        }
    ))
    return workoutsParsed;
};

