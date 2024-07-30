import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface loginStatusInterface {
    //storreと名前を同じにする
    statusnames:{
        status: boolean;
    }

}

export const loginStatusSlice = createSlice({
    name: 'status',//そんなに重要じゃない
    initialState: {
        status: false
    },
    reducers: {
        setstatus: (state,a:{payload:boolean}) => {
            state.status = a.payload;
        }
    }
})

export const { setstatus } = loginStatusSlice.actions;//アクションオブジェクトの取得

export default loginStatusSlice.reducer;