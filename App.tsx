import 'react-native-gesture-handler';
import React, { Suspense, useEffect, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import * as SQLite from 'expo-sqlite';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import Switcher from './src/screens/switcher';
import { BooleanProvider } from './src/context/LoginStatusContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/database/database';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { setErrorMessage } from './src/redux/authErrorSlice';
import { useDispatch } from 'react-redux';
import { useBooleanContext } from './src/context/LoginStatusContext';
import { AppDispatch } from './src/redux/store';

let InitializedToken = false;

function Fcmtoken(){
  const dispatch: AppDispatch = useDispatch();
  const { value, setValue } = useBooleanContext();

  useEffect(() => {
    const getFCMToken = async () => {
      if (Device.isDevice) {
        //Push通知の許可を取得
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          //初回起動時は許可ダイアログを出してユーザからPush通知の許可を取得
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          //許可がない場合
          console.log('Failed to get push token for push notification');
          await SecureStore.setItemAsync('FCMToken','');
        }else{
          //通知用トークンの取得
          const { data:fcmToken } = await Notifications.getDevicePushTokenAsync();
          console.log(fcmToken);
          // トークンの保存
          const token = await SecureStore.getItemAsync('FCMToken')
          .then(async(token) => {
            if (token === undefined || token === null) {
              //初回起動時
              await SecureStore.setItemAsync('FCMToken',fcmToken);
            }else if(token !== fcmToken){
              //トークンが変わった場合
              await SecureStore.setItemAsync('FCMToken',fcmToken)
              .then(() =>{
                dispatch(setErrorMessage("トークンが変更されました\n再度ログインしてください"));
                setValue(false);
              });
            }
          });
        }
      } else {
        //実機以外の場合
        alert('Must use physical device!');
      }
    };
    if (!InitializedToken){
      InitializedToken = true;
      getFCMToken();
    }
  }, []);
  return <Switcher />
}

const db = SQLite.openDatabaseSync('SQLiteDB.db');//データベースの読み込み
let Initialized = false;

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // データベースの初期化処理
    const initializeDB = async () => {
      try {
        await initializeDatabase(db)
        .then(() => {console.log('Table initialized');})
      } catch (error) {
        console.error('Error initializing table', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!Initialized){
      Initialized = true;
      initializeDB();
    }
  }, []);


  if(isLoading){//データベースが読み込まれるまでローディング画面表示 失敗時は長く表示
    return (
      <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
        <ActivityIndicator size={100} />
      </View>
    );
  }
  return (
      <Suspense fallback={
        // ローディング画面　巨大データロード時にその間だけ表示　普段は表示されない(短時間のため)
        <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
          <ActivityIndicator size={100} />
        </View>
      }>
        <Provider store={store}>
            <SQLite.SQLiteProvider databaseName="SQLiteDB.db">
              <BooleanProvider>
                <SafeAreaProvider>
                  <Fcmtoken />
                </SafeAreaProvider>
              </BooleanProvider>
            </SQLite.SQLiteProvider>
        </Provider>
      </Suspense>
  );
}