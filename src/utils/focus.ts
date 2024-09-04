import { SQLiteDatabase } from "expo-sqlite";
import { MessagesListInterface } from "../redux/messagesListSlice";
import { AppDispatch } from "../redux/store";
import { save_messages, SaveMessageInterface } from "../database/savemessage";

export function focusChatRoom(db:SQLiteDatabase, dispatch:AppDispatch, roomid:string, new_messages:MessagesListInterface|undefined) {
    if (new_messages!==undefined && roomid in new_messages){
        for (const new_message of new_messages[roomid]){
            let message:SaveMessageInterface = {
                id: new_message.id,
                roomid: roomid,
                senderid: new_message.sender_id,
                type: new_message.type,
                created_at: new_message.created_at
            };
            if (new_message.type==="text"){
                message.text = new_message.content;
            }else{
                message.message = new_message.content;
            }
            save_messages(message);
        }
    }
    //[message.id, 
    //message.roomid, message.senderid, 
    //message.type, message.type==="text"?message.text:message.message, message.created_at]
    //const a = db.getAllSync("SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 1000",roomid);
    //console.log('RESULT IS:',a);
}