import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import notificationSlice from "./notificationSlice"; 

const rootReducer = combineReducers({
  auth: authSlice,
  notifications: notificationSlice, 
});

export default rootReducer;
