import React, { createRef, useEffect, useRef, useState } from "react";
import { Text, StyleSheet, TextInput } from "react-native";
import { Button, Input, Input as BaseInput } from '@rneui/base';
import { login, LoginJsonInterface, register, RegisterJsonInterface, } from './../api/api';
import { useBooleanContext } from "../context/LoginStatusContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { NativeStackScreenProps } from "react-native-screens/lib/typescript/native-stack/types";
import { setUserDataAsync, setUserDataInterface } from "../redux/userDataSlice";
import { setErrorMessage } from "../redux/authErrorSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import * as EmailValidator from 'email-validator';
import * as SecureStore from 'expo-secure-store';

type RootStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, Screen>;

const Stack = createStackNavigator<RootStackParamList>();

function RegisterScreen({route, navigation}:RootStackScreenProps<"Register">) {
  const [mailAddress, setMailAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error_message, setError_message] = useState("");
  const [mailAddress_error, setMailAddress_error] = useState("");
  const [username_error, setUsername_error] = useState("");
  const [password_error, setPassword_error] = useState("");
  const [isPressed, setIsPressed] = useState(false);

  const changeMailAddress = (text: string) => {
    setMailAddress(text);
    setError_message("");
    setMailAddress_error("");
    if (!EmailValidator.validate(text) && text !== "") {
      setMailAddress_error("メールアドレスの形式が正しくありません");
    }
  };
  const changeUsername = (text: string) => {
    setUsername(text);
    setError_message("");
    setUsername_error("");
  };
  const changePassword = (text: string) => {
    setPassword(text);
    setError_message("");
    setPassword_error("");
    let error:string[] = [];
    if (/[^A-Za-z0-9!@#$%^&*()_+=\-[\]{};':"|,.<>/?~`]/.test(text)) {
      error.push("半角英数字もしくは記号以外の文字が含まれています");
    }
    if (text.length < 8) {
      error.push("パスワードは8文字以上で入力してください");
    }
    if (text.length > 32) {
      error.push("パスワードは32文字以下で入力してください");
    }
    if (/[A-Z]/.test(text) === false) {
      error.push("半角大文字を１文字以上含めてください");
    }
    if (/[a-z]/.test(text) === false) {
      error.push("半角小文字を１文字以上含めてください");
    }
    if (/[0-9]/.test(text) === false) {
      error.push("数字を１文字以上含めてください");
    }
    if (text === ""){
      //最初はエラーメッセージ非表示
      error = [];
    }
    let error_str:string = "";
    for (let i = 0; i < error.length; i++) {
      if( i !== error.length-1 ){
        error_str += error[i] + "\n";
      } else {
        error_str += error[i];
      }
    }
    setPassword_error(error_str);
  };
  const { setValue } = useBooleanContext();
  const dispatch: AppDispatch = useDispatch();
  const deviceid = useSelector((state: RootState) => state.deviceid);
  
  const mailAddress_input = useRef<BaseInput & TextInput>(null);
  const username_input = useRef<BaseInput & TextInput>(null);
  
  const sendJson: RegisterJsonInterface = {
    email: mailAddress,
    username: username,
    password: password,
    deviceid: deviceid.deviceid,
    fcmtoken: SecureStore.getItem('FCMToken') || "",
  };

  /*useEffect(() => {
    console.log("RegisterScreen useEffect:",userdata.userdata);
    //setValue(true);
  },[userdata.userdata]);*/

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize:24,alignSelf:"center",justifyContent:"center",margin:30}}>新規登録</Text>
        <Input
          ref={mailAddress_input}
          containerStyle={styles.textContainer}
          placeholder="メールアドレス"
          errorMessage={mailAddress_error}
          errorStyle={{fontSize:15}}
          inputContainerStyle={styles.textInputContainer}
          value={mailAddress}
          onChangeText={changeMailAddress}
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          ref={username_input}
          containerStyle={styles.textContainer}
          placeholder="ユーザーネーム"
          errorMessage={username_error}
          errorStyle={{fontSize:15}}
          inputContainerStyle={styles.textInputContainer}
          value={username}
          onChangeText={changeUsername}
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          containerStyle={styles.textContainer}
          placeholder="パスワード"
          errorMessage={password_error}
          errorStyle={{fontSize:15}}
          inputContainerStyle={styles.textInputContainer}
          value={password}
          onChangeText={changePassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button
          title="アカウントを作成"
          disabled={isPressed || mailAddress==="" || username==="" || password==="" || password_error!=="" || mailAddress_error !== "" ? true : false}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          onPress={async() => {
            setIsPressed(true);
            const [status,res] = await register(sendJson);
            if (status === 201) {
                console.log("Register success",res["detail"],"\n",res["access_token"],"\n",res["refresh_token"]);
                //await saveToken(res,username);
                //console.log("dispatch start:",userdata.userdata);
                const res_data: setUserDataInterface = {
                    name: username,
                    id: res["user_id"],
                    avatar_path: res["avatar_path"],
                    access_token: res["access_token"],
                    access_token_expires: res["access_token_expires"],
                    refresh_token: res["refresh_token"],
                    refresh_token_expires: res["refresh_token_expires"]
                };
                await dispatch(setUserDataAsync(res_data))
                .then(() => {
                  console.log("Register setUserDataAsync was end");
                  setValue(false);
                  setValue(true);
                });
            }else if(status === 400){
                for (const e of res["detail"]) {
                    console.log(e);
                }
                setError_message("入力内容に誤りがあります");
                setIsPressed(false);
            }else if(status === 409){
                if (res["detail"] === "Email already registered") {
                    mailAddress_input.current?.shake();
                    setMailAddress_error("メールアドレスが既に登録されています");
                    console.log("メールアドレスが既に登録されています");
                }else{
                    setError_message("不明なエラーが発生しました");
                    console.log("不明なエラーが発生しました",res["detail"]);
                }
                setIsPressed(false);
            }else{
                setError_message("不明なエラーが発生しました");
                console.log("不明なエラーが発生しました",res["detail"]);
                setIsPressed(false);
            }
          }}
        />
        <Text style={{alignSelf:"center",color:"red",margin:15,fontSize:20}}>{error_message}</Text>
        <Button
          title="作成済みのアカウントでログイン"
          type="outline"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          onPress={() => {
            navigation.navigate("Login");
          }}
        />
    </SafeAreaView>
  )
}

