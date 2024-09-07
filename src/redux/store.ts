import { configureStore } from "@reduxjs/toolkit";
import userDataSlice from "./userDataSlice";
import deviceidSlice from "./deviceidSlice";
import authErrorSlice from "./authErrorSlice";
import webSocketReducer from './webSocketSlice';
import roomsInfoSlice from "./roomsInfoSlice";
import participantsInfoSlice from "./participantsInfoSlice";
import messagesListSlice from "./messagesListSlice";
import overlaySlice from "./overlaySlice";
import scheduleSlice from "./scheduleSlice";
import isShownButtonSlice from "./isShownButtonSlice";

export const store = configureStore({
  reducer: {
    userdata: userDataSlice,
    deviceid: deviceidSlice,
    auth_error: authErrorSlice,
    webSocket: webSocketReducer,
    roomsinfo: roomsInfoSlice,
    participantsinfo: participantsInfoSlice,
    messageslist: messagesListSlice,
    overlay: overlaySlice,
    schedule: scheduleSlice,
    isShownButton: isShownButtonSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false/*{
        // Ignore these action types
        ignoredActions: ['schedule/setSchedules'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload']
      },*/
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;