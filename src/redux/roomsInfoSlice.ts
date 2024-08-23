import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from "date-fns";

export interface RoomsInfoInterface {
    name: string;
    id: string;
    avatar_path: string;
    joined_at: string;
}

export  interface userDataInterface {
    roomsInfo:{
        rooms: RoomsInfoInterface[]
        focusRoom: string
    }
}

export const userDataSlice = createSlice({
    name: 'roomsinfo',
    initialState: {
        roomsInfo: {
            rooms: <RoomsInfoInterface[]>[],
            focusRoom: ""
        }
    },
    reducers: {
        setRoomsInfo: (state, action: PayloadAction<RoomsInfoInterface[]>) => {
            state.roomsInfo.rooms = action.payload;
        },
        setFocusRoom: (state, action: PayloadAction<string>) => {
            state.roomsInfo.focusRoom = action.payload;
        },
    },
})

export const { setRoomsInfo, setFocusRoom } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;