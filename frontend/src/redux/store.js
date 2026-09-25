import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import skillReducer from './slices/skillSlice';
import sessionReducer from './slices/sessionSlice';
import walletReducer from './slices/walletSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillReducer,
    sessions: sessionReducer,
    wallet: walletReducer,
    notifications: notificationReducer
  }
});

export default store;
