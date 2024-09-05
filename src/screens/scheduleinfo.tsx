import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, TextInput, Alert } from 'react-native';
import { setEditSchedule } from '../redux/overlaySlice';
import { AppDispatch, RootState } from '../redux/store';
import Icon from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar } from '@rneui/themed';
import { Button } from '@rneui/base'
import { format } from 'date-fns-tz';
import { changeSchedule, COLORS, Schedule } from '../redux/scheduleSlice';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { update_schedule } from '../database/updateschedule';

export default function EditScheduleScreen() {
    const dispatch:AppDispatch = useDispatch();
    const item:Schedule = useSelector((state: RootState) => state.overlay.editschedule_item);
    
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [title, setTitle] = useState<string>(item.text);
    const [description, setDescription] = useState<string>(item.info);
    const [color, setColor] = useState<string>(item.color);
    const [start_at, setStartAt] = useState<Date>(item.fromAt);
    const [end_at, setEndAt] = useState<Date>(item.toAt);

    
    const AddSchedule = () => {
        return (
            <>
            <View style={{justifyContent:"center"}} >
                <View style={{flexDirection:"row",alignItems:"center"}}>
                  <Text style={{fontSize:24,marginLeft:10,marginVertical:10}}>開始時間</Text>
                  <Pressable style={{marginLeft:"auto",flexDirection:"row",alignItems:"center"}} onPress={() => setStartDatePickerVisibility(true)}>
                    <Text style={{fontSize:20,color:"dimgray"}}>{format(start_at,"yyyy-MM-dd HH:mm")}</Text>
                    <Icon name="right" size={24} color="dimgray" style={{marginRight:10}} />
                  </Pressable>
                  <DateTimePicker
                      isVisible={isStartDatePickerVisible}
                      mode="datetime"
                      onConfirm={(date:any) => {
                        setStartDatePickerVisibility(false)
                        console.log(date)
                        setStartAt(date)}}
                      onCancel={() => setStartDatePickerVisibility(false)}
                  />
                </View>
                <View style={{flexDirection:"row"}}>
                  <Text style={{fontSize:24,marginLeft:10,marginVertical:10}}>終了時間</Text>
                  <Pressable style={{marginLeft:"auto",flexDirection:"row",alignItems:"center"}} onPress={() => setEndDatePickerVisibility(true)}>
                    <Text style={{fontSize:20,color:"dimgray"}}>{format(end_at,"yyyy-MM-dd HH:mm")}</Text>
                    <Icon name="right" size={24} color="dimgray" style={{marginRight:10}} />
                  </Pressable>
                  <DateTimePicker
                      isVisible={isEndDatePickerVisible}
                      mode="datetime"
                      onConfirm={(date:any) => {
                        setEndDatePickerVisibility(false)
                        console.log(date)
                        setEndAt(date)}}
                      onCancel={() => setEndDatePickerVisibility(false)}
                  />
                </View>
                
                <View style={{flexDirection:"row",alignItems:"center"}}>
                    <Text style={{fontSize:24,marginLeft:10,marginVertical:10}}>色</Text>
                    <ScrollView horizontal={true} style={{flexDirection:"row",marginLeft:"auto",marginRight:10}}>
                    <Avatar rounded size={color===COLORS[0]?50:35} containerStyle={{alignSelf:"center",marginLeft:"auto",backgroundColor:COLORS[0],marginRight:5}} onPress={()=>setColor(COLORS[0])} />
                    <Avatar rounded size={color===COLORS[1]?50:35} containerStyle={{alignSelf:"center",backgroundColor:COLORS[1],marginRight:5}} onPress={()=>setColor(COLORS[1])} />
                    <Avatar rounded size={color===COLORS[2]?50:35} containerStyle={{alignSelf:"center",backgroundColor:COLORS[2],marginRight:5}} onPress={()=>setColor(COLORS[2])} />
                    <Avatar rounded size={color===COLORS[3]?50:35} containerStyle={{alignSelf:"center",backgroundColor:COLORS[3],marginRight:5}} onPress={()=>setColor(COLORS[3])} />
                    <Avatar rounded size={color===COLORS[4]?50:35} containerStyle={{alignSelf:"center",backgroundColor:COLORS[4],marginRight:5}} onPress={()=>setColor(COLORS[4])} />
                    <Avatar rounded size={color===COLORS[5]?50:35} containerStyle={{alignSelf:"center",backgroundColor:COLORS[5],marginRight:5}} onPress={()=>setColor(COLORS[5])} />
                    <Avatar rounded size={color===COLORS[6]?50:35} containerStyle={{alignSelf:"center",backgroundColor:COLORS[6],marginRight:5}} onPress={()=>setColor(COLORS[6])} />
                    <Avatar rounded size={color===COLORS[7]?50:35} containerStyle={{alignSelf:"center",backgroundColor:COLORS[7],marginRight:5}} onPress={()=>setColor(COLORS[7])} />
                    <Avatar rounded size={color===COLORS[8]?50:35} containerStyle={{alignSelf:"center",backgroundColor:COLORS[8],marginRight:5}} onPress={()=>setColor(COLORS[8])} />
                    <Avatar rounded size={color===COLORS[9]?50:35} containerStyle={{alignSelf:"center",backgroundColor:COLORS[9],marginRight:10}} onPress={()=>setColor(COLORS[9])} />
                    </ScrollView>
                </View>
                  

                <Button style={{marginTop:"auto"}} title="編集" disabled={title.length===0 || description.length===0 || color===""} onPress={() => {
                  if (start_at >= end_at){
                    Alert.alert("終了時間は開始時間より前である必要があります")
                    return;
                  }else{
                    const schedule:Schedule = {
                      id: item.id,
                      text: title,
                      info: description,
                      color: color,
                      fromAt: start_at,
                      toAt: end_at,
                    }
                    dispatch(changeSchedule(schedule));
                    update_schedule(schedule);
                    dispatch(setEditSchedule(false));
                  }
                }}/>
            </View>
          </>
        )
    }


    return (
        <>
        {Platform.OS === "ios"?(
        <KeyboardAvoidingView>
        <>
        <View style={styles.header}>
            <Text style={{fontSize:24,fontWeight:"bold"}}>予定を編集</Text>
            <Icon name="close" size={32} color="black" style={{width:"10%",marginLeft:"auto"}} 
            onPress={() => dispatch(setEditSchedule(false))}/>
        </View>
            <TextInput placeholder="タイトル"
              style={styles.input} 
              value={title}
              onChangeText={setTitle}
              keyboardType="default"
              autoCorrect={false}
            />
            <TextInput placeholder="詳細"
              style={styles.input} 
              value={description}
              onChangeText={setDescription}
              keyboardType="default"
              multiline={true}
              autoCorrect={false}
            />
        <AddSchedule />
        </>
        </KeyboardAvoidingView>
        ):(
        <>
        <View style={styles.header}>
            <Text style={{fontSize:24,fontWeight:"bold"}}>予定を編集</Text>
            <Icon name="close" size={32} color="black" style={{width:"10%",marginLeft:"auto"}} 
            onPress={() => dispatch(setEditSchedule(false))}/>
        </View>
        <TextInput placeholder="タイトル"
            style={styles.input} 
            value={title}
            onChangeText={setTitle}
            keyboardType="default"
            autoCorrect={false}
        />
        <TextInput placeholder="詳細"
            style={styles.input} 
            value={description}
            onChangeText={setDescription}
            keyboardType="default"
            autoCorrect={false}
            multiline={true}
        />
        <AddSchedule />
        </>)}
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
        marginVertical: 10,
        maxHeight: 100,
    },
});
