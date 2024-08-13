import React, { useContext, useEffect, useRef, useState } from 'react';
import { getFocusedRouteNameFromRoute, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ScheduleHome from './../screens/schedulehome';
import ChatHome from './../screens/chathome';
import 'react-native-gesture-handler';
import {SQLiteProvider, useSQLiteContext} from 'expo-sqlite/next';
import Login from './login';
import * as SecureStore from 'expo-secure-store';
import { useBooleanContext, BooleanProvider } from '../context/LoginStatusContext';
import { refresh, RefreshJsonInterface } from '../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getUserDataAsync, setUserDataAsync, setUserDataInterface } from '../redux/userDataSlice';
import { setErrorMessage } from '../redux/authErrorSlice';
import Icon from 'react-native-vector-icons/AntDesign';
import { sub } from 'date-fns';
import { format } from 'date-fns-tz';

const Tab = createBottomTabNavigator();

function HomeScreen() {
  const flag = false;//dev
  const count = 1;//dev
  const db = useSQLiteContext();
  const { value, setValue } = useBooleanContext();

  const dispatch: AppDispatch = useDispatch();
  const device_id = useSelector((state: RootState) => state.deviceid);
  const userdata = useSelector((state: RootState) => state.userdata);

  const isCallRefresh = useRef(false);

  useEffect(() => {
    const TokenRefresh = async () => {
      const sendJson: RefreshJsonInterface = {
        refresh_token: userdata.userdata.refresh_token,
        device_id: device_id.deviceid
      };
      const [status,res] = await refresh(sendJson);
        const new_userdata: setUserDataInterface = {
          name: userdata.userdata.name,
          id: userdata.userdata.id,
          access_token: res.access_token,
          access_token_expires: res.access_token_expires,
          refresh_token: userdata.userdata.refresh_token,
          refresh_token_expires: userdata.userdata.refresh_token_expires
        };
        //レスポンスに対する処理
        if(status === 200){
          console.log("アクセストークンの再発行に成功しました");
          await dispatch(setUserDataAsync(new_userdata))
          .then(() => {
            console.log("アクセストークンを保存しました")
          });
        }else {
          dispatch(setErrorMessage("不明なエラーが発生しました"))
        }
        if(status === 400){
          console.log("リクエストの形式が異なるようです",res.detail)
          setValue(false);
        }else if(status === 401){
          console.log("アクセストークンの再発行に失敗しました",status,res.detail);
          setValue(false);
        }else if(status === 403){
          if (res.detail === "Token has expired") {
            console.log("リフレッシュトークンの有効期限が切れています",res.detail);
            setValue(false);
          }else if (res.detail === "Invalid device_id") {
            console.log("あなたのデバイスは登録されていません",res.detail);
            setValue(false);
          }else{
            console.log("アクセストークンの再発行に失敗しました",status,res.detail);
            setValue(false);
          }
        }else if(status !== 200){
          console.log("アクセストークンの再発行に失敗しました",status,res.detail);
          setValue(false);
        }
    };
    if (isCallRefresh.current){
      TokenRefresh();
    }
  },[userdata]);

  useEffect(() => {
    /*console.log("useEffect",value)
    db.withTransactionAsync(async () => {
      await getData();
    })*/
    const TokenRefresh = async () => {
      isCallRefresh.current = true;
      console.log("first");
      setValue(true);
      await dispatch(getUserDataAsync());
      console.log("first finish");
      isCallRefresh.current = false;
    }
    TokenRefresh();
  },[]);

  function getTabBarVisibility(route: any) {
    if (getFocusedRouteNameFromRoute(route) === "ChatScreen" ?? "") {
      return false;
    }
    return true;
  }

  return (
    <NavigationContainer>
        <Tab.Navigator screenOptions={{headerShown: false}}>
            <Tab.Screen name="ホーム" component={ScheduleHome} options={{
              tabBarIcon:({focused})=> <Icon name="home" size={24} color={focused?"#007AFF":"gray"}/>,
            }}/>
            <Tab.Screen name="チャット" component={ChatHome} options={({route}) => ({
              tabBarBadge: flag ? count : undefined,
              tabBarIcon:({focused})=> <Icon name="message1" size={24} color={focused?"#007AFF":"gray"} />,
              tabBarStyle:{display: getTabBarVisibility(route)?"flex":"none"}
            })}/>
        </Tab.Navigator>
    </NavigationContainer>
  );
}


export default function Switcher () {
  const { value, setValue } = useBooleanContext();
  const dispatch: AppDispatch = useDispatch();

  const CheckUser = () => {
    const raw_token = SecureStore.getItem("refresh_token");
    const raw_token_expires = SecureStore.getItem("refresh_token_expires");
    if(raw_token === undefined || raw_token_expires === undefined){
      //リフレッシュトークンがない
      return false;
    }
    const token: string = raw_token as string;
    const token_expires: string = raw_token_expires as string;
    // トークンの有効期限を確認
    if(token_expires <= format(sub(new Date(),{hours:9}), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'})){
      dispatch(setErrorMessage("セッションの有効期限が切れました\n再度ログインしてください"));
      console.log("トークンの有効期限が切れています 再度ログインしてください");
      return false;
    }
    console.log("リフレッシュトークンは有効期限内です",token_expires);
    return true;
  }
  if(CheckUser() && value) {
    return <HomeScreen />;
  }   
  return <Login />;
}
