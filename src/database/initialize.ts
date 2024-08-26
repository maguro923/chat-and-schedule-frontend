import * as SQLite from 'expo-sqlite';

export async function initializeDatabase (db:SQLite.SQLiteDatabase) {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
            id CHAR(36) PRIMARY KEY,
            room_id CHAR(36) NOT NULL,
            sender_id CHAR(36),
            type TEXT NOT NULL,
            content TEXT,
            created_at TEXT NOT NULL
        );
    `);
}
/*
        DROP TABLE IF EXISTS messages;
        CREATE TABLE IF NOT EXISTS users (
            id CHAR(36) PRIMARY KEY,
            name TEXT NOT NULL,
            avatar_url TEXT,
            is_friend INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS rooms (
            id CHAR(36) PRIMARY KEY,
            name TEXT NOT NULL,
            joined_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS participants (
            user_id CHAR(36),
            room_id CHAR(36),
            PRIMARY KEY (user_id , room_id)
        );*/