# Micro App Architecture Demo

This project demonstrates a micro-frontend architecture using React Native with Redux Toolkit for state management.

## Store Architecture

The project uses a hierarchical Redux store setup with the following structure:

### Core Store (`@micro/core-store`)

The core store serves as the main state management solution for the application. It provides:

- Global user state management
- Theme and UI preferences
- Core API integration
- Shared utilities for micro apps

```typescript
// Core store structure
{
  user: {
    user: User | null;
    loading: boolean;
    error: string | null;
  },
  mobile: {
    theme: 'light' | 'dark';
    isOnline: boolean;
  }
}
```

### Micro App Stores

Each micro app has its own Redux store that can work both independently and as part of the main app.

#### Support App Store (`@micro/features-support`)

```typescript
// Support store structure
{
  tickets: {
    items: Ticket[];
    loading: boolean;
    error: string | null;
  }
}
```

#### Payments App Store (`@micro/features-payments`)

```typescript
// Payments store structure
{
  transactions: {
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
  },
  paymentMethods: {
    methods: PaymentMethod[];
    loading: boolean;
    error: string | null;
  },
  settings: {
    settings: PaymentSettings;
    loading: boolean;
    error: string | null;
  }
}
```

## Store Integration

### 1. Provider Setup

The stores are integrated using a hierarchical provider setup:

```tsx
// Main App
<StoreProvider>
  <App />
</StoreProvider>

// Support App
<CombinedStoreProvider> // Combines core and support stores
  <SupportApp />
</CombinedStoreProvider>

// Payments App
<CombinedStoreProvider> // Combines core and payments stores
  <PaymentsApp />
</CombinedStoreProvider>
```

### 2. State Access

#### Accessing Core Store State

```typescript
// Using hooks from @micro/core-store
const { user } = useMainAppUser();
const theme = useAppSelector((state) => state.mobile.theme);
```

#### Accessing Micro App State

```typescript
// Using hooks from feature packages
const tickets = useAppSelector((state) => state.tickets.items);
const transactions = useAppSelector((state) => state.transactions.transactions);
```

### 3. RTK Query Integration

Each store includes RTK Query APIs for data fetching:

```typescript
// Core API
const { data: currentUser } = useGetCurrentUserQuery();

// Support API
const { data: tickets } = useGetTicketsQuery();
const [createTicket] = useCreateTicketMutation();

// Payments API
const { data: transactions } = useGetTransactionsQuery();
const [addTransaction] = useAddTransactionMutation();
```

## State Management Features

### 1. Automatic State Sync

- RTK Query automatically updates the store on API calls
- Changes are reflected across all components using the data
- Optimistic updates for better UX

### 2. Error Handling

- Centralized error handling in slices
- Error states propagated to components
- Automatic error clearing on successful operations

### 3. Loading States

- Automatic loading states from RTK Query
- Manual loading state management in slices
- Loading indicators in components

### 4. Debug Logging

All state changes are logged with descriptive emojis:

- 👤 User-related actions
- 🎫 Ticket-related actions
- 💳 Payment-related actions
- ⏳ Loading states
- ❌ Errors

## Usage Examples

### 1. Core Store Usage

```typescript
import { useMainAppUser, useAppSelector } from '@micro/core-store';

const MyComponent = () => {
  const { user } = useMainAppUser();
  const theme = useAppSelector((state) => state.mobile.theme);

  return <View>{/* Component JSX */}</View>;
};
```

### 2. Support Store Usage

```typescript
import {
  useAppSelector,
  useCreateTicketMutation,
} from '@micro/features-support';

const SupportComponent = () => {
  const tickets = useAppSelector((state) => state.tickets.items);
  const [createTicket] = useCreateTicketMutation();

  return <View>{/* Component JSX */}</View>;
};
```

### 3. Payments Store Usage

```typescript
import {
  useAppSelector,
  useAddTransactionMutation,
} from '@micro/features-payments';

const PaymentsComponent = () => {
  const transactions = useAppSelector(
    (state) => state.transactions.transactions
  );
  const [addTransaction] = useAddTransactionMutation();

  return <View>{/* Component JSX */}</View>;
};
```

## Best Practices

1. **State Access**

   - Use typed selectors for type safety
   - Access only needed state portions
   - Use memoized selectors for performance

2. **State Updates**

   - Use RTK Query for API operations
   - Dispatch actions through proper slices
   - Handle optimistic updates when needed

3. **Error Handling**

   - Always handle error states
   - Show user-friendly error messages
   - Clear errors when appropriate

4. **Loading States**
   - Show loading indicators during operations
   - Handle loading states gracefully
   - Prevent duplicate operations

## Development Guidelines

1. **Adding New State**

   - Create a new slice in appropriate package
   - Add proper TypeScript types
   - Include error and loading states
   - Add debug logging

2. **API Integration**

   - Use RTK Query for API calls
   - Define proper tag types for caching
   - Handle success and error cases
   - Update local state appropriately

3. **Testing**
   - Test selectors and reducers
   - Mock API calls in tests
   - Test error and loading states
   - Verify state updates
