import React, { useEffect, useRef, useState } from 'react';
import {  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import { setAddRoom } from '../redux/overlaySlice';
import { AppDispatch, RootState } from '../redux/store';
import Icon from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, CheckBox } from '@rneui/themed';
import { Button, ListItem,Input as BaseInput } from '@rneui/base'
import { URL } from '../api/config';
import { sendWebSocketMessage } from '../redux/webSocketSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { addRoomInfo, addRoomParticipant } from '../redux/roomsInfoSlice';
import { format } from 'date-fns-tz';

export default function AddRoomScreen() {
    const dispatch:AppDispatch = useDispatch();
    const friend_list = useSelector((state: RootState) => state.participantsinfo.friends);
    const participants = useSelector((state: RootState) => state.participantsinfo.participants);
    const [settingScreen,setSettingScreen] = useState(0);
    const input = useRef<BaseInput & TextInput>(null);
    const [roomName, setRoomName] = useState<string>("");
    const [isPushedButton, setIsPushedButton] = useState(false);

    useEffect(()=>{
        setSettingScreen(0);
    },[]);

    const next_screen = () => {
        if (settingScreen === 1){
            setSettingScreen(0);
        }else{
            setSettingScreen(settingScreen+1);
        }
    }

    const RoomCreateSettingScreen = async() => {
        const [selectedFriends, setSelectedFriends] = useState<{ [key: string]: boolean }>({});
        const toggle_is_select = (id: string) => {
            setSelectedFriends(prevState => ({
                ...prevState,
                [id]: !prevState[id]
            }));
        };
        switch (settingScreen){
            case 0:
                return (
                    <>
                    <Text style={{fontSize:20,marginLeft:16}}>フレンドを選択</Text>
                    {friend_list.length===0?
                        //ユーザーが見つからない場合
                        <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
                            <Text style={{alignSelf:"center",fontSize:20,marginBottom:32}}>フレンドが見つかりません</Text>
                            <Text style={{alignSelf:"center",fontSize:16,marginBottom:4}}>ルームの参加者を追加するには</Text>
                            <Text style={{alignSelf:"center",fontSize:16}}>フレンドである必要があります</Text>
                        </View>
                        :
                        //ユーザーリスト表示
                        <ScrollView style={{flex:1}}>
                        {friend_list.map((friend_id) => (
                        <ListItem key={friend_id} onPress={()=>toggle_is_select(friend_id)} >
                            <Avatar rounded size={50} source={{uri:URL+participants[friend_id].avatar_path}} containerStyle={{backgroundColor:"gray"}} />
                            <ListItem.Content>
                                <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{participants[friend_id].name}</ListItem.Title>
                            </ListItem.Content>
                            <CheckBox disabled={true} checked={selectedFriends[friend_id]} size={30}
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o" />
                        </ListItem>
                        ))}
                        </ScrollView>}
                    <Button disabled={isPushedButton} title="次へ" containerStyle={{width:"90%",alignSelf:"center",marginTop:16}} onPress={()=>{
                        setIsPushedButton(true);
                        next_screen()
                        setIsPushedButton(false)}}/>
                    </>
            )
            case 1:
                return (
                    <>
                    <Text style={{fontSize:20,marginLeft:16,marginBottom:32}}>ルームの設定</Text>
                    <TextInput placeholder="ルーム名を入力" ref={input}
                        style={styles.input} 
                        value={roomName}
                        onChangeText={setRoomName}
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                     />
                    <Button title="作成" disabled={roomName==="" || isPushedButton} containerStyle={{width:"90%",alignSelf:"center",marginTop:16}} onPress={async()=>{
                        //ルーム作成処理
                        setIsPushedButton(true);
                        var userlist:string[] = [];
                        for (var key in selectedFriends){
                            if (selectedFriends[key] === true){
                                userlist.push(key);
                            }
                        }
                        console.log("USERLIST",userlist);
                        console.log(format(new Date(), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'}))
                        const result = await dispatch(sendWebSocketMessage({"type":"CreateRoom","content":{"participants":userlist,"roomname":roomName}}));
                        const response:any = unwrapResult(result);
                        if (response.content.message === "Room created"){
                            console.log("Room created");
                            dispatch(addRoomParticipant({id:response.content.id,participants:userlist}));
                            dispatch(addRoomInfo({
                                "name": roomName,
                                "id": response.content.id,
                                "avatar_path": response.content.avatar_path,
                                "joined_at": format(new Date(), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'})}))
                        }else{
                            console.error("ルーム作成に失敗しました",response.content?.message);
                        }
                        dispatch(setAddRoom(false));
                        setIsPushedButton(false);
                    }} />
                    </>
            )
        }
    }
    return (
        <>
        {Platform.OS === "ios"?
        <KeyboardAvoidingView>
        <>
        <View style={styles.header}>
            <Text style={{fontSize:24,fontWeight:"bold"}}>ルームを作成</Text>
            <Icon name="close" size={32} color="black" style={{width:"10%",marginLeft:"auto"}} 
            onPress={() => dispatch(setAddRoom(false))}/>
        </View>
        {RoomCreateSettingScreen()}
        </>
        </KeyboardAvoidingView>
        :
        <>
        <View style={styles.header}>
            <Text style={{fontSize:24,fontWeight:"bold"}}>ルームを作成</Text>
            <Icon name="close" size={32} color="black" style={{width:"10%",marginLeft:"auto"}} 
            onPress={() => dispatch(setAddRoom(false))}/>
        </View>
        {RoomCreateSettingScreen()}
        </>}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
    },
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
    input: {
        width: "90%",
        alignSelf: "center",
        fontSize: 24,
        backgroundColor: "whitesmoke",
    },
});