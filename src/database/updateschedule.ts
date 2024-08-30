import * as SQLite from 'expo-sqlite';
import { Schedule } from '../redux/scheduleSlice';

export const update_schedule = async(schedule:Schedule) => {
    try{
        const db = await SQLite.openDatabaseAsync('SQLiteDB.db');//データベースの読み込み
        await db.runAsync(`
            UPDATE schedules SET
            text = ?,
            info = ?,
            color = ?,
            fromAt = ?,
            toAt = ? WHERE id = ?`,
            [schedule.text, schedule.info, schedule.color, schedule.fromAt.toISOString(), schedule.toAt.toISOString(), schedule.id]);
        await db.closeAsync();
    }catch(error){
        console.error('Failed to update schedule:', error);
    }
}