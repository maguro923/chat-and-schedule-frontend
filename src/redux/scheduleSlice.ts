import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const COLORS = [
  '#A3D10C',
  '#8FBC8B',
  '#20B2AA',
  '#FFE944',
  '#FFD700',
  '#DEB887',
  '#FFA07A',
  '#FB7756',
  '#FF4D4D',
  '#FF99E6',
  '#CDA5F3',
  '#B0C4DE',
  '#87CEEB',
  '#9999FF',
  '#6B7DB3',
  '#778899',
  '#6F6D78',
];


export interface Schedule {
    id: string;
    text: string;
    info: string;
    color: string;
    fromAt: Date;
    toAt: Date;
}

export  interface ParticipantsInfoInterface {
    schedeule: Schedule[]
    schedule_id: string[]
}
export const userDataSlice = createSlice({
    name: 'schedule',
    initialState: {
        schedule: <Schedule[]>[],
        schedule_id: <string[]>[]
    },
    reducers: {
        setSchedules: (state, action: PayloadAction<Schedule[]>) => {
            for (const schedule of action.payload) {
                //IDが重複していないか(既に予定が存在していないか)確認
                if (!state.schedule_id.includes(schedule.id)) {
                    state.schedule.push(schedule);
                    state.schedule_id.push(schedule.id);
                }
            }
            //state.schedule.sort((a, b) => {return a.fromAt.getTime() - b.fromAt.getTime();});
        },
        setSchedule: (state, action: PayloadAction<Schedule>) => {
            //IDが重複していないか(既に予定が存在していないか)確認
            if (!state.schedule_id.includes(action.payload.id)) {
                state.schedule.push(action.payload);
                state.schedule_id.push(action.payload.id);
            }
        },
        deleteSchedule: (state, action: PayloadAction<string>) => {
            state.schedule = state.schedule.filter(schedule => schedule.id !== action.payload);
            state.schedule_id = state.schedule_id.filter(id => id !== action.payload);
        },
        changeSchedule: (state, action: PayloadAction<Schedule>) => {
            state.schedule = state.schedule.map(schedule => {
                if (schedule.id === action.payload.id) {
                    return action.payload;
                } else {
                    return schedule;
                }
            });
        },
        
    },
})

export const { setSchedules, setSchedule, deleteSchedule,changeSchedule } = userDataSlice.actions;//アクションオブジェクトの取得

export default userDataSlice.reducer;