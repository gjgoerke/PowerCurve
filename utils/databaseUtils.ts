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
}