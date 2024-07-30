import React, { Suspense, useEffect, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import {SQLiteProvider} from 'expo-sqlite/next';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Provider} from 'react-redux';
import store from './src/redux/store';
import Switcher from './src/screens/switcher';
import { BooleanProvider } from './src/context/LoginStatusContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const loadDatabase = async () => {  
  const dbName = "mySQLiteDB.db";
  const dbAsset = require('./mySQLiteDB.db');
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if (!fileInfo.exists) {
    console.log('Database does not exist. Copying from asset');
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      {intermediates: true}
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }
}


export default function App() {
  const [dbLoaded,setDbLoaded] = useState<boolean>(false);

  useEffect(() => {//データベースの読み込み 初回にのみ実行
    loadDatabase()
      .then(() => setDbLoaded(true))
      .catch((e) => console.error(e));
  },[]);


  if(!dbLoaded){//データベースが読み込まれるまでローディング画面表示 失敗時は長く表示
    return (
      <View style={{flex:1}}>
        <ActivityIndicator size={"large"} />
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
      <Suspense fallback={
        // ローディング画面　巨大データロード時にその間だけ表示　普段は表示されない(短時間のため)
        <View style={{flex:1}}>
          <ActivityIndicator size={"large"} />
          <Text>Loading...</Text>
        </View>
      }>
        <Provider store={store}>
            <SQLiteProvider databaseName="mySQLiteDB.db" useSuspense>
              <BooleanProvider>
                <SafeAreaProvider>
                  <Switcher />
                </SafeAreaProvider>
              </BooleanProvider>
            </SQLiteProvider>
        </Provider>
      </Suspense>
  );
}