function LoginScreen ({route, navigation}:RootStackScreenProps<"Login">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username_error, setUsername_error] = useState("");
    const [password_error, setPassword_error] = useState("");
    const [isPressed, setIsPressed] = useState(false);

    const username_input = useRef<BaseInput & TextInput>(null);
    const password_input = useRef<BaseInput & TextInput>(null);

    const { setValue } = useBooleanContext();
    const dispatch: AppDispatch = useDispatch();
    //const userdata = useSelector((state: RootState) => state.userdata);
    const deviceid = useSelector((state: RootState) => state.deviceid);
    const auth_error = useSelector((state: RootState) => state.auth_error);

    const sendJson: LoginJsonInterface = {
        email: email,
        password: password,
        deviceid: deviceid.deviceid,
        fcmtoken: SecureStore.getItem('FCMToken') || "",
    };

    const changeEmail = (text: string) => {
        setEmail(text);
        dispatch(setErrorMessage(""));
        setUsername_error("");
    };
    const changePassword = (text: string) => {
        setPassword(text);
        dispatch(setErrorMessage(""));
        setPassword_error("");
    }

    /*useEffect(() => {
      console.log("LoginScreen useEffect:",userdata.userdata);
      //setValue(true);
    },[userdata.userdata]);*/

    return (
      <SafeAreaView style={styles.container}>
          <Text style={{fontSize:24,alignSelf:"center",justifyContent:"center",margin:30}}>ログイン</Text>
          <Input
            ref={username_input}
            containerStyle={styles.textContainer}
            placeholder="メールアドレス"
            errorMessage={username_error}
            errorStyle={{fontSize:15}}
            inputContainerStyle={styles.textInputContainer}
            value={email}
            onChangeText={changeEmail}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            ref={password_input}
            containerStyle={styles.textContainer}
            placeholder="パスワード"
            errorMessage={password_error}
            errorStyle={{fontSize:15}}
            inputContainerStyle={styles.textInputContainer}
            value={password}
            onChangeText={changePassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            title="ログイン"
            disabled={ isPressed || email==="" || password==="" ? true : false }
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            onPress={async() => {
              setIsPressed(true);
              const [status,res] = await login(sendJson);
              if (status === 200) {
                  console.log("Login success",res["detail"],"\n",res["access_token"],"\n",res["refresh_token"]);
                  //await saveToken(res,username);
                  //console.log("dispatch start:",userdata.userdata);
                  const res_data: setUserDataInterface = {
                      name: res["user_name"],
                      id: res["user_id"],
                      avatar_path: res["avatar_path"],
                      access_token: res["access_token"],
                      access_token_expires: res["access_token_expires"],
                      refresh_token: res["refresh_token"],
                      refresh_token_expires: res["refresh_token_expires"]
                  };
                  await dispatch(setUserDataAsync(res_data))
                  .then(() => {
                      console.log("Login setUserDataAsync was end");
                      setValue(false);
                      setValue(true);
                  });
              }else if(status === 401){
                  username_input.current?.shake();
                  setUsername_error("メールアドレスが登録されていません");
                  console.log("メールアドレスが登録されていません:",res["detail"]);
                  setIsPressed(false);
              }else if(status === 403){
                  password_input.current?.shake();
                  setPassword_error("パスワードが正しくありません");
                  console.log("パスワードが正しくありません",res["detail"]);
                  setIsPressed(false);
              }else{
                  dispatch(setErrorMessage("不明なエラーが発生しました"));
                  console.log("不明なエラーが発生しました",status,res["detail"]);
                  setIsPressed(false);
              }
            }}
          />
          <Text style={{alignSelf:"center",color:"red",margin:15,fontSize:20}}>{auth_error.error_message}</Text>
          <Button
            title="新しいアカウントを作成"
            type="outline"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            onPress={() => {
              navigation.navigate("Register");
            }}
          />
      </SafeAreaView>
  );
}

function LoginHomeScreen() {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
}

const styles = StyleSheet.create({
  buttonContainer: {
    //backgroundColor: "red",
    width: "85%",
    alignSelf: "center",
    justifyContent: "center",
  },
  button: {
    //backgroundColor: "yellow",
    //borderWidth: 1,
    margin:1,//ボーダーがつぶれないように
    borderRadius: 20,
  },
  textContainer: {
    width: "85%",
    alignSelf: "center",
    justifyContent: "center",
    //backgroundColor: "green",
    marginTop: 20,
  },
  textInputContainer: {
    //backgroundColor: "yellow",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: "gray",
    borderRadius: 10,
    borderWidth: 1,
  },
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignSelf: "center",
    flex: 1,
  },
});

export default LoginHomeScreen;