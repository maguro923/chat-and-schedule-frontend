import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const authErrorSlice = createSlice({
    name: 'authError',
    initialState: {
        isShownUserSaveButton: false,
        isShownRoomSaveButton: false,
        isPressedUserSaveButton: false,
        isPressedRoomSaveButton: false
    },
    reducers: {
        setIsShownUserSaveButtom: (state, action: PayloadAction<boolean>) => {
            state.isShownUserSaveButton = action.payload;
        },
        setIsShownRoomSaveButtom: (state, action: PayloadAction<boolean>) => {
            state.isShownRoomSaveButton = action.payload;
        },
        setIsPressedUserSaveButtom: (state, action: PayloadAction<boolean>) => {
            state.isPressedUserSaveButton = action.payload;
        },
        setIsPressedRoomSaveButtom: (state, action: PayloadAction<boolean>) => {
            state.isPressedRoomSaveButton = action.payload;
        }
    }
})

export const { setIsShownUserSaveButtom, setIsShownRoomSaveButtom, setIsPressedRoomSaveButtom, setIsPressedUserSaveButtom } = authErrorSlice.actions;
export default authErrorSlice.reducer;