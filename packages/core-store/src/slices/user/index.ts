import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../root';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    language: string;
    notifications: boolean;
  };
}

// Main app API
export const mainApi = createApi({
  reducerPath: 'mainApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      console.log('🌐 Main API Request Headers:', headers);
      return headers;
    },
  }),
  tagTypes: ['User', 'Preferences'],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => 'user/me',
      providesTags: ['User'],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log('👤 Current User Data Fetched:', data);
        } catch (error) {
          console.error('❌ Error fetching user:', error);
        }
      },
    }),
    updateUserPreferences: builder.mutation<User, Partial<User['preferences']>>(
      {
        query: (preferences) => ({
          url: 'user/preferences',
          method: 'PATCH',
          body: preferences,
        }),
        invalidatesTags: ['User', 'Preferences'],
        onQueryStarted: async (preferences, { queryFulfilled }) => {
          console.log('⚙️ Updating User Preferences:', preferences);
          try {
            const { data } = await queryFulfilled;
            console.log('✅ User Preferences Updated:', data);
          } catch (error) {
            console.error('❌ Error updating preferences:', error);
          }
        },
      }
    ),
  }),
});

// User slice
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      console.log('👤 Setting User:', action.payload);
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('⏳ User Loading State:', action.payload);
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.log('❌ User Error State:', action.payload);
      state.error = action.payload;
    },
  },
});

// Exports
export const { setUser, setLoading, setError } = userSlice.actions;
export const { useGetCurrentUserQuery, useUpdateUserPreferencesMutation } =
  mainApi;

// Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper hook for micro apps to access user data
export const useMainAppUser = () => {
  const user = useAppSelector((state) => state.user.user);
  console.log('🔄 Micro App Accessing User Data:', user);
  return { user };
};

// Helper to invalidate main app queries from micro apps
export const invalidateMainAppTags = (tags: Array<'User' | 'Preferences'>) => {
  console.log('🔄 Invalidating Main App Tags:', tags);
  mainApi.util.invalidateTags(tags);
};
