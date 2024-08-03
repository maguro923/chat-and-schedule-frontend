import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from 'expo-secure-store';

export  interface userDataInterface {
    //storreと名前を同じにする
    userdata:{
        name: string;
        id: string;
        access_token: string;
        access_token_expires: string;
        refresh_token: string;
        refresh_token_expires: string;
    }
}

export interface setUserDataInterface {
    name: string;
    id: string;
    access_token: string;
    access_token_expires: string;
    refresh_token: string;
    refresh_token_expires: string;
}

// 非同期アクションの作成
export const setUserDataAsync = createAsyncThunk(
    'userdata/setUserDataAsync',
    async (userData: setUserDataInterface, { dispatch }) => {
        // SecureStoreにデータを保存
        //console.log("setUserDataAsync",userData);
        await SecureStore.setItemAsync("username", userData.name);
        await SecureStore.setItemAsync("userid", userData.id);
        await SecureStore.setItemAsync("access_token", userData.access_token);
        await SecureStore.setItemAsync("access_token_expires", userData.access_token_expires);
        await SecureStore.setItemAsync("refresh_token", userData.refresh_token);
        await SecureStore.setItemAsync("refresh_token_expires", userData.refresh_token_expires);

        dispatch(setUserData(userData));
        return userData;
    }
);

// Async thunk for getting user data from secure store
export const getUserDataAsync = createAsyncThunk(
    'userdata/getUserDataAsync',
    async (_, { dispatch }) => {
        const name = await SecureStore.getItemAsync("username");
        const id = await SecureStore.getItemAsync("userid");
        const access_token = await SecureStore.getItemAsync("access_token");
        const access_token_expires = await SecureStore.getItemAsync("access_token_expires");
        const refresh_token = await SecureStore.getItemAsync("refresh_token");
        const refresh_token_expires = await SecureStore.getItemAsync("refresh_token_expires");
        
        const userData: setUserDataInterface = {
            name: name || "",
            id: id || "",
            access_token: access_token || "",
            access_token_expires: access_token_expires || "",
            refresh_token: refresh_token || "",
            refresh_token_expires: refresh_token_expires || ""
        };
        dispatch(setUserData(userData));
        return;
    }
);

export const userDataSlice = createSlice({
    name: 'userdata',//そんなに重要じゃない
    initialState: {
        userdata: {
            name: "",
            id: "",
            access_token: "",
            access_token_expires: "",
            refresh_token: "",
            refresh_token_expires: "",
        }
    },
    reducers: {
        setUserData: (state, action: PayloadAction<setUserDataInterface>) => {
            state.userdata = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(setUserDataAsync.fulfilled, (state, action: PayloadAction<setUserDataInterface>) => {
            //state.userdata = action.payload;
            //console.log("call setUserDataAsync.fulfilled:",action.payload);
        });
        builder.addCase(getUserDataAsync.fulfilled, (state) => {
            //state.userdata = action.payload;
            //console.log("call getUserDataAsync.fulfilled");
        });
    }
})

export const { setUserData } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;