import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MessageInterface{
    id: string;
    sender_id: string;
    type: "text" | "image" | "system";
    content: string;
    created_at: string;
}

export interface MessagesListInterface {
    [roomid: string]: MessageInterface[]
}

export interface LatestMessageInterface {
    [roomid: string]: {
        content: string;
        latest_at: string;
    };
}

export  interface userDataInterface {
    messages: MessagesListInterface
}

export const userDataSlice = createSlice({
    name: 'messages',
    initialState: {
        messages: <MessagesListInterface>{},//未読含む最新のすべてのメッセージ
        new_messages: <MessagesListInterface>{},//未読のメッセージ
        latest_message: <LatestMessageInterface>{}//最新のメッセージ
    },
    reducers: {
        //新しいメッセージを受信した場合に呼び出し、メッセージを追加する
        setLatestMessages: (state, action: PayloadAction<MessagesListInterface>) => {
            const newMessages = action.payload;

            for (const roomId in newMessages) {
                if (Object.prototype.hasOwnProperty.call(newMessages, roomId)) {
                    const messagesForRoom = newMessages[roomId];

                    // 既存のルームIDがある場合はメッセージを追加、ない場合は新規作成
                    if (!state.messages[roomId]) {
                        state.messages[roomId] = [];
                    }
                    if (!state.new_messages[roomId]) {
                        state.new_messages[roomId] = [];
                    }

                    // メッセージを追加
                    state.messages[roomId] = [...state.messages[roomId], ...messagesForRoom];
                    state.new_messages[roomId] = [...state.new_messages[roomId], ...messagesForRoom];
                    const latestMessage = messagesForRoom[0];
                    if (!(roomId in state.latest_message)) {
                        state.latest_message[roomId] = {
                            content: "",
                            latest_at: ""
                        };
                    }
                    if (latestMessage.type === "text" || latestMessage.type === "system") {
                        state.latest_message[roomId].content = latestMessage.content.replace(/\r?\n/g, ' ');
                    }else{
                        state.latest_message[roomId].content = "画像を送信しました";
                    }
                    state.latest_message[roomId].latest_at = latestMessage.created_at;
                }
            }
        },
        //メッセージをローカルから取得時にセット
        setMessages: (state, action: PayloadAction<MessagesListInterface>) => {
            for (const roomid in action.payload) {
                if (Object.prototype.hasOwnProperty.call(action.payload, roomid)) {
                    //state.messages[roomid] = [...state.messages[roomid],...action.payload[roomid]];
                    state.messages[roomid].push(...action.payload[roomid]);
                    const messages = action.payload[roomid];
                    if (messages.length > 0) {
                        const latestMessage = messages[0];
                        if (!(roomid in state.latest_message)) {
                            state.latest_message[roomid] = {
                                content: "",
                                latest_at: ""
                            };
                        }
                        if (state.latest_message[roomid].latest_at < latestMessage.created_at) {
                            state.latest_message[roomid].latest_at = latestMessage.created_at;
                            if (latestMessage.type === "text" || latestMessage.type === "system") {
                                state.latest_message[roomid].content = latestMessage.content.replace(/\r?\n/g, ' ');
                            }else if (latestMessage.type === "image") {
                                state.latest_message[roomid].content = "画像を送信しました";
                            }
                        }
                    }
                }
            }
        },
        //メッセージの送信
        setSendMessage:(state, action: PayloadAction<{roomid:string,message:MessageInterface}>) => {
            if (!(action.payload.roomid in state.messages)) {
                state.messages[action.payload.roomid] = [];
            }
            state.messages[action.payload.roomid] = [action.payload.message,...state.messages[action.payload.roomid]];
            if (!(action.payload.roomid in state.latest_message)) {
                state.latest_message[action.payload.roomid] = {
                    content: "",
                    latest_at: ""
                };
            }
            if (action.payload.message.type === "text" || action.payload.message.type === "system") {
                state.latest_message[action.payload.roomid].content = action.payload.message.content.replace(/\r?\n/g, ' ');
            }else if (action.payload.message.type === "image") {
                state.latest_message[action.payload.roomid].content = "画像を送信しました";
            }
            state.latest_message[action.payload.roomid].latest_at = action.payload.message.created_at;
        },
        //未読メッセージをクリア
        focusMessages: (state,action: PayloadAction<{roomid: string}>) => {
            state.new_messages[action.payload.roomid] = [];
        }
    }
})

export const { setLatestMessages,setMessages,setSendMessage,focusMessages } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;