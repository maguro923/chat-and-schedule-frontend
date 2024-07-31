import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface authErrorInterface {
    authError:{
        error_message: string;
    }
}

export const authErrorSlice = createSlice({
    name: 'authError',
    initialState: {
        error_message: ""
    },
    reducers: {
        setErrorMessage: (state, action: PayloadAction<string>) => {
            state.error_message = action.payload;
        }
    }
})

export const { setErrorMessage } = authErrorSlice.actions;
export default authErrorSlice.reducer;