import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from "date-fns";

export const authErrorSlice = createSlice({
    name: 'authError',
    initialState: {
        isShownUserSaveButton: false,
        isShownRoomSaveButton: false,
    },
    reducers: {
        setIsShownUserSaveButtom: (state, action: PayloadAction<boolean>) => {
            state.isShownUserSaveButton = action.payload;
        },
        setIsShownRoomSaveButtom: (state, action: PayloadAction<boolean>) => {
            state.isShownRoomSaveButton = action.payload;
        }
    }
})

export const { setIsShownUserSaveButtom, setIsShownRoomSaveButtom } = authErrorSlice.actions;
export default authErrorSlice.reducer;