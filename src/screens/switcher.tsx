import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ScheduleHome from './../screens/schedulehome';
import ChatHome from './../screens/chathome';
import 'react-native-gesture-handler';
import {SQLiteProvider, useSQLiteContext} from 'expo-sqlite/next';
import Login from './login';
import * as SecureStore from 'expo-secure-store';
import { useBooleanContext, BooleanProvider } from '../context/LoginStatusContext';
import { refresh, RefreshJsonInterface } from '../api/api';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Tab = createBottomTabNavigator();

function HomeScreen() {
  const flag = false;//dev
  const count = 1;//dev
  const db = useSQLiteContext();
  const { value, setValue } = useBooleanContext();

  useEffect(() => {
    setValue(true);
    /*console.log("useEffect",value)
    db.withTransactionAsync(async () => {
      await getData();
    })*/

    //ログイン後にリフレッシュトークンを用いてアクセストークンを再発行
    const TokenRefresh = async () => {
      const device_id = useSelector((state: RootState) => state.deviceid);
      const token = useSelector((state: RootState) => state.userdata);
      const sendJson: RefreshJsonInterface = {
        refresh_token: token.userdata.refresh_token,
        device_id: device_id.deviceid
      };
      const [status,res] = await refresh(sendJson);
      //レスポンスに対する処理
      console.log("status:",status);
      console.log("res:",res);
    }
    TokenRefresh();
  },[]);
  async function getData(){
      const result = await db.getAllAsync(
        "select name from sqlite_master where type='table';"
      );
      console.log("result is:",result);
  }
  return (
    <NavigationContainer independent={true}>
        <Tab.Navigator screenOptions={{headerShown: false}}>
            <Tab.Screen name="スケジュール" component={ScheduleHome}/>
            <Tab.Screen name="チャット" component={ChatHome} options={{
              tabBarBadge: flag ? count : undefined,
            }}/>
        </Tab.Navigator>
    </NavigationContainer>
  );
}


export default function Switcher () {
  const { value, setValue } = useBooleanContext();

  const CheckUser = () => {
    const raw_token = SecureStore.getItem("refresh_token");
    const raw_token_expires = SecureStore.getItem("refresh_token_expires");
    if(raw_token === undefined || raw_token_expires === undefined){
      return false;
    }
    const token: string = raw_token as string;
    const token_expires: string = raw_token_expires as string;
    // トークンの有効期限を確認
    if(token_expires <= new Date().toISOString()){
      console.log("トークンの有効期限が切れています 再度ログインしてください");
      return false;
    }
    console.log("リフレッシュトークンは有効期限内です",token_expires);
    return true;
  }
  if(CheckUser() || value) {
    return <HomeScreen />;
  }else{      
    return <Login />;
  }
}
