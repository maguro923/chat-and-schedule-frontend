import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useBooleanContext } from '../context/LoginStatusContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@rneui/base';
import { deluser, DeleteUserInterface } from '../api/api';
import { AppDispatch, RootState } from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDataAsync } from '../redux/userDataSlice';

export default function ScheduleHome() {
    const { value, setValue } = useBooleanContext();

    const dispatch: AppDispatch = useDispatch();
    const userdata = useSelector((state: RootState) => state.userdata);
    const deviceid = useSelector((state: RootState) => state.deviceid);

    /*useEffect(() => {
        (async() => {
            await dispatch(getUserDataAsync());
        })()
    },[]);*/

    async function logout() {
        console.log("logout",value);
        await SecureStore.deleteItemAsync("username");
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("access_token_expires");
        await SecureStore.deleteItemAsync("refresh_token_expires");
        await SecureStore.deleteItemAsync("refresh_token");
    }

    const testjson:DeleteUserInterface = {
        id: userdata.userdata.id,
        access_token: userdata.userdata.access_token,
        password: "Password1",
        deviceid: deviceid.deviceid
    }

    return (
        <SafeAreaView style={styles.container}>
        <Text style={{color:"blue",fontSize:15}}>This is ScheduleHome.</Text>
        <Pressable onPress={async() => {
            await logout()
            .then(() => {
                setValue(false);
                //console.log("logout end:",value);
            });
            }}>
            <Text style={{fontSize:20}}>Logout</Text>
        </Pressable>
        <Button
            title="delete"
            containerStyle={styles.button}
            onPress={async() => {
              const [status,res] = await deluser(testjson);
              console.log("status:",status);
              console.log("res:",res);
            }}
        />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: "39%",
        marginTop: 20,
        alignSelf: "center",
        justifyContent: "center",
    },
});