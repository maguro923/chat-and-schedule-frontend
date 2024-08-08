import React, { useEffect, useState } from 'react';
import {  Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ListItem } from '@rneui/base'
import Chat from './chat';
import { format } from 'date-fns-tz';
import { sub } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { Avatar } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';

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
  message: string;
  latest_at: string;
}

function ChatHomeScreen({route, navigation}: RootStackScreenProps<'ChatHomeScreen'>) {
  const exampleUserList: RoomListInterface[] = [
    {id: Crypto.randomUUID(), name: "user1", message: "Hi,I'm a user1", latest_at: format(sub(new Date(),{hours:9}), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'})},
    {id: Crypto.randomUUID(), name: "user2", message: "Hi,I'm a user2", latest_at: format(sub(new Date(),{hours:9+435}), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'})},
    {id: Crypto.randomUUID(), name: "user3", message: "Hi,I'm a user3", latest_at: format(sub(new Date(),{hours:9+5}), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'})}];
  const [userList, setUserList] = useState<RoomListInterface[]>(exampleUserList);

  useEffect(() => {
    const sortedList = [...userList].sort((a, b) =>
      new Date(b.latest_at).getTime() - new Date(a.latest_at).getTime()
    );
    setUserList(sortedList);
    console.log("sorted");
  }, []);
  
  const addUser = (newUser: RoomListInterface) => {
    setUserList((prevList) => {
      const updatedList = [...prevList, newUser];
      return updatedList.sort((a, b) =>
        new Date(b.latest_at).getTime() - new Date(a.latest_at).getTime()
      );
    });
  };
  
  const removeUser = (id: string) => {
    setUserList((prevList) => prevList.filter(user => user.id !== id));
  };
  
  const updateUser = (updatedUser: RoomListInterface) => {
    setUserList((prevList) => {
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
      <Button
        title="Add User"
        onPress={() => addUser({id: Crypto.randomUUID(), name: "user4", message: "Hi,I'm a user4", latest_at: format(sub(new Date(),{hours:9+10}), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'})})}
      />
      {userList.map((user) => (
        <ListItem key={user["id"]} onPress={() => navigation.navigate(
          "ChatScreen",{roomid: user["id"], roomname: user["name"]}
          )}>
          <Avatar rounded size={50} icon={{name:"person-outline", type:"material",size:39}} containerStyle={{backgroundColor:"gray"
          }} />
          <ListItem.Content>
            <ListItem.Title style={{fontSize:24}}>{user["name"]}</ListItem.Title>
            <ListItem.Subtitle>{user["message"]}</ListItem.Subtitle>
          </ListItem.Content>
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