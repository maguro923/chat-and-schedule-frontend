import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { Avatar } from '@rneui/themed';
import { URL } from '../api/config';
import { Pressable, ScrollView, StyleSheet, Text, View, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { ListItem } from '@rneui/base'
import { setIsPressedUserSaveButtom, setIsShownUserSaveButtom } from '../redux/isShownButtonSlice';
import { pickImageAsync } from '../utils/pickimage';
import { set_useravatar, set_userinfo } from '../api/api';
import { setUserDataAsync, setUserDataInterface } from '../redux/userDataSlice';
import { randomString } from '../utils/randomstring';

export default function UesrInfoScreen() {
    const dispatch: AppDispatch = useDispatch();
    const isShownUserSaveButton = useSelector((state: RootState) => state.isShownButton.isShownUserSaveButton);
    const isPressedUserSaveButton = useSelector((state: RootState) => state.isShownButton.isPressedUserSaveButton);
    const friend_list = useSelector((state: RootState) => state.participantsinfo.friends);
    const participants = useSelector((state: RootState) => state.participantsinfo.participants);
    const user = useSelector((state: RootState) => state.userdata.userdata);
    const [avatarPath, setAvatarPath] = useState<string>(URL + user.avatar_path);
    const [username, setUsername] = useState<string>(user.name);
    const device_id = useSelector((state: RootState) => state.deviceid.deviceid);
    const [username_error, setUsername_error] = useState<string>("");
    const [isPushedButton, setIsPushedButton] = useState(false);

    //ユーザー情報が変更された場合に保存ボタンを表示
    useEffect(() => {
        if (/[#]/.test(username)) {
            setUsername_error("「#」は使用できません");
        }else{
            setUsername_error("");
        }

        if (username === "" || /[#]/.test(username)){
            dispatch(setIsShownUserSaveButtom(false));
        }else if ((avatarPath !== URL + user.avatar_path || username !== user.name) && isShownUserSaveButton === false) {
            dispatch(setIsShownUserSaveButtom(true));
        }else if(avatarPath === URL + user.avatar_path && username === user.name && isShownUserSaveButton === true){
            dispatch(setIsShownUserSaveButtom(false));
        }
    }, [avatarPath, username]);

    //保存ボタンが押された場合にユーザー情報を更新
    useEffect(() => {
        const sendSetAvatarRequest = async (AvatarPath: string, user_id: string, accesstoken: string, deviceid:string) => {
            const filename = `avatar-${randomString(12)}`;
            const [status, res] = await set_useravatar(user_id, accesstoken, deviceid, AvatarPath, filename);
            if (res.detail === "avatar uploaded") {
                const new_userdata: setUserDataInterface = {
                  name: user.name,
                  id: user.id,
                  avatar_path: `/avatars/users/${user.id}/${filename}.png`,
                  access_token: user.access_token,
                  access_token_expires: user.access_token_expires,
                  refresh_token: user.refresh_token,
                  refresh_token_expires: user.refresh_token_expires
                };
                await dispatch(setUserDataAsync(new_userdata))
                setAvatarPath(`${URL}/avatars/users/${user.id}/${filename}.png`);
                console.log("アバターを更新しました");
            } else {
                setAvatarPath(URL + user.avatar_path);
                console.error("アバターの更新に失敗しました",res.detail);
            }
        }
        const sendSetInfoRequest = async (username: string, user_id: string, accesstoken: string, deviceid:string) => {
            const [status, res] = await set_userinfo(user_id, accesstoken, deviceid, username);
            if (res.detail === "infomation updated") {
                const new_userdata: setUserDataInterface = {
                  name: username,
                  id: user.id,
                  avatar_path: user.avatar_path,
                  access_token: user.access_token,
                  access_token_expires: user.access_token_expires,
                  refresh_token: user.refresh_token,
                  refresh_token_expires: user.refresh_token_expires
                };
                await dispatch(setUserDataAsync(new_userdata))
                setUsername(username);
                console.log("ユーザー情報を更新しました");
            } else {
                setUsername(user.name);
                console.error("ユーザー情報の更新に失敗しました",res.detail);
            }
        }
        if (!isPushedButton && isPressedUserSaveButton) {
            setIsPushedButton(true);
            if (avatarPath !== URL + user.avatar_path) {
                sendSetAvatarRequest(avatarPath,user.id,user.access_token,device_id)
            }
            if (username !== user.name) {
                sendSetInfoRequest(username,user.id,user.access_token,device_id);
            }
            dispatch(setIsPressedUserSaveButtom(false));
            dispatch(setIsShownUserSaveButtom(false));
            setIsPushedButton(false);
        }
    }, [isPressedUserSaveButton]);

    return (
        <View style={styles.container}>
        {Platform.OS === "ios"?(
        <KeyboardAvoidingView>
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
            <TextInput placeholder="ユーザー名"
              style={styles.input} 
              value={username}
              onChangeText={setUsername}
              keyboardType="default"
              autoCorrect={false}
              multiline={true}
            />
            <Text style={{color:"red",textAlign:"center"}}>{username_error}</Text>
            <Text style={{fontSize:24,marginLeft:16,marginVertical:8}}>フレンド一覧</Text>
            {friend_list.length===0?
            //ユーザーが見つからない場合
            <View style={{justifyContent:"center",alignItems:"center",flex:1}}>
                <Text style={{fontSize:20}}>フレンドが見つかりません</Text>
            </View>
            :
            //ユーザーリスト表示
            <ScrollView style={{flex:1}}>
            {friend_list.map((friend_id) => (
            <ListItem key={friend_id} onPress={()=>console.log(friend_id)} >
                <Avatar rounded size={50} source={{uri:URL+participants[friend_id].avatar_path}} containerStyle={{backgroundColor:"gray"}} />
                <ListItem.Content>
                    <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{participants[friend_id].name}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
            ))}
            </ScrollView>}
        </View>
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
            <TextInput placeholder="ユーザー名"
              style={styles.input} 
              value={username}
              onChangeText={setUsername}
              keyboardType="default"
              autoCorrect={false}
              multiline={true}
            />
            <Text style={{color:"gray",textAlign:"center"}}>{"ID: #"+user.id}</Text>
            <Text style={{color:"red",textAlign:"center"}}>{username_error}</Text>
            <Text style={{fontSize:24,marginLeft:16,marginVertical:8}}>フレンド一覧</Text>
            {friend_list.length===0?
            //ユーザーが見つからない場合
            <View style={{justifyContent:"center",alignItems:"center",flex:1}}>
                <Text style={{fontSize:20}}>フレンドが見つかりません</Text>
            </View>
            :
            //ユーザーリスト表示
            <ScrollView style={{flex:1}}>
            {friend_list.map((friend_id) => (
            <ListItem key={friend_id} onPress={()=>console.log(friend_id)} >
                <Avatar rounded size={50} source={{uri:URL+participants[friend_id].avatar_path}} containerStyle={{backgroundColor:"gray"}} />
                <ListItem.Content>
                    <ListItem.Title numberOfLines={1} style={{fontSize:24}}>{participants[friend_id].name}</ListItem.Title>
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