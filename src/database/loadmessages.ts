import { SQLiteDatabase } from "expo-sqlite";
import { MessagesListInterface, setLocalMessages, MessageInterface } from "../redux/messagesListSlice";
import { AppDispatch } from "../redux/store";

export const loadMessages = async(db:SQLiteDatabase,dispatch:AppDispatch ,roomidlist:string[],messages:MessagesListInterface) => {
    var messageslist:MessagesListInterface = {};
    for (const roomid of roomidlist) {
        const res:any = await db.getAllAsync("SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 1000",roomid)
        //console.log('RESULT IS:',res)
        if (res[0] === undefined || res[0] === null || res.length === 0){
            continue;
        }
        var room_msg:MessageInterface[] = [];
        for (const msg of res) {
            const message_info:MessageInterface = {
                id: msg.id,
                sender_id: msg.sender_id,
                type: msg.type,
                content: msg.content,
                created_at: msg.created_at
            };
            room_msg = [...room_msg, message_info];
        } 
        messageslist[roomid] = room_msg;
    }
    //メッセージをリストに追加
    dispatch(setLocalMessages(messageslist))
}