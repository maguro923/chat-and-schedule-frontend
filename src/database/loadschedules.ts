import { SQLiteDatabase } from "expo-sqlite";
import { AppDispatch } from "../redux/store";
import { Schedule, setSchedules } from "../redux/scheduleSlice";

export const loadSchedules = async(db:SQLiteDatabase,dispatch:AppDispatch) => {
    var scheduleslsit:Schedule[] = []
    const res:any = await db.getAllAsync("SELECT * FROM schedules")
    //console.log('RESULT IS:',res)
    if (res[0] === undefined || res[0] === null || res.length === 0){
        console.log("スケジュールがありません");
        return;
    }
    for (const schedule of res) {
        const schedule_info:Schedule = {
            id: schedule.id,
            text: schedule.text,
            info: schedule.info,
            fromAt: new Date(schedule.fromAt),
            toAt: new Date(schedule.toAt),
            color: schedule.color
        };
        scheduleslsit = [...scheduleslsit, schedule_info];
    }
    //スケジュールをリストに追加
    dispatch(setSchedules(scheduleslsit))
}