import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  supportSlice,
  supportApi,
  supportReducer,
  supportMiddleware,
} from './index';

// Create a standalone store for the support app
const supportStore = configureStore({
  reducer: supportReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(supportMiddleware),
});

export const SupportStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <Provider store={supportStore}>{children}</Provider>;
};
