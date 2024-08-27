import React, { useEffect,useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@rneui/base';
import { Calendar, CalendarList, Agenda, LocaleConfig } from 'react-native-calendars';

//日本語化
LocaleConfig.locales.jp = {
    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};
LocaleConfig.defaultLocale = 'jp';

export default function ScheduleHome() {
    const [selected, setSelected] = useState('');
    return (
        <SafeAreaView style={styles.container}>
            <Calendar
                showSixWeeks
                pastScrollRange={36}//3年前まで表示
                futureScrollRange={24}//2年先まで表示
                monthFormat="yyyy年 M月"
                onDayPress={(day:any) => {
                    setSelected(day.dateString);
                }}
                markedDates={{
                    [selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
                }}
                style={{height: "100%",width: "100%",}}
                theme={{
                    'stylesheet.calendar.main': {
                      monthView: {
                        flex: 1,
                        height: '100%',
                        justifyContent: 'space-around'
                      },
                      week: {
                        flex: 1,
                        marginVertical: 0,
                        flexDirection: 'row',
                        justifyContent: 'space-around'
                      },
                      dayContainer: {
                        borderColor: '#f5f5f5',
                        borderWidth: 1,
                        flex:1,
                      },
                    }
                  }}
                />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    button: {
        width: "39%",
        marginTop: 20,
        alignSelf: "center",
        justifyContent: "center",
    },
});