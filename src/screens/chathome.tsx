import React, { cloneElement, useEffect, useRef, useState } from 'react';
import {  Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ListItem } from '@rneui/base'
import Chat from './chat';
import { format } from 'date-fns-tz';
import { set, sub } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { Avatar, Badge } from '@rneui/themed';
import { createStackNavigator } from '@react-navigation/stack';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { URL } from '../api/config';
import Icon from 'react-native-vector-icons/AntDesign';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Overlay } from '@rneui/themed';
import { setAddFriend, setAddParticipant, setAddRoom } from '../redux/overlaySlice';
import AddFriendScreen from './addfriend';
import AddRoomScreen from './addroom';
import { sendWebSocketMessage } from '../redux/webSocketSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { deleteRoominfo } from '../redux/roomsInfoSlice';
import { delete_messages } from '../database/deletemessages';
import { focusMessages } from '../redux/messagesListSlice';

type RootStackParamList = {
  ChatHomeScreen: undefined;
  ChatScreen: { roomid: string, roomname: string };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

const Stack = createStackNavigator<RootStackParamList>();

export interface RoomListInterface {
  id: string;
  name: string;
  avatar_path: string;
  message: string;
  latest_at: string;
}

function ChatHomeScreen({route, navigation}: RootStackScreenProps<'ChatHomeScreen'>) {
  const dispatch:AppDispatch = useDispatch();
  const [roomList, setRoomList] = useState<RoomListInterface[]>([]);
  const rooms_info = useSelector((state: RootState) => state.roomsinfo.roomsInfo.rooms);
  const messages = useSelector((state: RootState) => state.messageslist.new_messages);
  const latest_message = useSelector((state: RootState) => state.messageslist.latest_message);
  const [is_RoomSetting, setIs_RoomSetting] = useState(false);
  const [longPressID, setLongPressID] = useState("");
  const [longPressName, setLongPressName] = useState("");

  useEffect(() => {
    let RoomsList = [];
    let latest_msg_keys = [];
    for (let key in latest_message) {
      latest_msg_keys.push(key);
    }
    for (let room  of rooms_info) {
      RoomsList.push({id: room.id, name: room.name, avatar_path: room.avatar_path,
        message: !latest_msg_keys.includes(room.id) || (latest_message[room.id].content==="" || latest_message[room.id].content===undefined) ? "メッセージはありません": latest_message[room.id].content
        , latest_at:!latest_msg_keys.includes(room.id) || (latest_message[room.id].content==="" || latest_message[room.id].content===undefined) ? rooms_info.filter(r => r.id === room.id)[0].joined_at : latest_message[room.id].latest_at});
    }
      setRoomList((prevList)=>{
        const updatedList = [...RoomsList];
        return updatedList.sort((a, b) =>
          new Date(b.latest_at).getTime() - new Date(a.latest_at).getTime()
        );
      });
    
  }, [rooms_info, latest_message]);

  const send_LeaveRoomRequest = async() => {
    const result = await dispatch(sendWebSocketMessage({"type":"LeaveRoom","content":{"roomid":longPressID}}))
    const response:any = unwrapResult(result);
    if (response.content.message !== "Room left" && response.content.message !== "Delete Room"){
      console.error("ルーム退出に失敗しました",response.content?.message);
    }else{
      dispatch(deleteRoominfo(longPressID));
      delete_messages(longPressID);
      dispatch(focusMessages({roomid:longPressID}));
    }
    setIs_RoomSetting(false);
  }

  const addFriend = useSelector((state: RootState) => state.overlay.addfriend);
  const addRoom = useSelector((state: RootState) => state.overlay.addroom);
  return (
    <>
      {roomList.length === 0?
      <View style={{flex:1,alignContent:'center',justifyContent:"center",backgroundColor:"#fff"}}>
      <Text style={{fontSize:24,alignSelf:"center"}}>ルームがありません</Text>
      </View>
      :
      <ScrollView style={styles.container}>
      {roomList.map((room) => (
        <ListItem key={room["id"]} onPress={() => navigation.navigate(
          "ChatScreen",{roomid: room["id"], roomname: room["name"]}
          )} onLongPress={()=>{
            setIs_RoomSetting(true)
            setLongPressID(room.id)
            setLongPressName(room.name)}}>
          <Avatar rounded size={50} source={{uri:URL+room['avatar_path']}} containerStyle={{backgroundColor:"gray"
          }}/>
          <ListItem.Content>
            <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{room["name"]}</ListItem.Title>
            <ListItem.Subtitle numberOfLines={1}>{room["message"]}</ListItem.Subtitle>
          </ListItem.Content>
          {messages[room.id]===undefined || messages[room.id].length===0 ? <></>: <Badge value={messages[room.id].length}
          textStyle={{fontSize: 14}}
          badgeStyle={{width: 28, height: 28, borderRadius: 14}}
          status="primary" />}
        </ListItem>
      ))}
      </ScrollView>
      }
      <Overlay isVisible={is_RoomSetting} overlayStyle={{width: "70%", height: "30%"}}
      onBackdropPress={() => {
        setIs_RoomSetting(false);
      }}>
        <View style={styles.header}>
            <Text style={{fontSize:24,fontWeight:"bold"}}>{longPressName}</Text>
        </View>
        <View>
          <Text style={{fontSize:16,marginTop:10,marginBottom:6}}>このルームから退出しますか？</Text>
          <Text style={{fontSize:16}}>参加者があなただけの場合</Text>
          <Text style={{fontSize:16}}>ルームは削除されます</Text>
        </View>
        <View style={{flex:1,flexDirection:"row"}}>
          <Pressable style={{margin:10,flex:1,justifyContent:"center",alignItems:"center"}} onPress={() => setIs_RoomSetting(false)}>
            <Text style={{padding:12,paddingHorizontal:30}}>戻る</Text></Pressable>
          <Pressable style={{margin:10,flex:1,marginLeft:0,justifyContent:"center",alignItems:"center"}} onPress={() => send_LeaveRoomRequest()}>
            <Text style={{padding:12,paddingHorizontal:30}}>退出</Text></Pressable>
        </View>
      </Overlay>
      <Overlay isVisible={addFriend} overlayStyle={{width: "90%", height: "70%"}}
      onBackdropPress={() => dispatch(setAddFriend(false))}>
        <AddFriendScreen />
      </Overlay>
      <Overlay isVisible={addRoom} overlayStyle={{width: "90%", height: "70%"}}
      onBackdropPress={() => dispatch(setAddRoom(false))}>
        <AddRoomScreen />
      </Overlay>
    </>
  );
}

export default function ChatHome() {
  const dispatch:AppDispatch = useDispatch();
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatHomeScreen" component={ChatHomeScreen} options={{
        header(props) {
          return (
            <SafeAreaView>
            <View style={{height:50,backgroundColor: 'whitesmoke', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={{fontSize: 30, marginLeft: 20}}>チャット</Text>
              <Icon name={"adduser"} size={30} style={{marginLeft: "auto",marginRight: 20}} onPress={() => dispatch(setAddFriend(true))} />
              <Icon name={"pluscircleo"} size={30} style={{marginRight: 20}} onPress={() => dispatch(setAddRoom(true))} />
            </View>
            </SafeAreaView>
          );
        },
      }} />
      <Stack.Screen name="ChatScreen" component={Chat} options={({route}) => ({
        header(props) {
          return (
            <SafeAreaView>
            <View style={{height:50,backgroundColor: 'whitesmoke', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Icon name={"left"} size={30} style={{marginLeft: 20}} onPress={() => props.navigation.goBack()} />
              <Text style={{marginLeft: 20,fontSize: 30}}>{route.params.roomname}</Text>
              <Icon name={"adduser"} size={30} style={{marginLeft: "auto", marginRight: 20}} onPress={() => dispatch(setAddParticipant(true))} />
            </View>
            </SafeAreaView>
          );
        }
      })}/>
    </Stack.Navigator>
  );
}
//Icon name={"setting"} size={24} style={{marginRight: 20}} onPress={() => console.log("Setting")} />

const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: "100%",
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
});