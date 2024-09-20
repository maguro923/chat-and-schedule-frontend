import * as Crypto from 'expo-crypto';
import { setLatestMessages ,MessagesListInterface, MessageInterface, setMessages } from '../redux/messagesListSlice';
import { get_usersinfo, refresh, RefreshJsonInterface } from './api';
import { setUserDataAsync, setUserDataInterface } from '../redux/userDataSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { addFriend, addParticipantsInfo, ParticipantsInfoInterface, setFriendRequests, setParticipantsInfo } from '../redux/participantsInfoSlice';
import { addRoomInfo, addRoomParticipant, deleteRoomParticipant } from '../redux/roomsInfoSlice';
import { save_messages } from '../database/savemessage';
import { WS_URL } from './config';
//------------------------------------------------------------------------
//循環インポートとなるが、storeを使うために必要なので無視
import { connectionClosed, connectWebSocket, sendWebSocketMessage, setError, setIsConnected } from '../redux/webSocketSlice';
import { store } from '../redux/store';
//------------------------------------------------------------------------

type MessageHandler = (message: any) => void;
type ReplyHandler = (response: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private is_verified: boolean = false;
    private pendingRequests: Map<string, (response: any) => void> = new Map();
    private messageHandlers: Map<string, MessageHandler> = new Map();
    private replyHandlers: Map<string, ReplyHandler> = new Map();
    private userid: string = "";
    private headers: { [key: string]: string } = {};
    
    constructor() {
        //受信した最新メッセージをstoreに保存
        this.messageHandlers.set("Latest-Message", async(message: any) => {
            const MsgList:any[] = message.content;
            var LatestMsg:MessagesListInterface = {}
            MsgList.forEach((msg: any) => {
                if (!(msg.room_id in LatestMsg)){
                    LatestMsg[msg.room_id] = [];
                }
                const message_info:MessageInterface = {
                    id: msg.id,
                    sender_id: msg.sender_id,
                    type: msg.type,
                    content: msg.content,
                    created_at: msg.created_at
                };
                LatestMsg[msg.room_id].push(message_info);
            });
            for (const msg in LatestMsg){
                if(Object.prototype.hasOwnProperty.call(LatestMsg, msg)){
                    LatestMsg[msg].sort((a: any, b: any) => a.created_at - b.created_at);
                    LatestMsg[msg].reverse();
                }
            };
            store.dispatch(setLatestMessages(LatestMsg));
        });
        //受信したメッセージをstoreに保存
        this.messageHandlers.set("ReceiveMessage", async(message: any) => {
            const recvFocus = async(roomid:string) => {
                const result0 = await store.dispatch(sendWebSocketMessage({"type":"UnFocus","content":{"roomid":roomid}}));
                const response0:any = unwrapResult(result0);
                if (response0.content?.message !== "Already unfocused" && response0.content?.message !== "Unfocused"){
                  console.error("アンフォーカスに失敗しました",response0.content?.message);
                }
                const result1 = await store.dispatch(sendWebSocketMessage({"type":"Focus","content":{"roomid":roomid}}));
                const response1:any = unwrapResult(result1);
                if (response1.content?.message !== "Already focused" && response1.content?.message !== "Focused"){
                  console.error("フォーカスに失敗しました",response1.content?.message);
                }
            }
            //console.log("ReceiveMessage:", message);
            var receive_message: MessageInterface[] = [];
            if (message.content.type === "text") {
                receive_message.push({
                    id: message.content.id,
                    sender_id: message.content.senderid,
                    type: "text",
                    content: message.content.text,
                    created_at: message.content.created_at
                })
            }else if (message.content.type === "system") {
                if (message.info !== undefined && message.info.type === "LeaveRoom" && message.info.id !== undefined){
                    store.dispatch(deleteRoomParticipant({roomid:message.content.roomid,participant:message.info.id}));
                }
                receive_message.push({
                    id: message.content.id,
                    sender_id: "None",
                    type: "system",
                    content: message.content.message,
                    created_at: message.content.created_at
                })
            }

            var msg:MessagesListInterface = {};
            msg[message.content.roomid] = receive_message;
            if (store.getState().roomsinfo.roomsInfo.focusRoom === message.content.roomid) {
                //送信先ルームにフォーカスしている場合
                store.dispatch(setMessages(msg));
                save_messages(message.content);
                //既読時間を更新することで突然の切断に対応する
                const roomid = message.content.roomid
                recvFocus(roomid);
            }else{
                //送信先ルームにフォーカスしていない場合
                store.dispatch(setLatestMessages(msg));
            }
        });
        //アクセストークンの再発行及び再認証
        this.messageHandlers.set("AuthInfo", async(message: any) => {
            //console.log("AuthInfo:", message);
            const send_reauth = async(Res:any,Device_id:any) => {
                const result = await store.dispatch(sendWebSocketMessage({
                    "type": "ReAuth", "content": {
                        "access_token": Res.access_token, "device_id": Device_id} }));
                const response:any = unwrapResult(result)
                if (response.content?.message !== "ReAuth success"){
                    const msg = response?.content?.message !== undefined ? response.content.message : "不明なエラー";
                    console.error("再認証に失敗しました",msg);
                }
            }
            const userdata = store.getState().userdata.userdata;
            const device_id = store.getState().deviceid.deviceid;

            const sendJson: RefreshJsonInterface = {
                refresh_token: userdata.refresh_token,
                device_id: device_id
              };
              const [status,res] = await refresh(sendJson);
              const new_userdata: setUserDataInterface = {
                name: userdata.name,
                id: userdata.id,
                avatar_path: userdata.avatar_path,
                access_token: res.access_token,
                access_token_expires: res.access_token_expires,
                refresh_token: userdata.refresh_token,
                refresh_token_expires: userdata.refresh_token_expires
              };
              //レスポンスに対する処理
              if(status === 200){
                console.log("アクセストークンの再発行に成功しました");
                this.headers = {"access_token": res.access_token};
                store.dispatch(setUserDataAsync(new_userdata))
                  .then(() => {
                    send_reauth(res,device_id);
                  });
              }else {
                console.error("アクセストークンの再発行に失敗しました");
              }
        });
        //フレンドリクエスト受信
        this.messageHandlers.set("FriendRequest", async(message: any) => {
            const participants_list = store.getState().participantsinfo.participants;
            const userdata = store.getState().userdata.userdata;
            for (let request_id of message.content){
                if (!(request_id in participants_list)) {
                    //未登録のユーザーIDの場合
                    const [status,res] = await get_usersinfo(userdata.access_token,userdata.id,request_id);
                    if (status === 200){
                        //console.log("ユーザー情報を取得しました",res.users_info);
                        store.dispatch(addParticipantsInfo(res.users_info));
                    }else{
                        console.error("ユーザー情報の取得に失敗しました",res);
                    }
                }
                store.dispatch(setFriendRequests(request_id));
            }
        });
        //フレンド関係成立に対する処理
        this.messageHandlers.set("Friend", async(message: any) => {
            //console.log("Friend:", message);
            const participants = store.getState().participantsinfo
            const participants_id:string[] = []
            for (let id in participants.participants){
                participants_id.push(id);
            }
            if (!participants_id.includes(message.content)){
                const send_list:string[] = [];
                send_list.push(message.content);
                const userdata = store.getState().userdata.userdata;
                const [status,res] = await get_usersinfo(userdata.access_token,userdata.id,send_list);
                if(status === 200){
                  //DEV: 
                  console.log("ユーザ情報を取得しました",res);
                  store.dispatch(setParticipantsInfo(res.users_info));
                }else{
                  console.error("ユーザ情報の取得に失敗しました",res.detail);
                }
            }
            console.log("フレンド関係が成立しました",message.content);
            store.dispatch(addFriend(message.content));
        });
        //新規ルーム参加に対する処理
        this.messageHandlers.set("JoinRoom", async(message: any) => {
            const participants = store.getState().participantsinfo.participants
            store.dispatch(addRoomInfo({
                "id":message.content.id,
                "name":message.content.name,
                "avatar_path":message.content.avatar_path,
                "joined_at":message.content.joined_at}));
            store.dispatch(addRoomParticipant({id:message.content.id,participants:message.content.participants}));
            var participants_id:string[] = [];
            for (let id in participants){
                participants_id.push(id);
            }
            var send_list:string[] = [];
            for (let id of message.content.participants){
                if (!participants_id.includes(id) && id !== store.getState().userdata.userdata.id){
                    send_list.push(id);
                }
            }
            if (send_list.length !== 0){
                const userdata = store.getState().userdata.userdata;
                const [status,res] = await get_usersinfo(userdata.access_token,userdata.id,send_list);
                if(status === 200){
                    console.log("ユーザ情報を取得しました",res);
                    store.dispatch(addParticipantsInfo(res.users_info));
                }else{
                    console.error("ユーザ情報の取得に失敗しました",res.detail);
                }
            }
        });
        //既存ルームに対するユーザー参加に対する処理
        this.messageHandlers.set("JoinUser", async(message: any) => {
            const new_participant:string[] = [message.content.user_id];
            //参加者情報を取得
            const participants = store.getState().participantsinfo.participants
            var participants_id:string[] = [];
            for (let id in participants){
                participants_id.push(id);
            }
            if (!participants_id.includes(message.content.user_id)){
                const userdata = store.getState().userdata.userdata;
                const [status,res] = await get_usersinfo(userdata.access_token,userdata.id,new_participant);
                if(status === 200){
                    console.log("ユーザ情報を取得しました",res);
                    store.dispatch(addParticipantsInfo(res.users_info));
                }else{
                    console.error("ユーザ情報の取得に失敗しました",res.detail);
                }
            }
            //ルーム情報を更新
            store.dispatch(addRoomParticipant({
                "id": message.content.room_id,
                "participants": new_participant
            }));
        });
        //既存ルームに対するユーザーの退室に対する処理
        this.messageHandlers.set("LeaveUser", async(message: any) => {
            store.dispatch(deleteRoomParticipant({
                "roomid": message.content.room_id,
                "participant": message.content.user_id
            }));
        });
        //ルーム情報の更新
        this.messageHandlers.set("UpdateRoom", async(message: any) => {
            store.dispatch(addRoomInfo({
                "id": message.content.id,
                "name": message.content.name,
                "avatar_path": message.content.avatar_path,
                "joined_at": message.content.joined_at
            }));
        });
        //ユーザー情報の更新
        this.messageHandlers.set("UpdateUser", async(message: any) => {
            const participant_info:ParticipantsInfoInterface = {
                [message.content.id]: {
                    "name": message.content.name,
                    "avatar_path": message.content.avatar_path,
                    "is_friend": message.content.is_friend
                }
            };
            store.dispatch(addParticipantsInfo(participant_info));
        });
        this.messageHandlers.set("Error", (message: any) => {
            console.error("Error:", message);
        });

        this.replyHandlers.set("reply-SendMessage", (response: any) => {});
        this.replyHandlers.set("reply-ReAuth", (response: any) => {});
        this.replyHandlers.set("reply-Friend", (response: any) => {});
        this.replyHandlers.set("reply-UnFriend", (response: any) => {
            console.log("reply-UnFriend:", response);
        });
        this.replyHandlers.set("reply-Focus", (response: any) => {});
        this.replyHandlers.set("reply-UnFocus", (response: any) => {});
        this.replyHandlers.set("reply-JoinRoom", (response: any) => {});
        this.replyHandlers.set("reply-LeaveRoom", (response: any) => {});
        this.replyHandlers.set("reply-CreateRoom", (response: any) => {});
        this.replyHandlers.set("reply-GetRoomsInfo", (response: any) => {});
        this.replyHandlers.set("reply-SearchUsers", (response: any) => {});
        this.replyHandlers.set("reply-GetFriendList", (response: any) => {});
    }

    connect(user_id: string, headers: { [key: string]: string } = {}, retry?:boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            const ws_url = new URL(WS_URL + user_id);
            this.socket = new WebSocket(ws_url.toString());
            this.userid = user_id;
            this.headers = headers;
            const is_tryreconnect = retry===undefined?false:retry;

            //初回接続時認証情報を送信
            this.socket.onopen = () => {
                console.log("Start trying to connect to WebSocket server...\n", ws_url.toString(),"\n" ,headers);
                this.socket?.send(JSON.stringify({ "type": 'init', "content": headers }));
                resolve();
            };

            this.socket.onerror = (error) => {
                this.is_verified = false;
                console.error("WebSocket error:", error);
                reject(error);
            };

            this.socket.onmessage = (event) => {
                const response = JSON.parse(event.data);
                const requestId = response.id;
                //初回接続時の認証
                if (!this.is_verified && response.content.status === '200') {
                    this.is_verified = true;
                    console.log("WebSocket connection verified.");
                } else if (!this.is_verified) {
                    console.error("WebSocket connection failed:", response.content);
                    this.disconnect();
                
                //メッセージ受信
                } else {
                    //console.log("DEV:",user_id, response);
                    if (requestId && this.pendingRequests.has(requestId)) {
                        this.pendingRequests.get(requestId)!(response);
                        this.pendingRequests.delete(requestId);
                    } else {
                        this.handleIncomingMessage(response);
                    }
                }
            };

            this.socket.onclose = () => {
                this.is_verified = false;
                console.warn("WebSocket connection closed. trying to reconnect...");
                if (is_tryreconnect===false){
                    this.connect(user_id, headers, true);
                }else{
                    console.error("Failed to reconnect. WebSocket connection closed.");
                    store.dispatch(connectionClosed());
                    store.dispatch(setError("Failed to reconnect. WebSocket connection closed."));
                }
            };
        });
    }

    private handleIncomingMessage(message: any) {
        const type = message.type;
        if (type && this.messageHandlers.has(type)) {
            this.messageHandlers.get(type)!(message);
        } else {
            console.warn("Unhandled message type:", type);
        }
    }

    sendRequest(data: any,retry: boolean = false): Promise<any> {
        const requestId = Crypto.randomUUID();
        data.id = requestId;
        if (store.getState().webSocket.isConnected === (this.socket?.readyState === WebSocket.OPEN)) {
            store.dispatch(setIsConnected(this.socket?.readyState === WebSocket.OPEN));
        }

        return new Promise((resolve, reject) => {
            // 通信が切断されている場合は一度だけ再接続を試みる
            const Retry = async(send_data: any) => {
                console.log("Retry connection and sending message...");
                this.disconnect();
                await store.dispatch(connectWebSocket({ user_id: this.userid, headers: this.headers }))
                .catch((error) => {
                    console.error("WebSocket connection error: " + error);
                    reject(error);
                });
                const result = await store.dispatch(sendWebSocketMessage(send_data));
                const response:any = unwrapResult(result);
                resolve(response);
            }

            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.pendingRequests.set(requestId, (response) => {
                    if (response.type && this.replyHandlers.has(response.type)) {
                        this.replyHandlers.get(response.type)!(response);
                    } else {
                        console.warn("Unhandled reply type:", response.type, "\n", response.content.message);
                        reject(new Error("Unhandled reply type"));
                    }
                    resolve(response);
                });
                this.socket.send(JSON.stringify(data));

                setTimeout(() => {
                    if (this.pendingRequests.has(requestId)) {
                        this.pendingRequests.delete(requestId);
                        reject(new Error('Request timed out'));
                    }
                }, 5000);
            } else {
                if (retry) {
                    //リトライ時にエラーが発生した場合はエラーを返す
                    console.error("We try to reconnect and send message, but connection is not established.");
                    reject(new Error("WebSocket is not connected"));
                } else {
                    Retry(data);
                }
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const webSocketService = new WebSocketService();