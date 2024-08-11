import { createSlice } from "@reduxjs/toolkit";
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';

export interface deviceidInterface {
    deviceid:{
        deviceid: string;
    }
}

function getDeviceID() {
    console.log("getting DeviceID...");
    const id = SecureStore.getItem('deviceid');
    if (id === undefined || id === null) {
        //デバイスIDが設定されてない＝初回起動時
        const generatedID = Device.osName+"$"+Device.brand+"$"+Device.modelName+"$"+Crypto.randomUUID();
        console.log("ようこそ\n",generatedID);
        SecureStore.setItemAsync('deviceid',generatedID);
        return generatedID;
    }
    return id as string;
}

const deviceid: string = getDeviceID();

export const deviceidSlice = createSlice({
    name: 'deviceid',
    initialState: {
        deviceid: deviceid
    },
    reducers: {}
})

export default deviceidSlice.reducer;