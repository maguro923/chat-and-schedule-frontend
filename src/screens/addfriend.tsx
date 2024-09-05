import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, ListItem, Input as BaseInput } from '@rneui/base'
import { Avatar } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/AntDesign';
import { AppDispatch, RootState } from '../redux/store';
import { setAddFriend } from '../redux/overlaySlice';
import CheckUUID from '../utils/checkuuid';
import { sendWebSocketMessage } from '../redux/webSocketSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { URL } from '../api/config';
import { addFriend, setSendedRequests } from '../redux/participantsInfoSlice';
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
    const participants = useSelector((state: RootState) => state.participantsinfo);

    const get_userlist = async () => {
        setIsLoading(true);
        const result = await dispatch(sendWebSocketMessage({"type":"SearchUsers","content":{"key":searchText}}));
        const respones:any = unwrapResult(result);
        console.log(respones);
        setUserList(respones.content);
        setIsLoading(false);
    }

    const changeSearchText = (text: string) => {
        setSearchText(text);
        const id = text.slice(1);
        if(CheckUUID(id)){
            get_userlist();
        }
    };

    //新規にフレンドリクエストを送信
    const send_FriendRequest = async (userid: string) => {
        const result = await dispatch(sendWebSocketMessage({"type":"Friend","content":{"friend_id":userid}}));
        const response:any = unwrapResult(result);
        console.log(response);
        if (response.content.message === "Friend request sent" || response.content.message === "Already sent friend request") {
            console.log("フレンドリクエストを送信しました");
            dispatch(setSendedRequests(userid));
        }
    }

    //受信したフレンドリクエストを受け入れる
    const accept_FriendRequest = async (userid: string) => {
        const result = await dispatch(sendWebSocketMessage({"type":"Friend","content":{"friend_id":userid}}));
        const response:any = unwrapResult(result);
        console.log("RESPONSE",response);
        if (response.content.message === "Friend is made") {
            console.log("フレンドリクエストを受理しました");
            dispatch(addFriend(userid));
        }
    }

    useEffect(() => {
        //入力欄の更新が一定時間行われなかった場合にユーザー検索
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
            <Text style={{fontSize:24,fontWeight:"bold"}}>フレンドを追加</Text>
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
        {searchText === ""?
        //検索文字列が空の場合
        participants.friend_requests.length===0?<View>
            <Text>フレンドリクエストは届いていません</Text>
            <Text>IDもしくはユーザー名で検索してみましょう</Text></View>
            :
        //フレンドリクエストがある場合
            <ScrollView>
            {participants.friend_requests.map((user) => (
            <ListItem key={user} >
                <Avatar rounded size={50} source={{uri:URL+participants.participants[user].avatar_path}} containerStyle={{backgroundColor:"gray"}} />
                <ListItem.Content>
                    <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{participants.participants[user].name}</ListItem.Title>
                </ListItem.Content>
                <Button onPress={() => {
                    accept_FriendRequest(user);
                }}>フレンド申請受理</Button>
            </ListItem>
            ))}
            </ScrollView>:
        //ID検索のIDミスの場合
        searchText[0] === "#" && CheckUUID(searchText.slice(1))===false?<></>
        :
        userList.length===0?
        //ユーザーが見つからない場合
            <Text>ユーザーが見つかりません</Text>
            :
        //ユーザーリスト表示
            userList.map((user) => (
            <ListItem key={user["id"]} >
                <Avatar rounded size={50} source={{uri:URL+user['avatar_path']}} containerStyle={{backgroundColor:"gray"}} />
                <ListItem.Content>
                    <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{user["name"]}</ListItem.Title>
                </ListItem.Content>
                {participants.friend_requests.includes(user.id)?
                //フレンドリクエストを受け取っている場合
                <Button onPress={() => {
                    accept_FriendRequest(user.id);
                }}>フレンド申請受理</Button>
                :participants.friends.includes(user.id)?
                //既にフレンドの場合
                    <Text style={{color:"#007AFF"}}>フレンド</Text>
                :participants.sended_requests.includes(user.id)?
                //フレンドリクエストを送信済みの場合
                    <Text style={{color:"#007AFF"}}>送信済み</Text>
                    :
                //フレンドリクエストを送信していない場合
                    <Button onPress={() => {
                        console.log(participants.sended_requests,user.id)
                        send_FriendRequest(user.id);
                    }}>フレンド申請</Button>
                }
            </ListItem>
            ))}
        </KeyboardAvoidingView>
        ):(
        <>
        <View style={styles.header}>
            <Text style={{fontSize:24}}>フレンドを追加</Text>
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
        {searchText === ""?
        //検索文字列が空の場合
        participants.friend_requests.length===0?<View>
            <Text>フレンドリクエストは届いていません</Text>
            <Text>IDもしくはユーザー名で検索してみましょう</Text></View>
            :
        //フレンドリクエストがある場合
            participants.friend_requests.map((user) => (
            <ListItem key={user} >
                <Avatar rounded size={50} source={{uri:URL+participants.participants[user].avatar_path}} containerStyle={{backgroundColor:"gray"}} />
                <ListItem.Content>
                    <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{participants.participants[user].name}</ListItem.Title>
                </ListItem.Content>
                <Button onPress={() => {
                    accept_FriendRequest(user);
                }}>フレンド申請受理</Button>
            </ListItem>
            )):
        //ID検索のIDミスの場合
        searchText[0] === "#" && CheckUUID(searchText.slice(1))===false?<></>
        :
        userList.length===0?
        //ユーザーが見つからない場合
            <Text>ユーザーが見つかりません</Text>
            :
        //ユーザーリスト表示
            userList.map((user) => (
            <ListItem key={user["id"]} >
                <Avatar rounded size={50} source={{uri:URL+user['avatar_path']}} containerStyle={{backgroundColor:"gray"}} />
                <ListItem.Content>
                    <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{user["name"]}</ListItem.Title>
                </ListItem.Content>
                {participants.friend_requests.includes(user.id)?
                //フレンドリクエストを受け取っている場合
                <Button onPress={() => {
                    accept_FriendRequest(user.id);
                }}>フレンド申請受理</Button>
                :participants.friends.includes(user.id)?
                //既にフレンドの場合
                    <Text style={{color:"#007AFF"}}>フレンド</Text>
                :participants.sended_requests.includes(user.id)?
                //フレンドリクエストを送信済みの場合
                    <Text style={{color:"#007AFF"}}>送信済み</Text>
                    :
                //フレンドリクエストを送信していない場合
                    <Button onPress={() => {
                        console.log(participants.sended_requests,user.id)
                        send_FriendRequest(user.id);
                    }}>フレンド申請</Button>
                }
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