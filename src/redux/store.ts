import { configureStore } from "@reduxjs/toolkit";
import badgeReducer from "./badgeSlice";
import loginfffffReducer from "./loginStatusSlice";//適当でもいい
import userDataSlice from "./userDataSlice";
import deviceidSlice from "./deviceidSlice";

export const store = configureStore({
  reducer: {
    badge: badgeReducer,
    statusnames: loginfffffReducer,
    userdata: userDataSlice,
    deviceid: deviceidSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;