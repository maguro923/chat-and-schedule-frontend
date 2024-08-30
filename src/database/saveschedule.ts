import * as SQLite from 'expo-sqlite';
import { Schedule } from '../redux/scheduleSlice';

export const save_schedule = async(schedule:Schedule) => {
    try{
        //console.log('schedule:',schedule.fromAt);
        //console.log('schedule:',schedule.fromAt.toString());
        //console.log('schedule:',new Date(schedule.fromAt.toISOString()));
        //console.log('schedule:',schedule.fromAt.toISOString());
        const db = await SQLite.openDatabaseAsync('SQLiteDB.db');//データベースの読み込み
        await db.runAsync(`INSERT INTO schedules 
                (id, text, info, color, fromAt, toAt) 
                VALUES (?, ?, ?, ?, ? ,?)`, 
            [schedule.id, schedule.text, schedule.info, schedule.color, schedule.fromAt.toISOString(), schedule.toAt.toISOString()]);
        await db.closeAsync();
    }catch(error){
        console.error('Failed to save schedule:', error);
    }
}