import React, { useEffect, useRef, useState } from 'react';
import {  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { setAddParticipant, setAddRoom } from '../redux/overlaySlice';
import { AppDispatch, RootState } from '../redux/store';
import Icon from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Badge, CheckBox, Input } from '@rneui/themed';
import { Button, ListItem,Input as BaseInput } from '@rneui/base'
import { URL } from '../api/config';
import { TextInput } from 'react-native-gesture-handler';
import { sendWebSocketMessage } from '../redux/webSocketSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { addRoomInfo, addRoomParticipant } from '../redux/roomsInfoSlice';
import { format } from 'date-fns-tz';

export default function AddParticipantScreen(props: {id: string}) {
    const dispatch:AppDispatch = useDispatch();
    const raw_friend_list = useSelector((state: RootState) => state.participantsinfo.friends);
    const participants = useSelector((state: RootState) => state.participantsinfo.participants);
    const room_participants = useSelector((state: RootState) => state.roomsinfo.roomsInfo.participants);
    const [selectedFriends, setSelectedFriends] = useState<{ [key: string]: boolean }>({});
    const [friend_list, setFriendList] = useState<string[]>([]);
    const [select, setSelect] = useState<string[]>([]);

    const toggle_is_select = (id: string) => {
        setSelectedFriends(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const send_joinroomrequest = async() => {
        console.log(select);
        let is_collect = true;
        for (let user of select){
            const result = await dispatch(sendWebSocketMessage({"type":"JoinRoom","content":{"roomid":props.id,"participants":user}}))
            const response:any = unwrapResult(result);
            if (response.content.message !== "Room joined"){
                console.error("ルーム参加招待に失敗しました",response.content?.message);
                is_collect = false;
            }else{
                console.log("ルーム参加招待に成功しました",response.content)
            }
        }
        if (is_collect){
            dispatch(addRoomParticipant({id:props.id,participants:select}));
        }
        dispatch(setAddParticipant(false))
    }

    useEffect(()=>{
        let id_list = [];
        for (let id in selectedFriends){
            if (selectedFriends[id] === true){
                id_list.push(id);
            }
        }
        setSelect(id_list);
    },[selectedFriends]);

    useEffect(()=>{
        let id_list = [];
        for (let friend_id of raw_friend_list){
            if (!room_participants[props.id].includes(friend_id)){
                id_list.push(friend_id);
            }
        }
        setFriendList(id_list);
    },[raw_friend_list]);

    return (
        <>
        <View style={styles.header}>
            <Text style={{fontSize:24,fontWeight:"bold"}}>フレンドを招待</Text>
            <Icon name="close" size={32} color="black" style={{width:"10%",marginLeft:"auto"}} 
            onPress={() => dispatch(setAddParticipant(false))}/>
        </View>
        {friend_list.length===0?
        //ユーザーが見つからない場合
        <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
            <Text style={{alignSelf:"center",fontSize:20,marginBottom:32}}>フレンドが見つかりません</Text>
            <Text style={{alignSelf:"center",fontSize:16,marginBottom:4}}>ルームの参加者を追加するには</Text>
            <Text style={{alignSelf:"center",fontSize:16}}>フレンドである必要があります</Text>
        </View>
        :
        //ユーザーリスト表示
        <View style={{flex:1}}>
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
        </View>}
        <Button onPress={() => send_joinroomrequest()}
            disabled={select.length===0} >招待</Button>
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