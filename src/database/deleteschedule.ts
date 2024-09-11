import * as SQLite from 'expo-sqlite';

export const delete_schedule = async(id: string) => {
    try{
        const db = await SQLite.openDatabaseAsync('SQLiteDB.db');//データベースの読み込み
        await db.runAsync(`DELETE FROM schedules WHERE id = ?`,[id]);
        //await db.closeAsync();
    }catch(error){
        console.error('Failed to delete schedules:', error);
    }
}