import React, { useEffect,useMemo,useRef,useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarList, LocaleConfig } from 'react-native-calendars';
import { Overlay } from '@rneui/themed';
import { format } from 'date-fns-tz';
import { Theme as CalendarTheme } from 'react-native-calendars/src/types';
import { useCalendarEvents } from '../utils/calendarevent';
import { CalendarDayItem } from './calendardayitem';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { deleteSchedule, Schedule } from '../redux/scheduleSlice';
import { setAddSchedule, setEditSchedule, setEditScheduleItem } from '../redux/overlaySlice';
import AddScheduleScreen from './addschedule';
import { loadSchedules } from '../database/loadschedules';
import { useSQLiteContext } from 'expo-sqlite';
import { delete_schedule } from '../database/deleteschedule';
import EditScheduleScreen from './scheduleinfo';
import { createStackNavigator } from '@react-navigation/stack';
import UesrInfoScreen from './userinfosetting';
import Icon from 'react-native-vector-icons/AntDesign';

//日本語化
LocaleConfig.locales.jp = {
    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};
LocaleConfig.defaultLocale = 'jp';

type RootStackParamList = {
  ScheduleHomeScreen: undefined;
  ユーザー設定: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function ScheduleHomeScreen() {
  const schedule = useSelector((state: RootState) => state.schedule.schedule);
  const dispatch: AppDispatch = useDispatch();
  const db = useSQLiteContext();
  const cellMinHeight = 80;
  const [isDisplayCalendar, setIsDisplayCalendar] = useState(true);
  const [is_DeleteSchedule, setIs_DeleteSchedule] = useState(false);
  const [longPressitem, setLongPressItem] = useState<Schedule>();
  const addschedule = useSelector((state: RootState) => state.overlay.addschedule);
  const editschedule = useSelector((state: RootState) => state.overlay.editschedule);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    //DEV: テスト用のダミーデータ
    /*dispatch(setSchedules([
      { id: 'id-1', text: '予定A', color: COLORS[0], fromAt: new Date(2024, 8, 1), toAt: new Date(2024, 8, 1),info:"これはテストです"},
      { id: 'id-2', text: '予定B', color: COLORS[1], fromAt: new Date(2024, 8, 3), toAt: new Date(2024, 8, 5),info:"これはテストです"},
      { id: 'id-6', text: '予定F', color: COLORS[5], fromAt: new Date(2024, 8, 23), toAt: new Date(2024, 8, 24),info:"これはテストです"},
      { id: 'id-7', text: '予定G', color: COLORS[6], fromAt: new Date(2024, 8, 24), toAt: new Date(2024, 8, 24),info:"これはテストです"},
      { id: 'id-8', text: '予定H', color: COLORS[7], fromAt: new Date(2024, 8, 29), toAt: new Date(2024, 8, 29),info:"これはテストです"},
      { id: 'id-3', text: '予定C', color: COLORS[2], fromAt: new Date(2024, 8, 4), toAt: new Date(2024, 8, 8),info:"これはテストです"},
      { id: 'id-4', text: '予定D', color: COLORS[3], fromAt: new Date(2024, 8, 21), toAt: new Date(2024, 8, 24),info:"これはテストです"},
      { id: 'id-5', text: '予定E', color: COLORS[4], fromAt: new Date(2024, 8, 23), toAt: new Date(2024, 8, 23),info:"これはテストです"},
      { id: 'id-9', text: '予定I', color: COLORS[8], fromAt: new Date(2024, 8, 30), toAt: new Date(2024, 8, 31),info:"これはテストです"},
      { id: 'id-10', text: '予定J', color: COLORS[9], fromAt: new Date(2024, 8, 31), toAt: new Date(2024, 8, 31),info:"これはテストです"}
    ]));*/
    loadSchedules(db,dispatch);
  },[]);

  const { eventItems } = useCalendarEvents();

  // カレンダーのテーマを定義
  const theme = useColorScheme();
  const calendarTheme: CalendarTheme = useMemo(
    () => ({
      monthTextColor: '#000',
      textMonthFontWeight: 'bold',
      calendarBackground: 'transparent',
      arrowColor: '#0000ff',
    }),
    [theme],
  );

  //予定削除処理
  const delschedule = (id: string | undefined) => {
    if (id !== undefined){
      delete_schedule(id);
      dispatch(deleteSchedule(id));
      setIs_DeleteSchedule(false);
    }else{
      console.error("IDが不正です");
      setIs_DeleteSchedule(false);
    }
  }

  //フラットリストの中身
  const renderSchedule = ({ item }: { item: Schedule }) => {
    return (
      <Pressable onPress={() => {
        dispatch(setEditSchedule(true));
        dispatch(setEditScheduleItem(item))
      }} onLongPress={() => {
        setLongPressItem(item);
        setIs_DeleteSchedule(true);
      }}>
      <View style={{backgroundColor:item.color+'99',margin:5,padding:5,borderRadius:5}}>
        <Text style={{fontSize:24}}>{item.text}</Text>
        <Text style={{fontSize:16}}>{format(item.fromAt,"yyyy年M月d日 HH:mm")} 〜 {format(item.toAt,"yyyy年M月d日 HH:mm")}</Text>
        <Text style={{fontSize:16}}>{item.info}</Text>
      </View>
      </Pressable>
    );
  }

  return (
    <View style={{backgroundColor:"white",height:"100%",justifyContent:"space-around"}}>
      <View style={{height:isDisplayCalendar?'auto':'30%'}}>
        <ScrollView>
        <CalendarList
          style={{height:"auto",backgroundColor:"white"}}
          showSixWeeks={false}
          horizontal={true}
          pagingEnabled={true}
          pastScrollRange={12}
          futureScrollRange={12}
          firstDay={1}
          hideExtraDays={false}
          monthFormat="yyyy年 M月"
          calendarStyle={{backgroundColor:"#fff"}}
          theme={calendarTheme}
          markingType='custom'
          dayComponent={(d) => <CalendarDayItem {...d} eventItems={eventItems}
                          cellMinHeight={cellMinHeight} flatListRef={flatListRef}
                          setIsDisplayCalendar={setIsDisplayCalendar} />}
        />
        {isDisplayCalendar?
        <Pressable style={{}} onPress={() => setIsDisplayCalendar(false)}>
          <Text style={{
            backgroundColor:"whitesmoke",fontSize:20,marginBottom:10,marginHorizontal:10,width:150,textAlign:'center'}}>予定表を開く</Text>
        </Pressable>:<></>}
        </ScrollView>
      </View>
      {isDisplayCalendar?<></>:
      <Pressable onPress={() => setIsDisplayCalendar(true)}>
        <Text style={{backgroundColor:"whitesmoke",position:"absolute",bottom:0,fontSize:20,width:180,textAlign:'center'}}>予定表を閉じる
        </Text>
      </Pressable>}
      <>
      {schedule.length === 0?
        <View style={{flex:1,alignContent:'center',justifyContent:"center",backgroundColor:"#fff"}}>
        <Text style={{fontSize:24,alignSelf:"center"}}>予定がありません</Text>
        </View>
        :
        <FlatList data={[...schedule].sort((a,b) => {return a.fromAt.getTime() - b.fromAt.getTime();})} renderItem={renderSchedule} ref={flatListRef} initialNumToRender={1000} />}
      </>
      <Overlay isVisible={is_DeleteSchedule} overlayStyle={{width: "70%", height: "30%"}}
      onBackdropPress={() => {
        setIs_DeleteSchedule(false);
      }}>
        <View style={styles.header}>
            <Text style={{fontSize:24,fontWeight:"bold"}}>{longPressitem?.text}</Text>
        </View>
        <Text style={{fontSize:16,marginTop:10,marginBottom:6}}>この予定を削除しますか？</Text>
        <Text style={{fontSize:16}}>この操作は取り消すことができません</Text>
        <View style={{flex:1,flexDirection:"row"}}>
          <Pressable style={{margin:10,flex:1,justifyContent:"center",alignItems:"center"}} onPress={() => setIs_DeleteSchedule(false)}>
            <Text style={{padding:12,paddingHorizontal:30}}>戻る</Text>
          </Pressable>
          <Pressable style={{margin:10,flex:1,marginLeft:0,justifyContent:"center",alignItems:"center"}} onPress={() => delschedule(longPressitem?.id)}>
            <Text style={{padding:12,paddingHorizontal:30}}>削除</Text>
          </Pressable>
        </View>
      </Overlay>
      <Overlay isVisible={editschedule} overlayStyle={{width: "90%", height: "60%"}}
      onBackdropPress={() => dispatch(setEditSchedule(false))}>
        <EditScheduleScreen />
      </Overlay>
      <Overlay isVisible={addschedule} overlayStyle={{width: "90%", height: "60%"}}
      onBackdropPress={() => dispatch(setAddSchedule(false))}>
        <AddScheduleScreen />
      </Overlay>
    </View>
  );
}

export default function ScheduleHome() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ScheduleHomeScreen" component={ScheduleHomeScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="ユーザー設定" component={UesrInfoScreen} options={({route}) => ({
        header(props) {
          return (
            <SafeAreaView>
            <View style={{height:50,backgroundColor: 'whitesmoke', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Icon name={"left"} size={30} style={{marginLeft: 20}} onPress={() => props.navigation.goBack()} />
              <Text style={{marginLeft: 20,fontSize: 30,marginRight:"auto"}}>ユーザー情報</Text>
            </View>
            </SafeAreaView>
          );
        }
      })} />
    </Stack.Navigator>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
});