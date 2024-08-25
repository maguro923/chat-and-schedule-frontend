import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from "date-fns";

export interface ParticipantDetailsInterface {
    name: string;
    avatar_path: string;
    is_friend: boolean;
}

export  interface ParticipantsInfoInterface {
    //storeと名前を同じにする
    [userid: string]: ParticipantDetailsInterface
}

export interface userDataInterface {
    participants: ParticipantsInfoInterface
}

export const userDataSlice = createSlice({
    name: 'participantsinfo',
    initialState: {
        participants: <ParticipantsInfoInterface>{},
        friends: <string[]>[],
        friend_requests: <string[]>[],
        sended_requests: <string[]>[]
    },
    reducers: {
        setParticipantsInfo: (state, action: PayloadAction<ParticipantsInfoInterface>) => {
            state.participants = action.payload;
            for (const userid in action.payload) {
                if (Object.prototype.hasOwnProperty.call(action.payload, userid)) {
                    if (action.payload[userid].is_friend) {
                        state.friends.push(userid);
                    }
                }
            }
        },
        addParticipantsInfo: (state, action: PayloadAction<ParticipantsInfoInterface>) => {
            for (const userid in action.payload) {
                if (Object.prototype.hasOwnProperty.call(action.payload, userid)) {
                    state.participants[userid] = action.payload[userid];
                    if (action.payload[userid].is_friend) {
                        state.friends.push(userid);
                    }
                }
            }
        },
        setFriendRequests: (state, action: PayloadAction<string>) => {
            if (!state.friend_requests.includes(action.payload)) {
                state.friend_requests.push(action.payload);
            }
        },
        setSendedRequests: (state, action: PayloadAction<string>) => {
            if (!state.sended_requests.includes(action.payload)) {
                state.sended_requests.push(action.payload);
            }
        },
    },
})

export const { setParticipantsInfo,addParticipantsInfo,setFriendRequests,setSendedRequests } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;