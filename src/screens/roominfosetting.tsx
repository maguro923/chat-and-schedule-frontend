import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { Avatar } from '@rneui/themed';
import { URL } from '../api/config';
import { Pressable, ScrollView, StyleSheet, Text, View, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { Button, ListItem } from '@rneui/base'
import { setIsPressedRoomSaveButtom, setIsPressedUserSaveButtom, setIsShownRoomSaveButtom, setIsShownUserSaveButtom } from '../redux/isShownButtonSlice';
import { pickImageAsync } from '../utils/pickimage';
import { set_roomavatar, set_roominfo, set_useravatar, set_userinfo } from '../api/api';
import { setUserDataAsync, setUserDataInterface } from '../redux/userDataSlice';
import { randomString } from '../utils/randomstring';
import { RootStackScreenProps } from './chathome';
import { addRoomInfo, RoomsInfoInterface } from '../redux/roomsInfoSlice';

export default function RoomInfoScreen({route}: RootStackScreenProps<'RoomInfoScreen'>) {
    const dispatch: AppDispatch = useDispatch();
    const isShownRoomSaveButton = useSelector((state: RootState) => state.isShownButton.isShownRoomSaveButton);
    const isPressedRoomSaveButton = useSelector((state: RootState) => state.isShownButton.isPressedRoomSaveButton);
    const participants = useSelector((state: RootState) => state.participantsinfo.participants);
    const user = useSelector((state: RootState) => state.userdata.userdata);
    const room_participants = useSelector((state: RootState) => state.roomsinfo.roomsInfo.participants)[route.params.info.roomid].filter((participant_id) => participant_id !== user.id);
    const room_info = useSelector((state: RootState) => state.roomsinfo.roomsInfo.rooms).filter((room) => room.id === route.params.info.roomid)[0];
    const [avatarPath, setAvatarPath] = useState<string>(URL + room_info.avatar_path);
    const [roomname, setRoomname] = useState<string>(room_info.name);
    const device_id = useSelector((state: RootState) => state.deviceid.deviceid);

    //ルーム情報が変更された場合に保存ボタンを表示
    useEffect(() => {
        if (roomname === ""){
            dispatch(setIsShownRoomSaveButtom(false));
        }else if ((avatarPath !== URL + room_info.avatar_path || roomname !== room_info.name) && isShownRoomSaveButton === false) {
            dispatch(setIsShownRoomSaveButtom(true));
        }else if(avatarPath === URL + room_info.avatar_path && roomname === room_info.name && isShownRoomSaveButton === true){
            dispatch(setIsShownRoomSaveButtom(false));
        }
    }, [avatarPath, roomname]);

    //保存ボタンが押された場合にルーム情報を更新
    useEffect(() => {
        const sendSetAvatarRequest = async (AvatarPath: string, room_id: string, user_id: string, accesstoken: string, deviceid:string) => {
            const filename = `avatar-${randomString(12)}`;
            const [status, res] = await set_roomavatar(room_id, user_id, accesstoken, deviceid, AvatarPath, filename);
            if (res.detail === "avatar uploaded") {
                const new_roominfo: RoomsInfoInterface = {
                    id: room_id,
                    name: room_info.name,
                    avatar_path: `/avatars/rooms/${room_id}/${filename}.png`,
                    joined_at: room_info.joined_at
                };
                dispatch(addRoomInfo(new_roominfo));
                setAvatarPath(`${URL}/avatars/rooms/${room_id}/${filename}.png`);
                console.log("アバターを更新しました");
            } else {
                setAvatarPath(URL + user.avatar_path);
                console.error("アバターの更新に失敗しました",res.detail);
            }
        }
        const sendSetInfoRequest = async (roomname: string, user_id: string, accesstoken: string, deviceid:string) => {
            const [status, res] = await set_roominfo(route.params.info.roomid, user_id, accesstoken, deviceid, roomname);
            if (res.detail === "infomation updated") {
                const roominfo: RoomsInfoInterface = {
                    id: route.params.info.roomid,
                    name: roomname,
                    avatar_path: room_info.avatar_path,
                    joined_at: room_info.joined_at
                }
                dispatch(addRoomInfo(roominfo))
                setRoomname(roomname);
                route.params.info.roomname = roomname;
                console.log("ユーザー情報を更新しました");
            } else {
                setRoomname(room_info.name);
                console.error("ユーザー情報の更新に失敗しました",res.detail);
            }
        }
        if (isPressedRoomSaveButton) {
            if (avatarPath !== URL + room_info.avatar_path) {
                console.log("アバターを更新します");
                sendSetAvatarRequest(avatarPath,route.params.info.roomid,user.id,user.access_token,device_id)
            }
            if (roomname !== room_info.name) {
                console.log("ルーム名を更新します");
                sendSetInfoRequest(roomname,user.id,user.access_token,device_id);
            }
            dispatch(setIsPressedRoomSaveButtom(false));
            dispatch(setIsShownRoomSaveButtom(false));
        }
    }, [isPressedRoomSaveButton]);

    return (
        <View style={styles.container}>
        {Platform.OS === "ios"?(
        <KeyboardAvoidingView>
        </KeyboardAvoidingView>
        ):(
        <View style={{flex:1}}>
            <Pressable style={styles.header} onPress={()=>{
                pickImageAsync().then((res) => {
                    if (res !== null) {
                        setAvatarPath(res);
                    }
                });}}>
                <Avatar rounded size={150} source={{uri:avatarPath}} containerStyle={{backgroundColor:"gray"}}>
                    <Avatar.Accessory size={30} />
                </Avatar>
            </Pressable>
            <TextInput placeholder="ルーム名"
              style={styles.input} 
              value={roomname}
              onChangeText={setRoomname}
              keyboardType="default"
              autoCorrect={false}
              multiline={true}
            />
            <Text style={{fontSize:24,marginLeft:16,marginVertical:8}}>ルーム参加者</Text>
            {room_participants.length===0?
            //ユーザーが見つからない場合
            <View style={{justifyContent:"center",alignItems:"center",flex:1}}>
                <Text style={{fontSize:20}}>参加者が見つかりません</Text>
            </View>
            :
            <ScrollView style={{flex:1}}>
            {room_participants.map((participant_id) => (
            <ListItem key={participant_id} onPress={()=>console.log(participant_id)} >
                <Avatar rounded size={50} source={{uri:URL+participants[participant_id].avatar_path}} containerStyle={{backgroundColor:"gray"}} />
                <ListItem.Content>
                    <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{participants[participant_id].name}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
            ))}
            </ScrollView>}
        </View>
        )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    button: {
        width: "39%",
        marginTop: 20,
        alignSelf: "center",
        justifyContent: "center",
    },
    header: {
        alignItems: 'center',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 100,
    },
    input: {
        width: "80%",
        alignSelf: "center",
        fontSize: 24,
        backgroundColor: "whitesmoke",
        borderRadius: 25,
        marginVertical: 10,
        textAlign: "center",
        maxHeight: 100,
    },
});