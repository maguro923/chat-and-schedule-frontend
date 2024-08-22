import * as Crypto from 'expo-crypto';
import { setLatestMessages ,MessagesListInterface, MessageInterface } from '../redux/messagesListSlice';
import { store } from '../redux/store';//循環インポートとなるが、storeを使うために必要なので無視

const url = 'ws://192.168.0.150:8000/ws/';

type MessageHandler = (message: any) => void;
type ReplyHandler = (response: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private is_verified: boolean = false;
    private pendingRequests: Map<string, (response: any) => void> = new Map();
    private messageHandlers: Map<string, MessageHandler> = new Map();
    private replyHandlers: Map<string, ReplyHandler> = new Map();
    
    constructor() {
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
        this.messageHandlers.set("Latest-FriendRequest", (message: any) => {
            console.log("Latest-FriendRequest:", message);
        });
        this.messageHandlers.set("ReceiveMessage", (message: any) => {
            console.log("ReceiveMessage:", message);
        });
        this.messageHandlers.set("AuthInfo", (message: any) => {
            console.log("AuthInfo:", message);
        });
        this.messageHandlers.set("FriendRequest", (message: any) => {
            console.log("FriendRequest:", message);
        });
        this.messageHandlers.set("Error", (message: any) => {
            console.log("Error:", message);
        });

        this.replyHandlers.set("reply-SendMessage", (response: any) => {});
        this.replyHandlers.set("reply-ReAuth", (response: any) => {
            console.log("reply-ReAuth:", response);
        });
        this.replyHandlers.set("reply-Friend", (response: any) => {
            console.log("reply-Friend:", response);
        });
        this.replyHandlers.set("reply-UnFriend", (response: any) => {
            console.log("reply-UnFriend:", response);
        });
        this.replyHandlers.set("reply-Focus", (response: any) => {
            console.log("reply-Focus:", response);
        });
        this.replyHandlers.set("reply-UnFocus", (response: any) => {
            console.log("reply-UnFocus:", response);
        });
        this.replyHandlers.set("reply-JoinRoom", (response: any) => {
            console.log("reply-JoinRoom:", response);
        });
        this.replyHandlers.set("reply-LeaveRoom", (response: any) => {
            console.log("reply-LeaveRoom:", response);
        });
        this.replyHandlers.set("reply-CreateRoom", (response: any) => {
            console.log("reply-CreateRoom:", response);
        });
        this.replyHandlers.set("reply-GetRoomsInfo", (response: any) => {});
    }

    connect(user_id: string, headers: { [key: string]: string } = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            const ws_url = new URL(url + user_id);
            this.socket = new WebSocket(ws_url.toString());

            this.socket.onopen = () => {
                this.socket?.send(JSON.stringify({ "type": 'init', "content": headers }));
                resolve();
            };

            this.socket.onerror = (error) => {
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
                    console.log("WebSocket connection failed.", response.content);
                    this.disconnect();
                
                //メッセージ受信
                } else {
                    if (requestId && this.pendingRequests.has(requestId)) {
                        this.pendingRequests.get(requestId)!(response);
                        this.pendingRequests.delete(requestId);
                    } else {
                        this.handleIncomingMessage(response);
                    }
                }
            };

            this.socket.onclose = () => {
                console.log("WebSocket connection closed.");
            };
        });
    }

    private handleIncomingMessage(message: any) {
        const type = message.type;
        console.log("Message type:", type);
        if (type && this.messageHandlers.has(type)) {
            this.messageHandlers.get(type)!(message);
        } else {
            console.warn("Unhandled message type:", type);
        }
    }

    sendRequest(data: any): Promise<any> {
        const requestId = Crypto.randomUUID();
        data.id = requestId;

        return new Promise((resolve, reject) => {
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
                reject(new Error("WebSocket is not connected"));
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