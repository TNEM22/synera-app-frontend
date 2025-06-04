import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import modalReducer from './slices/modalSlice';
import projectReducer from './slices/projectSlice';
import operationReducer from './slices/operationSlice';
import navigationReducer from './slices/navigationSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    modal: modalReducer,
    project: projectReducer,
    operation: operationReducer,
    navigation: navigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
