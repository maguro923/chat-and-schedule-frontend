import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Actions, Avatar, GiftedChat, IMessage, Send, SystemMessage } from 'react-native-gifted-chat';
import * as Crypto from 'expo-crypto';
import * as Clipboard from 'expo-clipboard';
import { RootStackScreenProps } from './chathome';
import { URL } from '../api/config';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { format } from 'date-fns-tz';
import { parse } from 'date-fns';
import { MessageInterface, setSendMessage } from '../redux/messagesListSlice';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { focusChatRoom } from '../utils/focus';
import { useSQLiteContext } from 'expo-sqlite';
import { sendWebSocketMessage } from '../redux/webSocketSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { ScrollView } from 'react-native-gesture-handler';
import { setFocusRoom } from '../redux/roomsInfoSlice';
import { setAddParticipant } from '../redux/overlaySlice';
import { Overlay } from '@rneui/themed';
import AddParticipantScreen from './addparticipant';

// カスタムアバター
const CustomAvatar = (props: any) => {
  return (
    <View>
      <Image
        source={{ uri: props.currentMessage.user.avatar }}
        style={{ width: 40, height: 40, borderRadius: 20 }}
      />
    </View>
  );
};

// カスタム送信
const CustomSend = (props: any) => {
  return (
    <Send {...props}>
      <View style={{backgroundColor:"#007AFF",borderRadius:8,padding:8}}>
        <Text style={{color:"white",fontWeight:"bold"}}>送信</Text>
      </View>
    </Send>
  );
};

//メッセージ入力欄の横
const CustomActions = (props: any) => {
  return (
    <Actions
      {...props}
      options={{
        'Copy Text': (props:any) => {
          Clipboard.setStringAsync(props.currentMessage.text);
        },
        "Delete": () => {},
        'Cancel': () => {
          console.log("Cancel");
        },
      }}
      optionTintColor="#222B45"
    />
  )
}

//システムメッセージをカスタム
const CustomSystemMessage = (props: any) => {
  return (
    <SystemMessage
      {...props}
      containerStyle={{
      }}
      textStyle={{
        color: "gray",
        fontSize: 14,
      }}
    />
  );
};

const handleLongPress = (context:any, message:any) => {
  const options = ['コピー', 'キャンセル'];
  const cancelButtonIndex = options.length - 1;
  context.actionSheet().showActionSheetWithOptions(
    {
      options,
      cancelButtonIndex,
    },
    (buttonIndex:any) => {
      switch (buttonIndex) {
        case 0:
          Clipboard.setStringAsync(message.text);
          console.log('コピー', 'メッセージがクリップボードにコピーされました');
          break;
        // 他のオプションを追加する場合はここにケースを追加
      }
    }
  );
};


export default function Chat({route}: RootStackScreenProps<'ChatScreen'>) {
  const dispatch: AppDispatch = useDispatch();
  const db = useSQLiteContext();
  const [messages, setMessages] = useState<IMessage[]>([]); // メッセージリスト
  const addParticipant = useSelector((state: RootState) => state.overlay.addparticipant);

  // メッセージリストの取得
  const messagesList = useSelector((state: RootState) => state.messageslist);
  const participants = useSelector((state: RootState) => state.participantsinfo.participants);
  useEffect(() => {
    const raw_msg_list = messagesList.messages[route.params.roomid]
    const msg_list: IMessage[] = [];
    if (raw_msg_list !== undefined) {
      for (const msg of raw_msg_list) {
        if (msg.type === "text") {
          msg_list.push({
            _id: msg.id,
            text: msg.content,
            createdAt: parse(msg.created_at,'yyyy-MM-dd HH:mm:ss.SSSSSSXXX',new Date()),
            user: {
              _id: msg.sender_id,
              name: userdata.id===msg.sender_id ? userdata.name : participants[msg.sender_id].name,
              avatar: userdata.id===msg.sender_id ? URL+userdata.avatar_path : URL+participants[msg.sender_id].avatar_path,
            },
          });
        }else if (msg.type === "system") {
          msg_list.push({
            system: true,
            _id: msg.id,
            text: msg.content,
            createdAt: parse(msg.created_at,'yyyy-MM-dd HH:mm:ss.SSSSSSXXX',new Date()),
            user: {
              _id: msg.sender_id,
            },
          });
        }
    }
    }
    setMessages(msg_list);
  }, [messagesList]);

  //チャット画面のフォーカス、アンフォーカス時の処理
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      dispatch(setFocusRoom(route.params.roomid));
      focusChatRoom(db ,dispatch, route.params.roomid, messagesList?.new_messages);
    }else{
      dispatch(setFocusRoom(""));
      console.log('ChatHomeScreen is not focused');
    }
  }, [isFocused]);

  // 送信ボタン押下時に呼ばれる
  const onSend = async(newMessages: IMessage[] = []) => {
    // ユーザーメッセージの追加
    newMessages[0].createdAt = parse(format(new Date(), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'}), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",new Date());
    const message:MessageInterface = {
      id: newMessages[0]._id as string,
      sender_id: newMessages[0].user._id as string,
      type: "text",
      content: newMessages[0].text,
      created_at: format(newMessages[0].createdAt, "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'}),
    };
    dispatch(setSendMessage({roomid: route.params.roomid, message: message}));
    await db.runAsync(`INSERT INTO messages 
            (id, room_id, sender_id, type, content, created_at) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
          [message.id, route.params.roomid, message.sender_id, message.type, message.content, 
            format(new Date(), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'})]);
    const result = await dispatch(sendWebSocketMessage({"type":"SendMessage","content":{
      "roomid": route.params.roomid,
      "type": "text",
      "message": message.content
    }}));
    const response:any = unwrapResult(result);
    if (response.content?.message === "Message sent"){
      console.log("メッセージを送信しました");
    }else{
      console.error("メッセージの送信に失敗しました",response);
    }
  };

  // 自分のユーザー情報
  const userdata = useSelector((state: RootState) => state.userdata.userdata);
  const user = {
    _id: userdata.id,
    name: userdata.name,
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <GiftedChat
          messages={messages}
          placeholder="メッセージを入力"
          onSend={messages => onSend(messages)}
          user={user}
          locale="ja"
          renderAvatar={(props) => <CustomAvatar {...props} />}
          renderSend={(props) => <CustomSend {...props} />}
          renderActions={(props) => <CustomActions {...props} />}
          //renderMessageText={(props) => <CustomMessageText {...props} />}
          onLongPress={(context, message) => handleLongPress(context, message)}
          timeFormat='HH:mm'
          dateFormat='YYYY年MM月DD日'
          //renderDay={(props) => <CustomRenderDay {...props} />}
          renderSystemMessage={(props) => <CustomSystemMessage {...props} />}
        />
      </SafeAreaView>
      <Overlay isVisible={addParticipant} overlayStyle={{width: "90%", height: "70%"}}
      onBackdropPress={() => dispatch(setAddParticipant(false))}>
        <AddParticipantScreen id={route.params.roomid} />
      </Overlay>
    </>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
});