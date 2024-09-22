import { useMemo } from 'react';
//import { CalendarItem } from '@/types/CalendarItem';
import dayjs from 'dayjs';
import { format } from 'date-fns-tz';
import store from '../redux/store';

export const useCalendarEvents = () => {
  const raw_events = store.getState().schedule.schedule;
  const events = [...raw_events].sort((a, b) => a.fromAt.getTime() - b.fromAt.getTime());
  const eventItems = useMemo(() => {
    const result = new Map<string, any[]>();
    for (const event of events) {
      //console.log("hook-map",event);
      const dayKey = format(event.fromAt, "yyyy-MM-dd");//ddd MMM dd yyyy HH:mm:ss
      const diff = dayjs(event.toAt).endOf("D").diff(dayjs(event.fromAt).endOf("D"), 'day') + 1;
      if (diff == 1) {
        // 予定が1日以内の場合
        const currentData = result.get(dayKey);
        // 既に既存データがある場合は下に表示させるため表示順を取得
        const maxIndex = currentData?.reduce((p, c) => Math.max(p, c.index), 0);
        result.set(dayKey, [
          ...(currentData ?? []),
          {
            id: event.id,
            index: maxIndex != undefined ? maxIndex + 1 : 0, // 既にある予定の下に表示
            color: event.color,
            text: event.text,
            type: 'all',
          },
        ]);
      } else {
        // 予定が1日以上の場合
        let index: null | number = null;
        // 予定が複数日に跨る場合は該当分処理する
        Array(diff)
          .fill(null)
          .map((_, i) => {
            const date = format(dayjs(new Date(dayKey)).add(i, 'day').toDate(), "yyyy-MM-dd"); // 例: 予定が 12/1 ~ 12/4 の場合、12/1, 12/2, 12/3, 12/4となる
            const currentData = result.get(date);
            if (index == null) index = currentData?.length ?? 0; // 既存の予定と被らないよう該当日付の予定数を取得しインデックスに指定
            result.set(date, [
              ...(currentData ?? []),
              {
                id: event.id,
                index,
                color: event.color,
                text: event.text,
                type: i == 0 ? 'start' : i == diff - 1 ? 'end' : 'between', // 表示タイプの指定 (start:予定開始日 / between:予定中間日 / end:予定終了日 / all:全日)
              },
            ]);
          });
      }
    };
    return result;
  }, [events]);
  //console.log("hook-eventItems",eventItems);
  return { eventItems };
};