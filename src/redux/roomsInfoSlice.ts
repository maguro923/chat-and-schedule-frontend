import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { add, set } from "date-fns";

export interface RoomsInfoInterface {
    name: string;
    id: string;
    avatar_path: string;
    joined_at: string;
}

export interface ParticipantsListInterface {
    [roomid: string]: string[]
}

export  interface userDataInterface {
    roomsInfo:{
        rooms: RoomsInfoInterface[]
        focusRoom: string,
        participants: ParticipantsListInterface
    }
}

export const userDataSlice = createSlice({
    name: 'roomsinfo',
    initialState: {
        roomsInfo: {
            rooms: <RoomsInfoInterface[]>[],
            focusRoom: "",
            participants: <ParticipantsListInterface>{}
        }
    },
    reducers: {
        setRoomsInfo: (state, action: PayloadAction<RoomsInfoInterface[]>) => {
            state.roomsInfo.rooms = action.payload;
        },
        setFocusRoom: (state, action: PayloadAction<string>) => {
            state.roomsInfo.focusRoom = action.payload;
        },
        addRoomInfo: (state, action: PayloadAction<RoomsInfoInterface>) => {
            state.roomsInfo.rooms.push(action.payload);
        },
        addRoomParticipant: (state, action: PayloadAction<{id:string,participants:string[]}>) => {
            if (state.roomsInfo.participants[action.payload.id] === undefined) {
                state.roomsInfo.participants[action.payload.id] = action.payload.participants;
            }else{
                for (const participant of action.payload.participants) {
                    if (!state.roomsInfo.participants[action.payload.id].includes(participant)) {
                        state.roomsInfo.participants[action.payload.id].push(participant);
                    }
                }
            }
        },
        deleteRoomParticipant: (state, action: PayloadAction<{roomid:string,participant:string}>) => {
            if (state.roomsInfo.participants[action.payload.roomid] !== undefined){
                state.roomsInfo.participants[action.payload.roomid] = state.roomsInfo.participants[action.payload.roomid].filter(participant => participant !== action.payload.participant);
            }
        },
        deleteRoominfo: (state, action: PayloadAction<string>) => {
            state.roomsInfo.rooms = state.roomsInfo.rooms.filter(room => room.id !== action.payload);
            if (state.roomsInfo.focusRoom === action.payload){
                state.roomsInfo.focusRoom = "";
            }
            if (state.roomsInfo.participants[action.payload] !== undefined){
                delete state.roomsInfo.participants[action.payload];
            }
        }
    },
})

export const { setRoomsInfo, setFocusRoom, addRoomInfo,addRoomParticipant,deleteRoominfo,deleteRoomParticipant } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;