import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface MobileState {
  theme: 'light' | 'dark';
  isOnline: boolean;
}

const initialState: MobileState = {
  theme: 'light',
  isOnline: true,
};

export const mobileSlice = createSlice({
  name: 'mobile',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      console.log('🎨 Theme Changed:', action.payload);
      state.theme = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      console.log('🌐 Online Status Changed:', action.payload);
      state.isOnline = action.payload;
    },
  },
});

export const { setTheme, setOnlineStatus } = mobileSlice.actions;
