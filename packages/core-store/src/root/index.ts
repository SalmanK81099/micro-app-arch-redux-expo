import { configureStore, Middleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { userSlice, mainApi } from '../slices/user';
import { mobileSlice } from '../slices/mobile';
import {
  paymentsReducer,
  paymentsMiddleware,
} from '@micro/features-payments/src/store/index';
import {
  supportReducer,
  supportMiddleware,
} from '@micro/features-support/src/store/index';

// Custom middleware for logging
const loggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  console.group(`🎯 Main App Action: ${action.type}`);
  console.log('Previous State:', store.getState());
  console.log('Action:', action);
  const result = next(action);
  console.log('Next State:', store.getState());
  console.groupEnd();
  return result;
};

// Create the root store combining all reducers
export const store = configureStore({
  reducer: {
    mobile: mobileSlice.reducer,
    user: userSlice.reducer,
    [mainApi.reducerPath]: mainApi.reducer,
    ...paymentsReducer,
    ...supportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      mainApi.middleware,
      paymentsMiddleware,
      supportMiddleware,
      loggerMiddleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export everything from slices
export * from '../slices/user';
export * from '../slices/mobile';
export * from '@micro/features-payments';
export * from '@micro/features-support';
