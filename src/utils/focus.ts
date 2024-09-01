import { SQLiteDatabase } from "expo-sqlite";
import { focusMessages, MessagesListInterface } from "../redux/messagesListSlice";
import { AppDispatch } from "../redux/store";

interface MessageInterface {
    id: string;
    room_id: string;
    sender_id: string;
    type: string;
    content: string;
    created_at: string;
}

export function focusChatRoom(db:SQLiteDatabase, dispatch:AppDispatch, roomid:string, new_messages:MessagesListInterface|undefined) {
    const setMessages = async(message:MessageInterface) => {
        //console.log("set_latest_messages:",message);
        try{
            await db.runAsync(`INSERT INTO messages 
                (id, room_id, sender_id, type, content, created_at) 
                VALUES (?, ?, ?, ?, ?, ?)`, 
                [message.id, message.room_id, message.sender_id, message.type, message.content, message.created_at]);
        }catch(err){
            console.log('ERROR:',err);
        }
    };
    if (new_messages!==undefined && roomid in new_messages){
        for (const new_message of new_messages[roomid]){
            const message:MessageInterface = {
                id: new_message.id,
                room_id: roomid,
                sender_id: new_message.sender_id,
                type: new_message.type,
                content: new_message.content,
                created_at: new_message.created_at
            };
            setMessages(message);
        }
    }
    //const a = db.getAllSync("SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 1000",roomid);
    //console.log('RESULT IS:',a);
}