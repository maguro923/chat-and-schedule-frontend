import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';


import { useDispatch, useSelector } from "react-redux";
import { setstatus } from "./../redux/loginStatusSlice";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatHome() {
    useFocusEffect(
        React.useCallback(() => {
          console.log("ChatHome is focused");
          return () => console.log("ChatHome is unfocused");
        }, [])
      );
    const [count, setCount] = useState(0);

    const login_status = useSelector((state: { loginStatus: boolean }) => state.loginStatus);

    return (
        <SafeAreaView style={styles.container}>
        <Pressable onPress={() => setCount(count + 1)}>
        <Text style={{color:"blue",fontSize:15}}>This is ChatHome. {count}</Text>
        </Pressable>
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
  });
  