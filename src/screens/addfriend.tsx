import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ListItem, Input as BaseInput } from '@rneui/base'
import { format } from 'date-fns-tz';
import { set, sub } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { Avatar, Badge, Input } from '@rneui/themed';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/AntDesign';
import { AppDispatch } from '../redux/store';
import { setAddFriend } from '../redux/overlaySlice';
import { createIconSetFromFontello } from 'react-native-vector-icons';
import CheckUUID from '../utils/checkuuid';
import { sendWebSocketMessage } from '../redux/webSocketSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { URL } from '../api/config';

interface UserListInterface {
    id: string;
    name: string;
    avatar_path: string;
}

export default function AddFriendScreen() {
    const dispatch:AppDispatch = useDispatch();
    const input = useRef<BaseInput & TextInput>(null)
    const [searchText, setSearchText] = useState<string>("");
    const [userList, setUserList] = useState<UserListInterface[]>([]);
    const [is_loading, setIsLoading] = useState<boolean>(false);

    const changeSearchText = (text: string) => {
        setSearchText(text);
        if(text[0] === "#"){
            //ID検索
            const id = text.slice(1);
            if(CheckUUID(id)){
                console.log("UUID");
            }else{
                console.log("Not UUID");
            }
        }
    };

    useEffect(() => {
        //入力欄の更新が一定時間行われなかった場合にユーザー検索
        const get_userlist = async () => {
            setIsLoading(true);
            const result = await dispatch(sendWebSocketMessage({"type":"SearchUsers","content":{"key":searchText}}));
            const respones:any = unwrapResult(result);
            setUserList(respones.content);
            setIsLoading(false);
        }
        if (searchText !== "" && searchText[0] !== "#") {
            const handler = setTimeout(() => {
                get_userlist()
            }, 500);
            return () => {
                clearTimeout(handler);
            };
        }
    },[searchText]);

    return (
        <>
        {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView>
            <View style={styles.header}>
                <Text style={{fontSize:24,width:"50%"}}>フレンドを追加</Text>
                <Icon name="close" size={32} color="black" style={{width:"10%",marginLeft:"auto"}} 
                onPress={() => dispatch(setAddFriend(false))}/>
            </View>
            <View style={styles.searchRow} >
                <Icon name="search1" size={24} color="black" style={{width:"10%"}} />
                    <TextInput
                        ref={input}
                        placeholder="ユーザー名もしくはID(#○○)を入力"
                        value={searchText}
                        onChangeText={changeSearchText}
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false} />
            </View>
        </KeyboardAvoidingView>
        ):(
        <>
        <View style={styles.header}>
            <Text style={{fontSize:24,width:"50%"}}>フレンドを追加</Text>
            <Icon name="close" size={32} color="black" style={{width:"10%",marginLeft:"auto"}} 
            onPress={() => dispatch(setAddFriend(false))}/>
        </View>
        <View style={styles.searchRow} >
            <Icon name="search1" size={24} color="black" style={{width:"10%"}} />
            <TextInput
            style={styles.input} 
                ref={input}
                placeholder="ユーザー名もしくはID(#○○)を入力"
                value={searchText}
                onChangeText={changeSearchText}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false} />
            {is_loading?<ActivityIndicator style={{marginLeft:"auto"}} color="blue" />:<></>}
        </View>
        {userList.map((user) => (
        <ListItem key={user["id"]} >
            <Avatar rounded size={50} source={{uri:URL+user['avatar_path']}} containerStyle={{backgroundColor:"gray"}} />
            <ListItem.Content>
                <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{user["name"]}</ListItem.Title>
            </ListItem.Content>
            <Button onPress={() => {
                console.log("フレンド追加");
            }}>フレンド追加</Button>
        </ListItem>
        ))}
        </>
        )}
        </>
    );
}

const styles = StyleSheet.create({
    textContainer: {
      width: "90%",
      marginLeft:"auto",
      backgroundColor: "green",
    },
    textInputContainer: {
      backgroundColor: "yellow",
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderColor: "gray",
      borderRadius: 10,
      borderWidth: 1,
    },
    container: {
      flex: 1,
      flexDirection: "row",
      height: "10%",
      backgroundColor: 'whitesmoke',
    },
    //^^^^^^^^^^^^^^^^^^^^^^^^^
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 5,
    },
    input: {
        width: "80%",
    },
  });