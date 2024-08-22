import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ParticipantDetailsInterface {
    name: string;
    avatar_path: string;
    isFriend: boolean;
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
        participants: <ParticipantsInfoInterface>{}
    },
    reducers: {
        setParticipantsInfo: (state, action: PayloadAction<ParticipantsInfoInterface>) => {
            state.participants = action.payload;
        }
    },
})

export const { setParticipantsInfo } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;