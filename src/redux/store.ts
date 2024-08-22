import { configureStore } from "@reduxjs/toolkit";
import badgeReducer from "./badgeSlice";
import userDataSlice from "./userDataSlice";
import deviceidSlice from "./deviceidSlice";
import authErrorSlice from "./authErrorSlice";
import webSocketReducer from './webSocketSlice';
import roomsInfoSlice from "./roomsInfoSlice";
import participantsInfoSlice from "./participantsInfoSlice";
import messagesListSlice from "./messagesListSlice";

export const store = configureStore({
  reducer: {
    badge: badgeReducer,
    userdata: userDataSlice,
    deviceid: deviceidSlice,
    auth_error: authErrorSlice,
    webSocket: webSocketReducer,
    roomsinfo: roomsInfoSlice,
    participantsinfo: participantsInfoSlice,
    messageslist: messagesListSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;