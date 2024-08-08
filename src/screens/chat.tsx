import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Actions, Avatar, GiftedChat, IMessage, Send } from 'react-native-gifted-chat';
import * as Crypto from 'expo-crypto';
import * as Clipboard from 'expo-clipboard';
import { RootStackScreenProps } from './chathome';

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
  const [messages, setMessages] = useState<IMessage[]>([]); // メッセージリスト
  console.log(route.params)
  // アシスタントメッセージの作成
  const reply = (): IMessage => {
    return {
      _id: Crypto.randomUUID(),
      text: "こんにちは！",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: "Assistant",
        avatar: "https://ui-avatars.com/api/?background=0dbc3f&color=FFF&name=A",
      },
    };
  };

  // 送信ボタン押下時に呼ばれる
  const onSend = (newMessages: IMessage[] = []) => {
    // ユーザーメッセージの追加
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    // アシスタントメッセージの追加 dev
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [reply()])
    );
  };

  // 自分のユーザー情報
  const user = {
    _id: 1,
    name: "User",
  };

  return (
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
        
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
    },
});