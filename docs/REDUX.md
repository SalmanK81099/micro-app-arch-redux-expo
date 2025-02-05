# Redux Store Technical Documentation

## Package Structure

```
packages/
  ├── core-store/                 # Core store package
  │   ├── src/
  │   │   ├── slices/            # Core slices
  │   │   │   ├── user/          # User management
  │   │   │   └── mobile/        # UI/Theme management
  │   │   └── root/              # Root store configuration
  │   └── package.json
  │
  ├── features-support/           # Support feature package
  │   ├── src/
  │   │   ├── store/             # Support store
  │   │   │   ├── slices/        # Support-specific slices
  │   │   │   └── index.ts       # Store exports
  │   │   └── providers/         # Store providers
  │   └── package.json
  │
  └── features-payments/          # Payments feature package
      ├── src/
      │   ├── store/             # Payments store
      │   │   ├── slices/        # Payment-specific slices
      │   │   └── index.ts       # Store exports
      │   └── providers/         # Store providers
      └── package.json
```

## Core Store Implementation

### Store Configuration (`core-store/src/root/index.ts`)

```typescript
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
```

### User Slice (`core-store/src/slices/user/index.ts`)

```typescript
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});
```

## Feature Store Implementation

### Support Store (`features-support/src/store/index.ts`)

```typescript
export const supportApi = createApi({
  reducerPath: 'supportApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/support' }),
  tagTypes: ['Ticket'],
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => 'tickets',
      providesTags: ['Ticket'],
    }),
    // ... other endpoints
  }),
});

export const supportReducer = {
  tickets: ticketsSlice.reducer,
  [supportApi.reducerPath]: supportApi.reducer,
};
```

### Payments Store (`features-payments/src/store/index.ts`)

```typescript
export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/payments' }),
  tagTypes: ['Transaction', 'PaymentMethod'],
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], void>({
      query: () => 'transactions',
      providesTags: ['Transaction'],
    }),
    // ... other endpoints
  }),
});

export const paymentsReducer = {
  transactions: transactionsSlice.reducer,
  paymentMethods: paymentMethodsSlice.reducer,
  settings: settingsSlice.reducer,
  [paymentsApi.reducerPath]: paymentsApi.reducer,
};
```

## Store Provider Implementation

### Core Store Provider (`core-store/src/index.ts`)

```typescript
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <Provider store={store}>{children}</Provider>;
};
```

### Combined Store Provider (`features-support/src/providers/CombinedStoreProvider.tsx`)

```typescript
export const CombinedStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <StoreProvider>
      <SupportStoreProvider>{children}</SupportStoreProvider>
    </StoreProvider>
  );
};
```

## Type Definitions

### Core Store Types

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    language: string;
    notifications: boolean;
  };
}

export interface MobileState {
  theme: 'light' | 'dark';
  isOnline: boolean;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Support Store Types

```typescript
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'in-progress';
  createdAt: string;
}

export interface SupportRootState {
  tickets: ReturnType<typeof ticketsSlice.reducer>;
  [supportApi.reducerPath]: ReturnType<typeof supportApi.reducer>;
}
```

## Custom Hooks

### Core Store Hooks

```typescript
export const useMainAppUser = () => {
  const user = useAppSelector((state) => state.user.user);
  return { user };
};

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Feature Store Hooks

```typescript
// Support hooks
export const useTickets = () => {
  const tickets = useAppSelector((state) => state.tickets.items);
  const isLoading = useAppSelector((state) => state.tickets.loading);
  const error = useAppSelector((state) => state.tickets.error);
  return { tickets, isLoading, error };
};

// Payments hooks
export const useTransactions = () => {
  const transactions = useAppSelector(
    (state) => state.transactions.transactions
  );
  const isLoading = useAppSelector((state) => state.transactions.loading);
  const error = useAppSelector((state) => state.transactions.error);
  return { transactions, isLoading, error };
};
```

## Debug Logging

The store implements comprehensive logging using the custom middleware:

```typescript
const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.group(`🎯 Main App Action: ${action.type}`);
  console.log('Previous State:', store.getState());
  console.log('Action:', action);
  const result = next(action);
  console.log('Next State:', store.getState());
  console.groupEnd();
  return result;
};
```

## Performance Considerations

1. **Memoization**

   - Use `createSelector` for complex selectors
   - Memoize callbacks with `useCallback`
   - Use `useMemo` for expensive computations

2. **State Structure**

   - Keep state normalized
   - Avoid deep nesting
   - Use proper TypeScript types

3. **RTK Query**
   - Proper cache invalidation
   - Optimistic updates
   - Automatic background refetching

## Testing

### Unit Tests

```typescript
describe('userSlice', () => {
  it('should handle setUser', () => {
    const initialState = { user: null, loading: false, error: null };
    const user = { id: '1', name: 'Test User' };
    const nextState = userSlice.reducer(
      initialState,
      userSlice.actions.setUser(user)
    );
    expect(nextState.user).toEqual(user);
  });
});
```

### Integration Tests

```typescript
describe('Support Store', () => {
  it('should handle createTicket', async () => {
    const store = configureStore({
      reducer: supportReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(supportApi.middleware),
    });

    await store.dispatch(
      supportApi.endpoints.createTicket.initiate({
        title: 'Test Ticket',
        description: 'Test Description',
      })
    );

    const state = store.getState();
    expect(state.tickets.items).toHaveLength(1);
  });
});
```
