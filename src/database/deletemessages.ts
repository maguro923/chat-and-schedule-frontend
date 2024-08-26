import * as SQLite from 'expo-sqlite';

export const delete_messages = async(roomid:any) => {
    try{
        const db = await SQLite.openDatabaseAsync('SQLiteDB.db');//データベースの読み込み
        await db.runAsync(`DELETE FROM messages WHERE room_id = ?`,[roomid]);
        await db.closeAsync();
    }catch(error){
        console.error('Failed to delete messages:', error);
    }
}