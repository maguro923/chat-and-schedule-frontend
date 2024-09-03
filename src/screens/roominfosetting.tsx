import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatScreen from './chat';
import { RootStackScreenProps } from './chathome';

export default function RoomInfoScreen({route}: RootStackScreenProps<'RoomInfoScreen'>) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={{fontSize:24,fontWeight:"bold"}}>ルーム情報</Text>
            </View>
            <Text style={{fontSize:24,fontWeight:"bold"}}>{route.params.info.roomname}</Text>
            <Text style={{fontSize:24,fontWeight:"bold"}}>{route.params.info.roomid}</Text>
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