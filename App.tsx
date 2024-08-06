import React, { Suspense, useEffect, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import * as SQLite from 'expo-sqlite';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import Switcher from './src/screens/switcher';
import { BooleanProvider } from './src/context/LoginStatusContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/database/database';

const db = SQLite.openDatabaseSync('SQLiteDB.db');//データベースの読み込み
let Initialized = false;

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // データベースの初期化処理
    const initialize = async () => {
      try {
        await initializeDatabase(db)
        .then(() => {console.log('Table initialized');})
      } catch (error) {
        console.error('Error initializing table', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!Initialized){
      Initialized = true;
      initialize();
    }
  }, []);


  if(isLoading){//データベースが読み込まれるまでローディング画面表示 失敗時は長く表示
    return (
      <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
        <ActivityIndicator size={100} />
      </View>
    );
  }
  return (
      <Suspense fallback={
        // ローディング画面　巨大データロード時にその間だけ表示　普段は表示されない(短時間のため)
        <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
          <ActivityIndicator size={100} />
        </View>
      }>
        <Provider store={store}>
            <SQLite.SQLiteProvider databaseName="SQLiteDB.db">
              <BooleanProvider>
                <SafeAreaProvider>
                  <Switcher />
                </SafeAreaProvider>
              </BooleanProvider>
            </SQLite.SQLiteProvider>
        </Provider>
      </Suspense>
  );
}