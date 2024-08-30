import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Schedule } from "./scheduleSlice";

export  interface ParticipantsInfoInterface {
    addfriend: boolean;
    addroom: boolean;
    addparticipant: boolean;
    addschedule: boolean;
    editschedule: boolean;
    editschedule_item: Schedule
}
export const userDataSlice = createSlice({
    name: 'overlayState',
    initialState: {
        addfriend: false,
        addroom: false,
        addparticipant: false,
        addschedule: false,
        editschedule: false,
        editschedule_item: {
            id: "",
            text: "",
            info: "",
            color: "",
            fromAt: new Date(),
            toAt: new Date()
        }
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
        setAddSchedule: (state, action: PayloadAction<boolean>) => {
            state.addschedule = action.payload;
        },
        setEditSchedule: (state, action: PayloadAction<boolean>) => {
            state.editschedule = action.payload;
        },
        setEditScheduleItem: (state, action: PayloadAction<Schedule>) => {
            state.editschedule_item = action.payload;
        }
    },
})

export const { setAddFriend,setAddRoom,setAddParticipant,setAddSchedule,setEditSchedule,setEditScheduleItem } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;