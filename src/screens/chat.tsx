import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Actions, Bubble, GiftedChat, IMessage, Send, SystemMessage } from 'react-native-gifted-chat';
import * as Clipboard from 'expo-clipboard';
import { RootStackScreenProps } from './chathome';
import { URL } from '../api/config';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { format } from 'date-fns-tz';
import { parse } from 'date-fns';
import { focusMessages, MessageInterface, setSendMessage } from '../redux/messagesListSlice';
import { useIsFocused } from '@react-navigation/native';
import { focusChatRoom } from '../utils/focus';
import { useSQLiteContext } from 'expo-sqlite';
import { sendWebSocketMessage } from '../redux/webSocketSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { setFocusRoom } from '../redux/roomsInfoSlice';
import { setAddParticipant } from '../redux/overlaySlice';
import { Overlay } from '@rneui/themed';
import AddParticipantScreen from './addparticipant';
import { save_messages } from '../database/savemessage';

// カスタムアバター
const CustomAvatar = (props: any) => {
  return (
    <View style={{}}>
      <Image
        source={{ uri: props.currentMessage.user.avatar }}
        style={{ width: 40, height: 40, borderRadius: 20 }}
      />
    </View>
  );
};

// カスタムメッセージバブル
const CustomMessageBubble = (props: any) => {
  return (
    <View style={{}}>
      {props.currentMessage.user._id !== props.user._id ? <Text style={{}}>
        {props.currentMessage.user.name}
      </Text>:<></>}
      <Bubble {...props} />
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


export default function ChatScreen({route}: RootStackScreenProps<'ChatScreen'>) {
  const dispatch: AppDispatch = useDispatch();
  const db = useSQLiteContext();
  const [messages, setMessages] = useState<IMessage[]>([]); // メッセージリスト
  const addParticipant = useSelector((state: RootState) => state.overlay.addparticipant);

  // メッセージリストの取得
  const messagesList = useSelector((state: RootState) => state.messageslist);
  const participants = useSelector((state: RootState) => state.participantsinfo.participants);
  const room_participants = useSelector((state: RootState) => state.roomsinfo.roomsInfo.participants);
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
              name: room_participants[route.params.roomid].includes(msg.sender_id) ? userdata.id===msg.sender_id ? userdata.name : participants[msg.sender_id].name : "unknown",
              avatar: room_participants[route.params.roomid].includes(msg.sender_id) ? userdata.id===msg.sender_id ? URL+userdata.avatar_path : URL+participants[msg.sender_id].avatar_path: URL+"/avatars/users/default.png",
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
    const do_check_focus = async() => {
      if (isFocused) {
        dispatch(setFocusRoom(route.params.roomid));
        dispatch(focusMessages({roomid:route.params.roomid}));
        const result = await dispatch(sendWebSocketMessage({"type":"Focus","content":{"roomid":route.params.roomid}}));
        const response:any = unwrapResult(result);
        if (response.content?.message === "Already focused" || response.content?.message === "Focused"){
          focusChatRoom(db ,dispatch, route.params.roomid, messagesList?.new_messages);
        }else{
          console.error("フォーカスに失敗しました",response.content?.message);
        }
      }else{
        dispatch(setFocusRoom(""));
        const result = await dispatch(sendWebSocketMessage({"type":"UnFocus","content":{"roomid":route.params.roomid}}));
        const response:any = unwrapResult(result);
        if (response.content?.message !== "Already unfocused" && response.content?.message !== "Unfocused"){
          console.error("アンフォーカスに失敗しました",response.content?.message);
        }
      }
    }
    do_check_focus();
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
    const result = await dispatch(sendWebSocketMessage({"type":"SendMessage","content":{
      "roomid": route.params.roomid,
      "type": "text",
      "message": message.content
    }}));
    const response:any = unwrapResult(result);
    if (response.content?.message === "Message sent"){
      console.log("メッセージを送信しました");
      //送信したメッセージを追加
      const sended_message = {
        id: message.id,
        roomid: route.params.roomid,
        senderid: message.sender_id,
        type: message.type,
        text: message.content,
        created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX",{timeZone:'Asia/Tokyo'})
      }
      save_messages(sended_message);
      //既読時間を更新することで突然の切断に対応する
      const roomid = route.params.roomid;
      const result0 = await dispatch(sendWebSocketMessage({"type":"UnFocus","content":{"roomid":roomid}}));
      const response0:any = unwrapResult(result0);
      if (response0.content?.message !== "Already unfocused" && response0.content?.message !== "Unfocused"){
        console.error("アンフォーカスに失敗しました",response0.content?.message);
      }
      const result1 = await dispatch(sendWebSocketMessage({"type":"Focus","content":{"roomid":roomid}}));
      const response1:any = unwrapResult(result1);
      if (response1.content?.message !== "Already focused" && response1.content?.message !== "Focused"){
        console.error("フォーカスに失敗しました",response1.content?.message);
      }
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
      <View style={styles.container}>
        <GiftedChat
          messages={messages}
          placeholder="メッセージを入力"
          onSend={messages => onSend(messages)}
          user={user}
          locale="ja"
          renderAvatar={(props) => <CustomAvatar {...props} />}
          renderSend={(props) => <CustomSend {...props} />}
          //renderActions={(props) => <CustomActions {...props} />}
          //renderMessageText={(props) => <CustomMessageText {...props} />}
          showAvatarForEveryMessage={true}
          renderBubble={(props) => <CustomMessageBubble {...props} />}
          onLongPress={(context, message) => handleLongPress(context, message)}
          timeFormat='HH:mm'
          dateFormat='YYYY年MM月DD日'
          //renderDay={(props) => <CustomRenderDay {...props} />}
          renderAvatarOnTop={true}
          renderSystemMessage={(props) => <CustomSystemMessage {...props} />}
        />
      </View>
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