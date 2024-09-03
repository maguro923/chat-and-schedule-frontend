import React, { useEffect, useRef, useState } from 'react';
import { getFocusedRouteNameFromRoute, NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ScheduleHome from './../screens/schedulehome';
import ChatHome from './../screens/chathome';
import 'react-native-gesture-handler';
import { useSQLiteContext} from 'expo-sqlite/next';
import Login from './login';
import * as SecureStore from 'expo-secure-store';
import { useBooleanContext, BooleanProvider } from '../context/LoginStatusContext';
import { get_usersinfo, refresh, RefreshJsonInterface } from '../api/api';
import { useDispatch, useSelector } from 'react-redux';
import store, { AppDispatch, RootState } from '../redux/store';
import { getUserDataAsync, setUserDataAsync, setUserDataInterface } from '../redux/userDataSlice';
import { setErrorMessage } from '../redux/authErrorSlice';
import Icon from 'react-native-vector-icons/AntDesign';
import { format } from 'date-fns-tz';
import { connectWebSocket, sendWebSocketMessage } from '../redux/webSocketSlice';
import { addRoomParticipant, RoomsInfoInterface, setRoomsInfo } from '../redux/roomsInfoSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { setFriendRequests, setParticipantsInfo } from '../redux/participantsInfoSlice';
import { loadMessages } from '../database/loadmessages';
import { View } from 'react-native';
import { Avatar } from '@rneui/themed';
import { URL } from '../api/config';
import { setAddSchedule } from '../redux/overlaySlice';

type RootTabParamList = {
  ホーム: undefined;
  チャット: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function HomeScreen() {
  const db = useSQLiteContext();
  const { value, setValue } = useBooleanContext();

  const dispatch: AppDispatch = useDispatch();
  const device_id = useSelector((state: RootState) => state.deviceid);
  const userdata = useSelector((state: RootState) => state.userdata);

  const isCallRefresh = useRef(false);

  //websocket接続
  function connest_ws(access_token: string) {
    console.log("start connecting to websocket...");
    dispatch( connectWebSocket({ 
      user_id: userdata.userdata.id, 
      headers: { "access_token": access_token } }))
  }

  const is_connected_ws = useSelector((state: RootState) => state.webSocket.isConnected);
  useEffect(() => {
    const GetUsersInfo = async (participants: string[]) => {
      const [status,res] = await get_usersinfo(userdata.userdata.access_token,userdata.userdata.id,participants);
      if(status === 200){
        //DEV: console.log("ユーザ情報を取得しました",res);
        dispatch(setParticipantsInfo(res.users_info));
      }else{
        console.error("ユーザ情報の取得に失敗しました",res.detail);
      }
    }

    //ルーム参加していないフレンドのIDを取得しユーザー情報取得リストに追加
    const GetFrinendList = async (participants: string[]) => {
      const result = await dispatch(sendWebSocketMessage({"type":"GetFriendList","content":{}}))
      const response:any = unwrapResult(result);
      console.log("フレンドリストを取得しました",response);
      for (let friend of response.content.friend) {
        if(!participants.includes(friend)){
          participants.push(friend);
        }
      }
      for (let req of response.content.request) {
        if(!participants.includes(req)){
          participants.push(req);
        }
      }
      for (let request of response.content.request) {
        dispatch(setFriendRequests(request));
      }
      GetUsersInfo(participants);
    }

    const get_roomsinfo = async () => {
      if(is_connected_ws){
        try {
          const result = await dispatch(sendWebSocketMessage({"type":"GetRoomsInfo","content":{}}))
          const response:any = unwrapResult(result);
          if (response.content?.participants !== undefined && response.content?.participants !== null &&
              response.content?.roomlist !== undefined && response.content?.roomlist !== null) {
                //DEV: 
                console.log("ルーム情報を取得しました",response.content);
                dispatch(setRoomsInfo(response.content.roomlist as RoomsInfoInterface[]));
                //ルーム参加者一覧のリストを抽出
                let roomidlist:string[] = [];
                let userslist:string[] = [];
                for (let room of response.content.roomlist) {
                  if (!(room.id in roomidlist)){
                    roomidlist.push(room.id);
                  }
                  const participants_id = response.content.participants[room.id];
                  participants_id.forEach((id: string) => {
                    if(!userslist.includes(id) && id !== userdata.userdata.id){
                      userslist.push(id);
                    }
                  });
                }
                for (let roomid in response.content.participants) {
                  dispatch(addRoomParticipant({id: roomid, participants: response.content.participants[roomid]}));
                }
                loadMessages(db,dispatch,roomidlist,store.getState().messageslist.new_messages);
                GetFrinendList(userslist);
          }else{
            console.error("ルーム情報の取得に失敗しました",response.content?.message);
          }
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      }
    }
    get_roomsinfo();
  },[is_connected_ws]);

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
        avatar_path: userdata.userdata.avatar_path,
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
            connest_ws(res.access_token);
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
    const TokenRefresh = async () => {
      isCallRefresh.current = true;
      setValue(true);
      await dispatch(getUserDataAsync());
      isCallRefresh.current = false;
    }
    TokenRefresh();
  },[]);

  function getTabBarVisibility(route: any) {
    console.log(getFocusedRouteNameFromRoute(route));
    if (getFocusedRouteNameFromRoute(route) === "ChatScreen" || getFocusedRouteNameFromRoute(route) === "RoomInfoScreen") {
      return false;
    }
    return true;
  }

  function getHeaderVisibility(route: any) {
    if (getFocusedRouteNameFromRoute(route) === "ユーザー設定") {
      return false;
    }
    return true;
  }

  const message = useSelector((state: RootState) => state.messageslist.new_messages);
  const [count, setCount] = useState(0);
  useEffect(() => {
    var new_count = 0;
    for (const roomid in message) {
      new_count += message[roomid].length;
    }
    setCount(new_count);
  },[message]);

  const navigation:any = useNavigation();

  return (
        <Tab.Navigator >
            <Tab.Screen name="ホーム" component={ScheduleHome} options={({route}) => ({
              tabBarIcon:({focused})=> <Icon name="home" size={24} color={focused?"#007AFF":"gray"}/>,
              headerStyle: {backgroundColor: 'whitesmoke'},
              headerTitleStyle:{fontSize:30},
              headerShown: getHeaderVisibility(route),
              tabBarStyle:{display: getHeaderVisibility(route)?"flex":"none"},
              headerRight: (props) => (
                <View style={{marginRight:12,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Icon name="pluscircleo" size={30} onPress={() => dispatch(setAddSchedule(true))} />
                  <Avatar rounded size={36} source={{uri:URL+userdata.userdata.avatar_path}} 
                  containerStyle={{backgroundColor:"gray",marginLeft:24}} onPress={() => navigation.navigate("ホーム",{screen:"ユーザー設定"})}/>
                </View>
              ),
            })}/>
            <Tab.Screen name="チャット" component={ChatHome} options={({route}) => ({
              tabBarBadge: count===0 ? undefined : count,
              tabBarIcon:({focused})=> <Icon name="message1" size={24} color={focused?"#007AFF":"gray"} />,
              tabBarStyle:{display: getTabBarVisibility(route)?"flex":"none"},
              headerShown: false
            })}/>
        </Tab.Navigator>
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
    if(token_expires <= format(new Date(), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'})){
      dispatch(setErrorMessage("セッションの有効期限が切れました\n再度ログインしてください"));
      console.log("トークンの有効期限が切れています 再度ログインしてください");
      return false;
    }
    console.log("リフレッシュトークンは有効期限内です",token_expires);
    return true;
  }
  if(CheckUser() && value) {
    return (
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
  }   
  return <Login />;
}
