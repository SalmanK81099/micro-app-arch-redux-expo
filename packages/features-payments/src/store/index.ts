import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  details: Record<string, any>;
  isDefault: boolean;
}

export interface PaymentSettings {
  currency: string;
  autoPayEnabled: boolean;
  paymentThreshold: number;
}

// RTK Query API definitions
export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/payments',
    prepareHeaders: (headers) => {
      console.log('💳 Payments API Request Headers:', headers);
      return headers;
    },
  }),
  tagTypes: ['Transaction', 'PaymentMethod'],
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], void>({
      query: () => 'transactions',
      providesTags: ['Transaction'],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log('💰 Transactions Fetched:', data);
        } catch (error) {
          console.error('❌ Error fetching transactions:', error);
        }
      },
    }),
    addTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (body) => ({
        url: 'transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Transaction'],
      onQueryStarted: async (transaction, { queryFulfilled }) => {
        console.log('💸 Adding Transaction:', transaction);
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Transaction Added:', data);
        } catch (error) {
          console.error('❌ Error adding transaction:', error);
        }
      },
    }),
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => 'payment-methods',
      providesTags: ['PaymentMethod'],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log('💳 Payment Methods Fetched:', data);
        } catch (error) {
          console.error('❌ Error fetching payment methods:', error);
        }
      },
    }),
  }),
});

// Transactions Slice
interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const transactionsInitialState: TransactionsState = {
  transactions: [],
  loading: false,
  error: null,
};

export const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: transactionsInitialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('⏳ Transactions Loading:', action.payload);
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.log('❌ Transactions Error:', action.payload);
      state.error = action.payload;
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      console.log('💰 Setting Transactions:', action.payload);
      state.transactions = action.payload;
    },
  },
});

// Payment Methods Slice
interface PaymentMethodsState {
  methods: PaymentMethod[];
  loading: boolean;
  error: string | null;
}

const paymentMethodsInitialState: PaymentMethodsState = {
  methods: [],
  loading: false,
  error: null,
};

export const paymentMethodsSlice = createSlice({
  name: 'paymentMethods',
  initialState: paymentMethodsInitialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('⏳ Payment Methods Loading:', action.payload);
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.log('❌ Payment Methods Error:', action.payload);
      state.error = action.payload;
    },
    setPaymentMethods: (state, action: PayloadAction<PaymentMethod[]>) => {
      console.log('💳 Setting Payment Methods:', action.payload);
      state.methods = action.payload;
    },
  },
});

// Settings Slice
interface SettingsState {
  settings: PaymentSettings;
  loading: boolean;
  error: string | null;
}

const settingsInitialState: SettingsState = {
  settings: {
    currency: 'USD',
    autoPayEnabled: false,
    paymentThreshold: 0,
  },
  loading: false,
  error: null,
};

export const settingsSlice = createSlice({
  name: 'paymentSettings',
  initialState: settingsInitialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('⏳ Payment Settings Loading:', action.payload);
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.log('❌ Payment Settings Error:', action.payload);
      state.error = action.payload;
    },
    updateSettings: (
      state,
      action: PayloadAction<Partial<PaymentSettings>>
    ) => {
      console.log('⚙️ Updating Payment Settings:', action.payload);
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

// Export actions
export const {
  setLoading: setTransactionsLoading,
  setError: setTransactionsError,
  setTransactions,
} = transactionsSlice.actions;

export const {
  setLoading: setPaymentMethodsLoading,
  setError: setPaymentMethodsError,
  setPaymentMethods,
} = paymentMethodsSlice.actions;

export const {
  setLoading: setSettingsLoading,
  setError: setSettingsError,
  updateSettings,
} = settingsSlice.actions;

export const {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useGetPaymentMethodsQuery,
} = paymentsApi;

// Export reducers and middleware for the root store
export const paymentsReducer = {
  transactions: transactionsSlice.reducer,
  paymentMethods: paymentMethodsSlice.reducer,
  paymentSettings: settingsSlice.reducer,
  [paymentsApi.reducerPath]: paymentsApi.reducer,
};

export const paymentsMiddleware = paymentsApi.middleware;
