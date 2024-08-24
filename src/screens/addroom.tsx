import React, { useEffect, useRef, useState } from 'react';
import {  Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AddRoomScreen() {
    return (
        <View style={styles.container}>
            <Text style={{fontSize:24,margin:12}}>Add Room</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
    },
});