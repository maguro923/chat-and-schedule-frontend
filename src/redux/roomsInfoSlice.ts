import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RoomsInfoInterface {
    name: string;
    id: string;
    avatar_path: string;
    joined_at: string;
}

export  interface userDataInterface {
    //storeと名前を同じにする
    roomsInfo:{
        rooms: RoomsInfoInterface[]
    }
}

export const userDataSlice = createSlice({
    name: 'roomsinfo',
    initialState: {
        roomsInfo: {
            rooms: <RoomsInfoInterface[]>[]
        }
    },
    reducers: {
        setRoomsInfo: (state, action: PayloadAction<RoomsInfoInterface[]>) => {
            state.roomsInfo.rooms = action.payload;
        }
    },
})

export const { setRoomsInfo } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;