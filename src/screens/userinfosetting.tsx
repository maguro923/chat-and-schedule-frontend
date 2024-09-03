import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Avatar } from 'react-native-gifted-chat';
import { URL } from '../api/config';

export default function UesrInfoScreen({navigation}:any) {
    const user = useSelector((state: RootState) => state.userdata.userdata);
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={{fontSize:24,fontWeight:"bold"}}>ユーザー情報</Text>
            </View>
            <Text>ユーザー名: {user.name}</Text>
            <Text>ID: {user.id}</Text>
            <Text>URL: {URL+user.avatar_path} </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    button: {
        width: "39%",
        marginTop: 20,
        alignSelf: "center",
        justifyContent: "center",
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
});