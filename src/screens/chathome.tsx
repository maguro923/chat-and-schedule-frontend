import React, { useEffect, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { URL } from '../api/config';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

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
  const [roomList, setRoomList] = useState<RoomListInterface[]>([]);
  
  const rooms_info = useSelector((state: RootState) => state.roomsinfo.roomsInfo.rooms);
  const messages = useSelector((state: RootState) => state.messageslist.new_messages);
  const latest_message = useSelector((state: RootState) => state.messageslist.latest_message);
  useEffect(() => {
    let RoomsList = [];
    for (let room  of rooms_info) {
      RoomsList.push({id: room.id, name: room.name, avatar_path: room.avatar_path,
        message: latest_message[room.id].content==="" || latest_message[room.id].content===undefined ? "メッセージはありません": latest_message[room.id].content
        , latest_at:latest_message[room.id].latest_at});
    }
    for (let RoomList of RoomsList) {
      setRoomList((prevList)=>{
        const updatedList = [RoomList];
        return updatedList.sort((a, b) =>
          new Date(b.latest_at).getTime() - new Date(a.latest_at).getTime()
        );
      });
    }
  }, [rooms_info, latest_message]);
  
  const addUser = (newUser: RoomListInterface) => {
    setRoomList((prevList) => {
      const updatedList = [...prevList,newUser];
      return updatedList.sort((a, b) =>
        new Date(b.latest_at).getTime() - new Date(a.latest_at).getTime()
      );
    });
  };
  
  const removeUser = (id: string) => {
    setRoomList((prevList) => prevList.filter(user => user.id !== id));
  };
  
  const updateUser = (updatedUser: RoomListInterface) => {
    setRoomList((prevList) => {
      const newList = prevList.map(user => user.id === updatedUser.id ? updatedUser : user);
      return newList.sort((a, b) =>
        new Date(b.latest_at).getTime() - new Date(a.latest_at).getTime()
      );
    });
  };
/*      {(function(){
        const list = [];
        for (let i of userList) {
          list.push(<Text>{i["name"]+" "+i["message"]+" "+i["latest_at"]}</Text>);
        }
        return <View>{list}</View>;
      }())}*/

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      {roomList.map((room) => (
        <ListItem key={room["id"]} onPress={() => navigation.navigate(
          "ChatScreen",{roomid: room["id"], roomname: room["name"]}
          )}>
          <Avatar rounded size={50} source={{uri:URL+room['avatar_path']}} containerStyle={{backgroundColor:"gray"
          }} />
          <ListItem.Content>
            <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{room["name"]}</ListItem.Title>
            <ListItem.Subtitle numberOfLines={1}>{room["message"]}</ListItem.Subtitle>
          </ListItem.Content>
          {messages[room.id].length===0 ? <></>: <Badge value={messages[room.id].length}
          textStyle={{fontSize: 14}}
          badgeStyle={{width: 28, height: 28, borderRadius: 14}}
          status="primary" />}
        </ListItem>
      ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ChatHome() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatHomeScreen" component={ChatHomeScreen} options={{headerShown:false}} />
      <Stack.Screen name="ChatScreen" component={Chat} options={({route}) => ({
        title: route.params.roomname
      })}/>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
    },
});