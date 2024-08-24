import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export  interface ParticipantsInfoInterface {
    addfriend: boolean;
    addroom: boolean;
    addparticipant: boolean;
}
export const userDataSlice = createSlice({
    name: 'overlayState',
    initialState: {
        addfriend: false,
        addroom: false,
        addparticipant: false,
    },
    reducers: {
        setAddFriend: (state, action: PayloadAction<boolean>) => {
            state.addfriend = action.payload;
        },
        setAddRoom: (state, action: PayloadAction<boolean>) => {
            state.addroom = action.payload;
        },
        setAddParticipant: (state, action: PayloadAction<boolean>) => {
            state.addparticipant = action.payload;
        },
    },
})

export const { setAddFriend,setAddRoom,setAddParticipant } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;