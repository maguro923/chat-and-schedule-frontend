import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BadgeState { badges: {[key: string]: number;} }
const initialState:BadgeState = { badges: {} };

export const counterSlice = createSlice({//でっかいjsonみたいなもの？ createSliceで生成
    name: 'badge',
    initialState,
    reducers: {
        badgemanager: (state, action:PayloadAction<string[]> ) => {
            state.badges["BottomTab"] = 0;
            for(const key of action.payload){
                state.badges[key] = 0;
            }
        },
    }
})

export const { badgemanager } = counterSlice.actions;//アクションオブジェクトの取得

export default counterSlice.reducer;