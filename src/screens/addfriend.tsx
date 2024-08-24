import React, { useEffect, useRef, useState } from 'react';
import {  Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ListItem } from '@rneui/base'
import { format } from 'date-fns-tz';
import { set, sub } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { Avatar, Badge } from '@rneui/themed';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/AntDesign';
import { AppDispatch } from '../redux/store';
import { setAddFriend } from '../redux/overlaySlice';

export default function AddFriendScreen() {
    const dispatch:AppDispatch = useDispatch();
    return (
        <View style={styles.container}>
            <Text style={{fontSize:24}}>Add Friend</Text>
            <Icon name="close" size={30} color="black" style={{position:"absolute",right:10,top:10}} 
            onPress={() => dispatch(setAddFriend(false))}/>
            <Button
                title="Add"
                onPress={() => {
                    console.log("Add button pressed");
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
    },
});