import * as SQLite from 'expo-sqlite';

export interface SaveMessageInterface {
    id: string;
    roomid: string;
    senderid: string;
    type: string;
    text?: string;
    message?: string;
    created_at: string;
}

export const save_messages = async(message:SaveMessageInterface) => {
    try{
        const db = await SQLite.openDatabaseAsync('SQLiteDB.db');//データベースの読み込み
        await db.runAsync(`INSERT INTO messages 
                (id, room_id, sender_id, type, content, created_at) 
                VALUES (?, ?, ?, ?, ?, ?)`, 
            [message.id, message.roomid, message.senderid, message.type, message.type==="text"?message.text as string:message.message as string, message.created_at]);
        await db.closeAsync();
    }catch(error){
        console.error('Failed to save message:', error);
    }
}