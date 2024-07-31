import { configureStore } from "@reduxjs/toolkit";
import badgeReducer from "./badgeSlice";
import userDataSlice from "./userDataSlice";
import deviceidSlice from "./deviceidSlice";
import authErrorSlice from "./authErrorSlice";

export const store = configureStore({
  reducer: {
    badge: badgeReducer,
    userdata: userDataSlice,
    deviceid: deviceidSlice,
    auth_error: authErrorSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;